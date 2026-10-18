export type ApplicationStatus =
  | "verified_open"
  | "opening_later"
  | "deadline_passed"
  | "status_unknown"
  | "needs_verification";

export type VerificationStatus = "verified" | "needs_verification" | "unverified";

export type SourceType =
  | "official_government"
  | "official_foundation"
  | "trusted_platform"
  | "corporate_csr";

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

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  category: ScholarshipCategory;
  description: string;
  award_amount: string;
  award_amount_value: number; // For sorting and filtering
  award_benefits: string[];
  eligibility_criteria: string[];
  education_levels: string[]; // "School Students", "Undergraduate", "Postgraduate", "PhD", "Diploma", "All Levels"
  eligible_courses: string[];
  eligible_states: string[];
  family_income_limit: string;
  academic_requirements: string;
  required_documents: string[];
  application_start_date: string;
  application_deadline: string;
  application_status: ApplicationStatus;
  source_url: string; // Official informational/guideline page
  application_url: string; // Direct application portal form
  source_type: SourceType;
  host_platform: string; // e.g. "National Scholarship Portal (NSP)", "Reliance Portal", "Buddy4Study (Official Partner)"
  verification_status: VerificationStatus;
  last_checked_at: string;
  last_updated_at: string;
  tags: string[];
  is_featured: boolean;
  dedup_key: string;
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
