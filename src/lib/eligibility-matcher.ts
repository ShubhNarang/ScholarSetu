import { Scholarship } from "@/types/scholarship";
import { StudentProfile } from "@/components/profile-match-modal";

export interface MatchResult {
  isEligible: boolean;
  matchReasons: string[];
  missingCriteria: string[];
}

export function evaluateScholarshipMatch(
  scholarship: Scholarship,
  profile: StudentProfile
): MatchResult {
  const matchReasons: string[] = [];
  const missingCriteria: string[] = [];

  // 1. Gender check
  const requiresFemale =
    scholarship.category === "Women" ||
    scholarship.tags.some((t) => t.toLowerCase().includes("girl") || t.toLowerCase().includes("women"));
  
  if (requiresFemale) {
    if (profile.gender.toLowerCase() === "female") {
      matchReasons.push("Matches women scholar reservation");
    } else {
      missingCriteria.push("Scheme is reserved for female students");
    }
  }

  // 2. State Domicile check
  const isAllIndia = scholarship.eligible_states.includes("All India");
  const isStateMatch = scholarship.eligible_states.some(
    (s) => s.toLowerCase() === profile.state.toLowerCase()
  );
  if (isAllIndia || isStateMatch) {
    matchReasons.push(isAllIndia ? "Open pan-India" : `Matches ${profile.state} domicile`);
  } else {
    missingCriteria.push(`Requires domicile in ${scholarship.eligible_states.join(", ")}`);
  }

  // 3. Family Income check
  let parsedLimit = 800000;
  if (scholarship.id === "siemens-scholarship-program") parsedLimit = 200000;
  else if (scholarship.id === "nsp-pmusp-csss") parsedLimit = 450000;
  else if (scholarship.id === "kotak-kanya-scholarship") parsedLimit = 600000;
  else if (scholarship.id === "hdfc-parivartan-ecss") parsedLimit = 250000;
  else if (scholarship.id === "mahadbt-post-matric-sc") parsedLimit = 250000;
  else if (scholarship.id === "reliance-foundation-ug") parsedLimit = 1500000;

  if (profile.annualIncome <= parsedLimit) {
    matchReasons.push(`Income within threshold (cap: ₹${parsedLimit.toLocaleString("en-IN")})`);
  } else {
    missingCriteria.push(`Income exceeds cap of ₹${parsedLimit.toLocaleString("en-IN")}`);
  }

  // 4. Academic percentage check
  if (scholarship.id === "kotak-kanya-scholarship" && profile.percentage < 75) {
    missingCriteria.push("Requires minimum 75% in Class 12");
  } else if (profile.percentage >= 60) {
    matchReasons.push(`Meets academic criteria with ${profile.percentage}%`);
  }

  // 5. Specially-Abled Criteria
  const isDisabilityScheme =
    scholarship.id === "nsp-disabilities-post-matric" ||
    scholarship.id === "nsp-aicte-saksham" ||
    scholarship.tags.includes("Specially Abled") ||
    scholarship.tags.includes("Persons with Disabilities");

  if (isDisabilityScheme) {
    if (profile.isSpeciallyAbled && (profile.disabilityPercentage || 0) >= 40) {
      matchReasons.push("Satisfies 40%+ benchmark disability requirement");
    } else {
      missingCriteria.push("Requires certified disability >= 40% (UDID card)");
    }
  }

  return {
    isEligible: missingCriteria.length === 0,
    matchReasons,
    missingCriteria,
  };
}
