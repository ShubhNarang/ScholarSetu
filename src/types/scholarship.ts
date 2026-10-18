export type ApplicationStatus =
  | "verified_open"
  | "opening_later"
  | "deadline_passed"
  | "status_unknown"
  | "needs_verification"
  | "confirmed_open"
  | "confirmed_closed"
  | "not_yet_open"
  | "unknown";

export type VerificationStatus =
  | "verified"
  | "partially_verified"
  | "needs_verification"
  | "unverified";

export type SourceType =
  | "official_government"
  | "official_foundation"
  | "trusted_platform"
  | "corporate_csr";

export type ProviderType =
  | "central_government"
  | "state_government"
  | "private_foundation"
  | "corporate_csr"
  | "international_trust";

export type FundingType =
  | "scholarship"
  | "fellowship"
  | "grant"
  | "concession"
  | "loan_scholarship";

export type ScholarshipCategory =
  | "Government"
  | "Merit-Based"
  | "Need-Based"
  | "Engineering"
  | "School Students"
  | "Undergraduate"
  | "Postgraduate"
  | "Women"
  | "State Scholarships";

export interface StudentProfile {
  educationLevel: string;
  course: string;
  percentage: number;
  state: string;
  category: string;
  gender: string;
  annualIncome: number;
  isSpeciallyAbled: boolean;
  disabilityPercentage?: number;
}

export interface FieldSourceEvidence {
  field: string;
  value: string;
  evidenceSnippet?: string;
  evidenceUrl?: string;
  confidenceScore: number;
  extractedAt: string;
}

export interface StructuredEligibilityRules {
  minPercentage?: number | null;
  maxIncome?: number | null;
  allowedGenders?: ("male" | "female" | "transgender" | "all")[];
  disabilityRequired?: boolean;
  minDisabilityPercentage?: number | null;
  targetCategories?: string[];
  targetStates?: string[];
  targetCourses?: string[];
  targetEducationLevels?: string[];
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  category: ScholarshipCategory;
  description: string;
  award_amount: string;
  award_amount_value: number; // For sorting and filtering
  award_currency?: string;
  award_frequency?: "annually" | "monthly" | "one_time" | "per_semester";
  award_benefits: string[];
  eligibility_criteria: string[];
  education_levels: string[]; // "School Students", "Undergraduate", "Postgraduate", "PhD", "Diploma", "All Levels"
  eligible_courses: string[];
  eligible_states: string[];
  family_income_limit: string;
  max_income_value?: number | null;
  min_marks_percentage?: number | null;
  academic_requirements: string;
  required_documents: string[];
  academic_year?: string;
  application_start_date: string;
  application_deadline: string;
  application_status: ApplicationStatus;
  source_url: string; // Official informational/guideline page
  application_url: string; // Direct application portal form
  evidence_url?: string;
  source_type: SourceType;
  provider_type?: ProviderType;
  funding_type?: FundingType;
  host_platform: string;
  verification_status: VerificationStatus;
  last_checked_at: string;
  last_updated_at: string;
  first_discovered_at?: string;
  last_verified_at?: string;
  tags: string[];
  is_featured: boolean;
  dedup_key: string;
  structured_rules?: StructuredEligibilityRules;
  missing_fields?: string[];
  field_evidence?: FieldSourceEvidence[];
}

export interface ExtractionLog {
  id: string;
  source_name: string;
  source_url: string;
  engine: "TinyFish" | "DirectVerifier" | "ManualAudit";
  status: "success" | "partial_success" | "failed" | "rate_limited";
  items_extracted: number;
  items_verified: number;
  message: string;
  created_at: string;
  raw_payload?: Record<string, unknown>;
}

export interface StudentApplication {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  provider: string;
  appliedDate: string;
  status: "Draft" | "Applied" | "Under Review" | "Accepted" | "Rejected";
  applicationPortal: string;
  awardAmount: string;
  notes?: string;
}

export interface FilterParams {
  search?: string;
  category?: string;
  educationLevel?: string;
  course?: string;
  state?: string;
  incomeLimit?: string;
  status?: string;
  sortBy?: "deadline" | "amount_high" | "amount_low" | "recently_checked" | "popular";
}

export type IngestionJobStage =
  | "queued"
  | "running"
  | "discovering"
  | "fetching"
  | "extracting"
  | "validating"
  | "saving"
  | "completed"
  | "partially_completed"
  | "failed";

export interface IngestionJob {
  id: string;
  triggerType: "manual_single" | "manual_batch" | "scheduled";
  sourceId?: string;
  sourceName?: string;
  stage: IngestionJobStage;
  startedAt: string;
  completedAt?: string | null;
  totalSources: number;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  pagesAttempted: number;
  pagesFetched: number;
  recordsDiscovered: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsVerified: number;
  errors: Array<{ sourceId: string; url?: string; message: string; timestamp: string }>;
  logs: Array<{ timestamp: string; stage: IngestionJobStage; message: string }>;
}
