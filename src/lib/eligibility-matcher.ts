import { Scholarship, StudentProfile } from "../types/scholarship";

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

  const rules = scholarship.structured_rules;

  // 1. Gender check
  const requiresFemale =
    rules?.allowedGenders?.includes("female") && !rules?.allowedGenders?.includes("all") ||
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
  const isAllIndia =
    scholarship.eligible_states.includes("All India") ||
    (rules?.targetStates && rules.targetStates.includes("All India"));

  const isStateMatch =
    scholarship.eligible_states.some((s) => s.toLowerCase() === profile.state.toLowerCase()) ||
    (rules?.targetStates && rules.targetStates.some((s) => s.toLowerCase() === profile.state.toLowerCase()));

  if (isAllIndia || isStateMatch) {
    matchReasons.push(isAllIndia ? "Open pan-India" : `Matches ${profile.state} domicile`);
  } else {
    matchReasons.push(`State: Requires ${scholarship.eligible_states.join(", ")}`);
    missingCriteria.push(`Requires domicile in ${scholarship.eligible_states.join(", ")}`);
  }

  // 3. Family Income check (reads structured max_income_value if present)
  let parsedLimit = scholarship.max_income_value ?? rules?.maxIncome ?? 800000;
  if (!scholarship.max_income_value && !rules?.maxIncome) {
    if (scholarship.id === "siemens-scholarship-program") parsedLimit = 200000;
    else if (scholarship.id === "nsp-pmusp-csss") parsedLimit = 450000;
    else if (scholarship.id === "kotak-kanya-scholarship") parsedLimit = 600000;
    else if (scholarship.id === "hdfc-parivartan-ecss") parsedLimit = 250000;
    else if (scholarship.id === "mahadbt-post-matric-sc") parsedLimit = 250000;
    else if (scholarship.id === "reliance-foundation-ug") parsedLimit = 1500000;
  }

  if (parsedLimit > 0) {
    if (profile.annualIncome <= parsedLimit) {
      matchReasons.push(`Income within threshold (cap: ₹${parsedLimit.toLocaleString("en-IN")})`);
    } else {
      missingCriteria.push(`Income exceeds cap of ₹${parsedLimit.toLocaleString("en-IN")}`);
    }
  }

  // 4. Academic percentage check
  const minRequiredPercentage = scholarship.min_marks_percentage ?? rules?.minPercentage ?? (scholarship.id === "kotak-kanya-scholarship" ? 75 : 60);

  if (profile.percentage >= minRequiredPercentage) {
    matchReasons.push(`Meets academic criteria with ${profile.percentage}% (min: ${minRequiredPercentage}%)`);
  } else {
    missingCriteria.push(`Requires minimum ${minRequiredPercentage}% (current: ${profile.percentage}%)`);
  }

  // 5. Specially-Abled Criteria
  const isDisabilityScheme =
    rules?.disabilityRequired ||
    scholarship.id === "nsp-disabilities-post-matric" ||
    scholarship.id === "nsp-aicte-saksham" ||
    scholarship.tags.includes("Specially Abled") ||
    scholarship.tags.includes("Persons with Disabilities");

  if (isDisabilityScheme) {
    const minDisability = rules?.minDisabilityPercentage ?? 40;
    if (profile.isSpeciallyAbled && (profile.disabilityPercentage || 0) >= minDisability) {
      matchReasons.push(`Satisfies ${minDisability}%+ benchmark disability requirement`);
    } else {
      missingCriteria.push(`Requires certified disability >= ${minDisability}% (UDID card)`);
    }
  }

  return {
    isEligible: missingCriteria.length === 0,
    matchReasons,
    missingCriteria,
  };
}
