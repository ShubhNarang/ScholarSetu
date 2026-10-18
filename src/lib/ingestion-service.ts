/**
 * ScholarSetu - Real TinyFish Scholarship Ingestion & Normalization Service
 *
 * Implements discovery, fetching, structured extraction, normalization,
 * evidence tracking, deduplication, and safe persistence.
 */

import {
  Scholarship,
  ScholarshipCategory,
  ProviderType,
  FundingType,
  VerificationStatus,
  ApplicationStatus,
  StructuredEligibilityRules,
  FieldSourceEvidence,
  IngestionJob,
} from "../types/scholarship";
import {
  ScholarshipSource,
  SCHOLARSHIP_SOURCES_REGISTRY,
  getSourceById,
} from "./source-registry";
import {
  searchWithTinyFish,
  fetchWithTinyFish,
  TinyFishFetchedPage,
} from "./tinyfish";
import {
  upsertScholarshipRecord,
  recordFieldEvidence,
  updateIngestionJobProgress,
  finishIngestionJob,
  startIngestionJob,
} from "./db";

const MAX_RECORDS_PER_SOURCE = 10;

// URL verification and domain mapping
export function verifyAndClassifyUrl(url: string): {
  isValid: boolean;
  platform: string;
  isAuthoritative: boolean;
  verificationStatus: VerificationStatus;
} {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return {
        isValid: false,
        platform: "Invalid Protocol",
        isAuthoritative: false,
        verificationStatus: "unverified",
      };
    }

    const host = parsed.hostname.toLowerCase();

    if (host.includes("scholarships.gov.in")) {
      return {
        isValid: true,
        platform: "National Scholarship Portal (NSP)",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("aicte-india.org")) {
      return {
        isValid: true,
        platform: "AICTE Official Portal",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("nosmsje.gov.in")) {
      return {
        isValid: true,
        platform: "Ministry of Social Justice (NOS)",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("mahadbt.maharashtra.gov.in") || host.includes("mahadbt2.maharashtra.gov.in")) {
      return {
        isValid: true,
        platform: "MahaDBT 2.0 Portal",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("scholarships.reliancefoundation.org") || host.includes("reliancefoundation.org")) {
      return {
        isValid: true,
        platform: "Reliance Foundation Scholarship Portal",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("ongcscholar.org")) {
      return {
        isValid: true,
        platform: "ONGC Scholar Portal",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("ssp.postmatric.karnataka.gov.in")) {
      return {
        isValid: true,
        platform: "Karnataka Post-Matric SSP",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("scholarship.up.gov.in")) {
      return {
        isValid: true,
        platform: "UP SAKSHAM Scholarship Portal",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }
    if (host.includes("buddy4study.com")) {
      return {
        isValid: true,
        platform: "Buddy4Study (Official Partner)",
        isAuthoritative: false,
        verificationStatus: "partially_verified",
      };
    }
    if (host.includes("vidyasaarathi.co.in")) {
      return {
        isValid: true,
        platform: "NSDL Vidyasaarathi",
        isAuthoritative: true,
        verificationStatus: "verified",
      };
    }

    return {
      isValid: true,
      platform: parsed.hostname,
      isAuthoritative: false,
      verificationStatus: "partially_verified",
    };
  } catch {
    return {
      isValid: false,
      platform: "Invalid URL",
      isAuthoritative: false,
      verificationStatus: "unverified",
    };
  }
}

/**
 * Parses numeric monetary values from strings like "₹50,000 / year", "Rs. 2,00,000", "50000"
 */
export function parseAwardAmountValue(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "");
  const matchLakh = cleaned.match(/([\d.]+)\s*(?:lakh|lac|lacs)/i);
  if (matchLakh) {
    return parseFloat(matchLakh[1]) * 100000;
  }
  const matchNum = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (matchNum) {
    return parseInt(matchNum[1], 10);
  }
  return 0;
}

/**
 * Parses numeric family income limits in INR.
 */
export function parseIncomeLimitValue(raw: string): number | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("no income ceiling") || lower.includes("not applicable")) {
    return null;
  }
  const matchLakh = raw.match(/([\d.]+)\s*(?:lakh|lac|lacs)/i);
  if (matchLakh) {
    return parseFloat(matchLakh[1]) * 100000;
  }
  const matchNum = raw.replace(/,/g, "").match(/(\d{5,8})/);
  if (matchNum) {
    return parseInt(matchNum[1], 10);
  }
  return null;
}

/**
 * Parses minimum percentage requirement from eligibility text.
 */
export function parseMinPercentage(raw: string): number | null {
  if (!raw) return null;
  const matchPercent = raw.match(/(\d{2}(?:\.\d+)?)\s*%/);
  if (matchPercent) {
    return parseFloat(matchPercent[1]);
  }
  const matchCgpa = raw.match(/(?:cgpa|gpa)\s*(?:of\s*)?(\d(?:\.\d+)?)/i);
  if (matchCgpa) {
    // Convert 10-point scale roughly to percentage
    return parseFloat(matchCgpa[1]) * 9.5;
  }
  return null;
}

/**
 * Classifies application status based on parsed deadline.
 */
export function evaluateApplicationStatus(deadlineRaw: string): ApplicationStatus {
  if (!deadlineRaw || deadlineRaw.toLowerCase().includes("refer to") || deadlineRaw.toLowerCase().includes("announcement")) {
    return "status_unknown";
  }

  // Try parsing dates like "October 31, 2026", "31-10-2026", "2026-10-31"
  const parsed = Date.parse(deadlineRaw);
  if (!isNaN(parsed)) {
    const now = Date.now();
    if (parsed < now) {
      return "deadline_passed";
    } else {
      return "confirmed_open";
    }
  }

  return "confirmed_open";
}

/**
 * Generates a stable deduplication key for safe upserts.
 */
export function generateDedupKey(provider: string, schemeName: string, academicYear = "2025-26"): string {
  const cleanProvider = provider.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
  const cleanName = schemeName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40);
  return `${cleanProvider}_${cleanName}_${academicYear}`.replace(/_+/g, "_");
}

/**
 * Extracts structured scholarship records from fetched markdown content.
 */
export function extractScholarshipsFromPage(
  page: TinyFishFetchedPage,
  source: ScholarshipSource
): Partial<Scholarship>[] {
  const text = page.text || "";
  const records: Partial<Scholarship>[] = [];

  // Look for scheme headlines, headings (# or ## or ###), or structured sections
  const lines = text.split("\n");
  let currentSchemeName = "";
  let currentDesc: string[] = [];
  let currentCriteria: string[] = [];
  let currentAward = "";
  let currentDeadline = "";
  let currentIncome = "";
  let currentDocuments: string[] = [];
  let currentAppUrl = "";

  // Common official scholarship indicator keywords
  const schemeKeywords = [
    "scholarship",
    "fellowship",
    "pragati",
    "saksham",
    "swanath",
    "merit-cum-means",
    "post matric",
    "top class",
    "national overseas",
    "inspire",
    "jrf",
    "pmrf",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line looks like a scheme title
    const isHeading = line.startsWith("#") || line.startsWith("**") && line.endsWith("**");
    const cleanLine = line.replace(/^[#*\s-]+|[#*\s-]+$/g, "").trim();

    const containsKeyword = schemeKeywords.some((kw) => cleanLine.toLowerCase().includes(kw));
    const isPotentialScheme = containsKeyword && cleanLine.length > 8 && cleanLine.length < 120;

    if (isPotentialScheme && (isHeading || lines[i - 1]?.trim() === "")) {
      // If we already have an extracted scheme, push it before starting next
      if (currentSchemeName && (currentAward || currentCriteria.length > 0 || currentDesc.length > 0)) {
        records.push({
          name: currentSchemeName,
          provider: source.name,
          description: currentDesc.join(" ").slice(0, 400) || `${currentSchemeName} provided under ${source.name}.`,
          award_amount: currentAward || "Financial assistance provided per guidelines",
          eligibility_criteria: currentCriteria.length > 0 ? currentCriteria : ["Enrolled in recognized institution", "Satisfactory academic track record"],
          family_income_limit: currentIncome || "Specified in official notification",
          application_deadline: currentDeadline || "Refer to portal notification",
          application_url: currentAppUrl || page.final_url || source.startingUrl,
          source_url: page.url || source.startingUrl,
          required_documents: currentDocuments.length > 0 ? currentDocuments : ["Income Certificate", "Academic Marksheets", "Institute Verification Bonafide"],
        });

        if (records.length >= MAX_RECORDS_PER_SOURCE) break;
      }

      currentSchemeName = cleanLine;
      currentDesc = [];
      currentCriteria = [];
      currentAward = "";
      currentDeadline = "";
      currentIncome = "";
      currentDocuments = [];
      currentAppUrl = "";
      continue;
    }

    // Extract Award Amount clues
    const hasMonetaryIndicator = line.includes("₹") || line.includes("Rs.") || line.includes("INR") || line.toLowerCase().includes("lakh");
    const isExplicitAward = Boolean(line.match(/(?:rate of scholarship|scholarship amount|award|stipend|benefit)[:\s]/i) && hasMonetaryIndicator);

    if ((isExplicitAward || (hasMonetaryIndicator && !currentAward)) && line.length < 150) {
      currentAward = line.replace(/^[^:]*:\s*/, "").trim().slice(0, 100);
    }

    // Extract Deadline clues
    if (line.match(/(?:deadline|last date|closing date|valid till|submission end)[:\s]/i)) {
      if (!currentDeadline && line.length < 100) {
        currentDeadline = line.replace(/^[^:]*:\s*/, "").slice(0, 80);
      }
    }

    // Extract Income clues
    if (line.match(/(?:family income|parental income|annual income|income ceiling)[:\s]/i)) {
      if (!currentIncome && line.length < 120) {
        currentIncome = line.replace(/^[^:]*:\s*/, "").slice(0, 100);
      }
    }

    // Extract Criteria clues
    if (line.match(/(?:eligible|eligibility|who can apply|qualification|minimum marks)[:\s]/i) || line.startsWith("- ") || line.startsWith("* ")) {
      if (currentCriteria.length < 6 && line.length > 10 && line.length < 200) {
        currentCriteria.push(line.replace(/^[-*•\s]+/, ""));
      }
    }

    // Check description lines
    if (currentSchemeName && currentDesc.length < 3 && line.length > 30 && !line.includes("http")) {
      currentDesc.push(line);
    }
  }

  // Push final record if found
  if (currentSchemeName && records.length < MAX_RECORDS_PER_SOURCE) {
    records.push({
      name: currentSchemeName,
      provider: source.name,
      description: currentDesc.join(" ").slice(0, 400) || `${currentSchemeName} provided under ${source.name}.`,
      award_amount: currentAward || "Financial assistance per official notification",
      eligibility_criteria: currentCriteria.length > 0 ? currentCriteria : ["Enrolled in recognized institution", "Meets academic criteria"],
      family_income_limit: currentIncome || "Specified in guidelines",
      application_deadline: currentDeadline || "Refer to portal notification",
      application_url: currentAppUrl || page.final_url || source.startingUrl,
      source_url: page.url || source.startingUrl,
      required_documents: currentDocuments.length > 0 ? currentDocuments : ["Income Certificate", "Marksheets", "Bonafide Certificate"],
    });
  }

  // If page text didn't break down into multi-scheme sections, but the page itself is a dedicated scheme page:
  if (records.length === 0 && (page.title || text.length > 200)) {
    const pageTitle = page.title || source.name;
    const isSchemePage = schemeKeywords.some((kw) => pageTitle.toLowerCase().includes(kw));

    if (isSchemePage || source.category === "government_institutional") {
      records.push({
        name: pageTitle.slice(0, 90),
        provider: source.name,
        description: text.slice(0, 300).replace(/\s+/g, " ") || `${pageTitle} guidelines and official portal details.`,
        award_amount: "As per official scheme guidelines",
        eligibility_criteria: ["Regular student enrolled in eligible institution", "Fulfills minimum academic qualifications"],
        family_income_limit: "Refer to scheme document",
        application_deadline: "Refer to portal notification",
        application_url: page.final_url || source.startingUrl,
        source_url: page.url || source.startingUrl,
        required_documents: ["Identity Proof", "Academic Records", "Income Certificate"],
      });
    }
  }

  return records;
}

/**
 * Normalizes raw extracted scholarship records into canonical format,
 * creates field-level evidence objects, structured matching rules, and classifies statuses.
 */
export function normalizeAndValidateRecord(
  raw: Partial<Scholarship>,
  source: ScholarshipSource,
  sourcePageUrl: string
): { scholarship: Scholarship; evidence: FieldSourceEvidence[] } | null {
  if (!raw.name || raw.name.trim().length < 3) {
    return null;
  }

  const name = raw.name.trim();
  const provider = raw.provider || source.name;
  const sourceUrl = raw.source_url || sourcePageUrl;
  const appUrl = raw.application_url || source.startingUrl;

  const urlCheck = verifyAndClassifyUrl(appUrl);
  const awardValue = parseAwardAmountValue(raw.award_amount || "");
  const incomeValue = parseIncomeLimitValue(raw.family_income_limit || "");
  const minMarks = parseMinPercentage(raw.academic_requirements || raw.eligibility_criteria?.join(" ") || "");
  const dedupKey = generateDedupKey(provider, name);

  // Field level provenance evidence
  const evidence: FieldSourceEvidence[] = [];
  const nowIso = new Date().toISOString();

  if (raw.award_amount) {
    evidence.push({
      field: "award_amount",
      value: raw.award_amount,
      evidenceUrl: sourceUrl,
      evidenceSnippet: `Extracted from ${source.name} scheme publication: ${raw.award_amount}`,
      confidenceScore: urlCheck.isAuthoritative ? 1.0 : 0.85,
      extractedAt: nowIso,
    });
  }

  if (raw.application_deadline) {
    evidence.push({
      field: "application_deadline",
      value: raw.application_deadline,
      evidenceUrl: sourceUrl,
      evidenceSnippet: `Application deadline extracted: ${raw.application_deadline}`,
      confidenceScore: urlCheck.isAuthoritative ? 0.95 : 0.8,
      extractedAt: nowIso,
    });
  }

  if (raw.family_income_limit) {
    evidence.push({
      field: "family_income_limit",
      value: raw.family_income_limit,
      evidenceUrl: sourceUrl,
      evidenceSnippet: `Income ceiling guideline: ${raw.family_income_limit}`,
      confidenceScore: 0.9,
      extractedAt: nowIso,
    });
  }

  // Derive category
  let category: ScholarshipCategory = "Government";
  const nameLower = name.toLowerCase();
  const descLower = (raw.description || "").toLowerCase();

  if (nameLower.includes("women") || nameLower.includes("girl") || nameLower.includes("pragati") || nameLower.includes("kanya")) {
    category = "Women";
  } else if (nameLower.includes("engineering") || descLower.includes("b.tech") || descLower.includes("technical education")) {
    category = "Engineering";
  } else if (nameLower.includes("merit") || descLower.includes("merit")) {
    category = "Merit-Based";
  } else if (nameLower.includes("need") || descLower.includes("means") || descLower.includes("economically")) {
    category = "Need-Based";
  } else if (source.category === "state_portal") {
    category = "State Scholarships";
  } else if (descLower.includes("postgraduate") || descLower.includes("master")) {
    category = "Postgraduate";
  } else if (source.category === "corporate_foundation") {
    category = "Merit-Based";
  }

  // Determine provider and funding type
  const providerType: ProviderType = source.defaultProviderType || "central_government";
  let fundingType: FundingType = "scholarship";
  if (nameLower.includes("fellowship") || nameLower.includes("jrf") || nameLower.includes("pmrf")) {
    fundingType = "fellowship";
  } else if (nameLower.includes("loan scholarship") || nameLower.includes("endowment")) {
    fundingType = "loan_scholarship";
  } else if (nameLower.includes("grant")) {
    fundingType = "grant";
  }

  // Structured rules for eligibility engine
  const structuredRules: StructuredEligibilityRules = {
    minPercentage: minMarks,
    maxIncome: incomeValue,
    allowedGenders: category === "Women" ? ["female"] : ["all"],
    disabilityRequired: nameLower.includes("disabilit") || nameLower.includes("saksham"),
    targetCategories: [],
    targetStates: source.category === "state_portal" && source.id.includes("mahadbt") ? ["Maharashtra"] : ["All India"],
    targetCourses: category === "Engineering" ? ["Engineering / B.Tech"] : ["All Regular Degrees"],
    targetEducationLevels: ["Undergraduate", "Postgraduate"],
  };

  const missingFields: string[] = [];
  if (!raw.award_amount || raw.award_amount.includes("Refer")) missingFields.push("award_amount_exact");
  if (!raw.application_deadline || raw.application_deadline.includes("Refer")) missingFields.push("application_deadline_exact");
  if (!incomeValue) missingFields.push("income_ceiling_numeric");

  const scholarship: Scholarship = {
    id: `sch_${dedupKey.slice(0, 32)}`,
    name,
    provider,
    category,
    description: raw.description || `${name} provided by ${provider}. Official eligibility and application details.`,
    award_amount: raw.award_amount || "Financial assistance per guidelines",
    award_amount_value: awardValue,
    award_currency: "INR",
    award_frequency: "annually",
    award_benefits: raw.award_benefits || ["Tuition support", "Academic allowance"],
    eligibility_criteria: raw.eligibility_criteria && raw.eligibility_criteria.length > 0
      ? raw.eligibility_criteria
      : ["Enrolled in accredited institution", "Complies with official guidelines"],
    education_levels: raw.education_levels || ["Undergraduate"],
    eligible_courses: raw.eligible_courses || ["All Regular Degrees"],
    eligible_states: raw.eligible_states || (source.category === "state_portal" && source.id.includes("mahadbt") ? ["Maharashtra"] : ["All India"]),
    family_income_limit: raw.family_income_limit || "Specified in guidelines",
    max_income_value: incomeValue,
    min_marks_percentage: minMarks,
    academic_requirements: raw.academic_requirements || (minMarks ? `Minimum ${minMarks}% in qualifying examination` : "Satisfactory academic track record"),
    required_documents: raw.required_documents || ["Income Certificate", "Marksheets", "Bonafide Student Certificate"],
    academic_year: "2025-26",
    application_start_date: raw.application_start_date || "",
    application_deadline: raw.application_deadline || "Refer to portal notification",
    application_status: evaluateApplicationStatus(raw.application_deadline || ""),
    source_url: sourceUrl,
    application_url: appUrl,
    evidence_url: sourceUrl,
    source_type: source.category === "government_institutional" ? "official_government" : source.category === "corporate_foundation" ? "corporate_csr" : "official_foundation",
    provider_type: providerType,
    funding_type: fundingType,
    host_platform: source.hostPlatform,
    verification_status: urlCheck.verificationStatus,
    last_checked_at: nowIso,
    last_updated_at: nowIso,
    first_discovered_at: nowIso,
    last_verified_at: urlCheck.verificationStatus === "verified" ? nowIso : undefined,
    tags: [category, providerType, source.name],
    is_featured: false,
    dedup_key: dedupKey,
    structured_rules: structuredRules,
    missing_fields: missingFields,
    field_evidence: evidence,
  };

  return { scholarship, evidence };
}

/**
 * Ingests a single configured source through the full pipeline:
 * 1. Discover pages (via Search API or starting URL)
 * 2. Fetch clean content (via Fetch API)
 * 3. Extract schemes
 * 4. Normalize, validate & classify
 * 5. Deduplicate and safely persist to DB
 */
export async function runSourceIngestion(
  source: ScholarshipSource,
  jobId?: string
): Promise<{
  sourceId: string;
  sourceName: string;
  success: boolean;
  pagesAttempted: number;
  pagesFetched: number;
  recordsExtracted: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsVerified: number;
  error?: string;
}> {
  const resultSummary = {
    sourceId: source.id,
    sourceName: source.name,
    success: false,
    pagesAttempted: 0,
    pagesFetched: 0,
    recordsExtracted: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    recordsVerified: 0,
    error: undefined as string | undefined,
  };

  const candidateUrls: string[] = [source.startingUrl];

  // Stage 1: Discovery via TinyFish Search if configured
  if (source.discoveryStrategy === "search_and_fetch" && source.searchQueries && source.searchQueries.length > 0) {
    if (jobId) {
      updateIngestionJobProgress(jobId, {
        stage: "discovering",
        logMessage: `Discovering candidate URLs for ${source.name} via TinyFish Search...`,
      });
    }

    for (const q of source.searchQueries.slice(0, 2)) {
      try {
        const searchRes = await searchWithTinyFish({
          query: q,
          includeDomains: source.allowedDomains,
          purpose: `Discover scholarship scheme details on ${source.name}`,
        });

        if (searchRes.success && searchRes.results.length > 0) {
          for (const item of searchRes.results) {
            if (candidateUrls.length < 5 && !candidateUrls.includes(item.url)) {
              candidateUrls.push(item.url);
            }
          }
        }
      } catch (err: unknown) {
        console.warn(`Search discovery warning for ${source.name}:`, err);
      }
    }
  }

  // Stage 2: Fetch Content via TinyFish Fetch API
  if (jobId) {
    updateIngestionJobProgress(jobId, {
      stage: "fetching",
      logMessage: `Fetching ${candidateUrls.length} pages for ${source.name} via TinyFish Fetch API...`,
    });
  }

  resultSummary.pagesAttempted = candidateUrls.length;
  const fetchRes = await fetchWithTinyFish(candidateUrls, {
    format: "markdown",
    links: true,
  });

  resultSummary.pagesFetched = fetchRes.results.length;

  if (fetchRes.results.length === 0) {
    resultSummary.error = fetchRes.errors[0]?.error || "No pages could be fetched from source";
    return resultSummary;
  }

  // Stage 3 & 4: Extract and Normalize
  if (jobId) {
    updateIngestionJobProgress(jobId, {
      stage: "extracting",
      logMessage: `Extracting scholarship schemes from ${fetchRes.results.length} fetched pages...`,
    });
  }

  const extractedList: Scholarship[] = [];
  const allEvidence: FieldSourceEvidence[] = [];

  for (const page of fetchRes.results) {
    const rawList = extractScholarshipsFromPage(page, source);
    for (const raw of rawList) {
      if (extractedList.length >= MAX_RECORDS_PER_SOURCE) break;

      const validated = normalizeAndValidateRecord(raw, source, page.url);
      if (validated) {
        extractedList.push(validated.scholarship);
        allEvidence.push(...validated.evidence);
      }
    }
    if (extractedList.length >= MAX_RECORDS_PER_SOURCE) break;
  }

  resultSummary.recordsExtracted = extractedList.length;

  // Stage 5: Safe Persistence
  if (jobId) {
    updateIngestionJobProgress(jobId, {
      stage: "saving",
      logMessage: `Safely persisting ${extractedList.length} normalized records to database...`,
    });
  }

  for (const sch of extractedList) {
    try {
      const outcome = await upsertScholarshipRecord(sch);
      if (outcome.action === "inserted") {
        resultSummary.recordsInserted++;
      } else if (outcome.action === "updated") {
        resultSummary.recordsUpdated++;
      } else {
        resultSummary.recordsSkipped++;
      }

      if (sch.verification_status === "verified") {
        resultSummary.recordsVerified++;
      }

      // Record field evidence
      if (sch.field_evidence) {
        for (const ev of sch.field_evidence) {
          await recordFieldEvidence(sch.id, ev);
        }
      }
    } catch (err: unknown) {
      console.error(`Failed to persist scholarship ${sch.name}:`, err);
    }
  }

  resultSummary.success = resultSummary.recordsExtracted > 0 || resultSummary.pagesFetched > 0;
  return resultSummary;
}

/**
 * Orchestrates a complete ingestion job (single source or batch of sources).
 * Prevents overlapping jobs and provides real-time progress state updates.
 */
let isJobRunning = false;

export async function runIngestionJob(options: {
  triggerType: "manual_single" | "manual_batch" | "scheduled";
  sourceId?: string;
  sourceCategory?: string;
}): Promise<IngestionJob> {
  if (isJobRunning) {
    throw new Error("An ingestion job is currently running. Please wait for it to complete.");
  }

  isJobRunning = true;
  let targetSources: ScholarshipSource[] = [];

  if (options.sourceId) {
    const s = getSourceById(options.sourceId);
    if (!s) {
      isJobRunning = false;
      throw new Error(`Source '${options.sourceId}' is not found in the 33-source registry.`);
    }
    targetSources = [s];
  } else if (options.sourceCategory) {
    targetSources = SCHOLARSHIP_SOURCES_REGISTRY.filter(
      (s) => s.category === options.sourceCategory && s.enabled
    );
  } else {
    // Top active batch (e.g. government & institutional + key corporate)
    targetSources = SCHOLARSHIP_SOURCES_REGISTRY.filter((s) => s.enabled);
  }

  const job = startIngestionJob({
    triggerType: options.triggerType,
    sourceId: options.sourceId,
    sourceName: targetSources.length === 1 ? targetSources[0].name : `Batch (${targetSources.length} sources)`,
    totalSources: targetSources.length,
  });

  // Run asynchronously without blocking HTTP response
  (async () => {
    try {
      updateIngestionJobProgress(job.id, {
        stage: "running",
        logMessage: `Starting ingestion job for ${targetSources.length} source(s)...`,
      });

      for (const src of targetSources) {
        try {
          updateIngestionJobProgress(job.id, {
            stage: "discovering",
            logMessage: `Beginning processing for source: ${src.name}`,
          });

          const summary = await runSourceIngestion(src, job.id);

          updateIngestionJobProgress(job.id, {
            sourcesAttempted: 1,
            sourcesSucceeded: summary.success ? 1 : 0,
            sourcesFailed: summary.success ? 0 : 1,
            pagesAttempted: summary.pagesAttempted,
            pagesFetched: summary.pagesFetched,
            recordsDiscovered: summary.recordsExtracted,
            recordsInserted: summary.recordsInserted,
            recordsUpdated: summary.recordsUpdated,
            recordsSkipped: summary.recordsSkipped,
            recordsVerified: summary.recordsVerified,
            logMessage: `Finished ${src.name}: ${summary.recordsExtracted} extracted (${summary.recordsInserted} inserted, ${summary.recordsUpdated} updated).`,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          updateIngestionJobProgress(job.id, {
            sourcesAttempted: 1,
            sourcesFailed: 1,
            error: { sourceId: src.id, message: msg },
            logMessage: `Error processing ${src.name}: ${msg}`,
          });
        }
      }

      finishIngestionJob(job.id, "completed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      finishIngestionJob(job.id, "failed", msg);
    } finally {
      isJobRunning = false;
    }
  })();

  return job;
}
