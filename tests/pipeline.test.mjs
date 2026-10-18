import test from "node:test";
import assert from "node:assert/strict";

// Import modules under test
import {
  isAllowedIngestionUrl,
  SCHOLARSHIP_SOURCES_REGISTRY,
  getSourceById,
} from "../src/lib/source-registry.ts";

import {
  parseAwardAmountValue,
  parseIncomeLimitValue,
  parseMinPercentage,
  evaluateApplicationStatus,
  generateDedupKey,
  extractScholarshipsFromPage,
  normalizeAndValidateRecord,
} from "../src/lib/ingestion-service.ts";

import {
  upsertScholarshipRecord,
} from "../src/lib/db.ts";

import { evaluateScholarshipMatch } from "../src/lib/eligibility-matcher.ts";

// ==========================================
// 1. Source Registry & Security Allowlisting
// ==========================================
test("Source Registry: Contains all 33 required starting URLs", () => {
  assert.equal(SCHOLARSHIP_SOURCES_REGISTRY.length, 33);

  const nsp = getSourceById("nsp-central");
  assert.ok(nsp);
  assert.equal(nsp.startingUrl, "https://scholarships.gov.in");

  const categories = new Set(SCHOLARSHIP_SOURCES_REGISTRY.map((s) => s.category));
  assert.ok(categories.has("government_institutional"));
  assert.ok(categories.has("corporate_foundation"));
  assert.ok(categories.has("international"));
  assert.ok(categories.has("state_portal"));
  assert.ok(categories.has("aggregator"));
});

test("Security: URL allowlisting prevents SSRF and unauthorized hosts", () => {
  // Allowed
  assert.equal(isAllowedIngestionUrl("https://scholarships.gov.in/guidelines"), true);
  assert.equal(isAllowedIngestionUrl("https://www.aicte-india.org/schemes"), true);
  assert.equal(isAllowedIngestionUrl("https://scholarships.reliancefoundation.org"), true);
  assert.equal(isAllowedIngestionUrl("https://mahadbt.maharashtra.gov.in"), true);

  // Disallowed / Malicious / SSRF targets
  assert.equal(isAllowedIngestionUrl("http://localhost:8080/admin"), false);
  assert.equal(isAllowedIngestionUrl("http://169.254.169.254/latest/meta-data"), false);
  assert.equal(isAllowedIngestionUrl("https://evil-hacker.com/steal"), false);
  assert.equal(isAllowedIngestionUrl("javascript:alert(1)"), false);
  assert.equal(isAllowedIngestionUrl("ftp://scholarships.gov.in"), false);
});

// ==========================================
// 2. Normalization: Amounts, Income, Marks
// ==========================================
test("Normalization: Award amounts parse accurately to numeric values", () => {
  assert.equal(parseAwardAmountValue("₹50,000 / year"), 50000);
  assert.equal(parseAwardAmountValue("Rs. 2,00,000 per annum"), 200000);
  assert.equal(parseAwardAmountValue("2 Lakhs per year"), 200000);
  assert.equal(parseAwardAmountValue("1.5 Lakh"), 150000);
  assert.equal(parseAwardAmountValue("Tuition fee waiver"), 0);
  assert.equal(parseAwardAmountValue(""), 0);
});

test("Normalization: Income limits parse correctly to INR values", () => {
  assert.equal(parseIncomeLimitValue("Family income up to ₹8,00,000 per annum"), 800000);
  assert.equal(parseIncomeLimitValue("Below 2.5 Lakh per year"), 250000);
  assert.equal(parseIncomeLimitValue("Up to Rs 4,50,000"), 450000);
  assert.equal(parseIncomeLimitValue("No income ceiling specified"), null);
});

test("Normalization: Academic minimum marks and CGPA conversion", () => {
  assert.equal(parseMinPercentage("Minimum 60% marks in Class 12"), 60);
  assert.equal(parseMinPercentage("At least 75.5% in bachelor degree"), 75.5);
  assert.equal(parseMinPercentage("Minimum CGPA of 8.0 out of 10"), 76);
  assert.equal(parseMinPercentage("Satisfactory performance"), null);
});

// ==========================================
// 3. Application Status & Dates
// ==========================================
test("Classification: Application status evaluates dates correctly", () => {
  // Past deadline
  assert.equal(evaluateApplicationStatus("2020-01-01"), "deadline_passed");
  assert.equal(evaluateApplicationStatus("January 1, 2021"), "deadline_passed");

  // Future deadline (year 2030)
  assert.equal(evaluateApplicationStatus("2030-12-31"), "confirmed_open");

  // Unknown / unannounced
  assert.equal(evaluateApplicationStatus("Refer to portal notification"), "status_unknown");
  assert.equal(evaluateApplicationStatus(""), "status_unknown");
});

// ==========================================
// 4. Extraction & Normalization
// ==========================================
test("Extraction: Identifies schemes from structured markdown text", () => {
  const dummyPage = {
    url: "https://scholarships.gov.in/test-schemes",
    final_url: "https://scholarships.gov.in/test-schemes",
    title: "National Scholarship Portal Guidelines",
    description: "Centrally sponsored schemes",
    text: `
# AICTE Pragati Scholarship for Girls
Financial assistance for female scholars in technical diploma and degree programs.
Rate of scholarship: ₹50,000 per year for tuition and college expenses.
Eligibility: Minimum 60% marks in qualifying examination. Family income under ₹8,00,000.
Last date: December 31, 2026

# AICTE Saksham Scholarship for Specially Abled
Support for specially-abled students with more than 40% disability.
Benefit: ₹50,000 per annum.
Eligibility: Valid UDID card required.
    `,
  };

  const nspSource = getSourceById("nsp-central");
  const extracted = extractScholarshipsFromPage(dummyPage, nspSource);

  assert.ok(extracted.length >= 2);
  assert.equal(extracted[0].name, "AICTE Pragati Scholarship for Girls");
  assert.ok(extracted[0].award_amount?.includes("50,000"));
});

test("Extraction: Field-level evidence and provenance tracking", () => {
  const nspSource = getSourceById("nsp-central");
  const raw = {
    name: "AICTE Pragati Scheme",
    provider: "AICTE, Ministry of Education",
    award_amount: "₹50,000 / year",
    application_deadline: "October 31, 2026",
    family_income_limit: "Up to ₹8,00,000 per annum",
    application_url: "https://scholarships.gov.in/apply",
  };

  const result = normalizeAndValidateRecord(raw, nspSource, "https://scholarships.gov.in/guidelines");
  assert.ok(result);
  const { scholarship, evidence } = result;

  assert.equal(scholarship.verification_status, "verified");
  assert.equal(scholarship.award_amount_value, 50000);
  assert.equal(scholarship.max_income_value, 800000);
  assert.equal(scholarship.category, "Women");
  assert.ok(evidence.length >= 3);

  const awardEv = evidence.find((e) => e.field === "award_amount");
  assert.ok(awardEv);
  assert.equal(awardEv.confidenceScore, 1.0);
});

// ==========================================
// 5. Safe Deduplication & Upsert
// ==========================================
test("Persistence: Safe upsert preserves existing verified facts", async () => {
  const dedupKey = generateDedupKey("AICTE", "Pragati Girl Students", "2025-26");

  const initialRecord = {
    id: "test-pragati-01",
    name: "AICTE Pragati Girl Students",
    provider: "AICTE",
    category: "Women",
    description: "Verified scheme",
    award_amount: "₹50,000 / year",
    award_amount_value: 50000,
    award_benefits: ["Tuition fee waiver"],
    eligibility_criteria: ["Female student in first year engineering"],
    education_levels: ["Undergraduate"],
    eligible_courses: ["B.Tech"],
    eligible_states: ["All India"],
    family_income_limit: "₹8,00,000",
    academic_requirements: "60% marks",
    required_documents: ["Income Certificate"],
    application_start_date: "2026-08-01",
    application_deadline: "October 31, 2026",
    application_status: "verified_open",
    source_url: "https://scholarships.gov.in",
    application_url: "https://scholarships.gov.in",
    source_type: "official_government",
    host_platform: "National Scholarship Portal (NSP)",
    verification_status: "verified",
    last_checked_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
    tags: ["Women", "Engineering"],
    is_featured: true,
    dedup_key: dedupKey,
  };

  // Insert initial verified record
  const insertOutcome = await upsertScholarshipRecord(initialRecord);
  assert.ok(insertOutcome.action === "inserted" || insertOutcome.action === "updated");

  // Now simulate an automated scraper run that got incomplete data (e.g. "Refer to portal")
  const incompleteIncoming = {
    ...initialRecord,
    award_amount: "Refer to portal notification", // Incomplete!
    award_amount_value: 0,
    application_deadline: "Refer to portal notification", // Incomplete!
  };

  const updateOutcome = await upsertScholarshipRecord(incompleteIncoming);
  assert.equal(updateOutcome.action, "updated");

  // The database must PRESERVE the previously verified values!
  assert.equal(updateOutcome.scholarship.award_amount, "₹50,000 / year");
  assert.equal(updateOutcome.scholarship.award_amount_value, 50000);
  assert.equal(updateOutcome.scholarship.application_deadline, "October 31, 2026");
  assert.equal(updateOutcome.scholarship.verification_status, "verified");
});

// ==========================================
// 6. Eligibility Matching Engine Integration
// ==========================================
test("Eligibility Engine: Evaluates structured conditions transparently", () => {
  const engineeringScholarship = {
    id: "test-eng-01",
    name: "Engineering Merit Scholarship",
    provider: "AICTE",
    category: "Engineering",
    description: "Support for engineering students",
    award_amount: "₹50,000",
    award_amount_value: 50000,
    award_benefits: [],
    eligibility_criteria: [],
    education_levels: ["Undergraduate"],
    eligible_courses: ["B.Tech"],
    eligible_states: ["All India"],
    family_income_limit: "₹8,00,000",
    academic_requirements: "60%",
    required_documents: [],
    application_start_date: "",
    application_deadline: "2026-12-31",
    application_status: "confirmed_open",
    source_url: "https://scholarships.gov.in",
    application_url: "https://scholarships.gov.in",
    source_type: "official_government",
    host_platform: "NSP",
    verification_status: "verified",
    last_checked_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
    tags: ["Engineering"],
    is_featured: false,
    dedup_key: "test_eng_01",
    structured_rules: {
      minPercentage: 65,
      maxIncome: 600000,
      allowedGenders: ["all"],
      disabilityRequired: false,
    },
  };

  // Eligible Student: Income 4L, Marks 75%
  const eligibleProfile = {
    educationLevel: "Undergraduate",
    course: "Engineering / B.Tech",
    percentage: 75,
    state: "Maharashtra",
    category: "General",
    gender: "female",
    annualIncome: 400000,
    isSpeciallyAbled: false,
  };

  const match1 = evaluateScholarshipMatch(engineeringScholarship, eligibleProfile);
  assert.equal(match1.isEligible, true);
  assert.equal(match1.missingCriteria.length, 0);

  // Ineligible Student: Income 7.5L (exceeds 6L cap)
  const highIncomeProfile = {
    ...eligibleProfile,
    annualIncome: 750000,
  };

  const match2 = evaluateScholarshipMatch(engineeringScholarship, highIncomeProfile);
  assert.equal(match2.isEligible, false);
  assert.ok(match2.missingCriteria.some((c) => c.includes("Income exceeds cap")));
});
