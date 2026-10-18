import { VERIFIED_SCHOLARSHIPS } from "@/lib/verified-scholarships";
import { Scholarship, ScholarshipCategory } from "@/types/scholarship";

// Re-export types
export type { Scholarship, ScholarshipCategory };

// Export verified real scholarships (No fake data)
export const scholarships: Scholarship[] = VERIFIED_SCHOLARSHIPS;

// Standard category filters (aligned with Unstop-style categories)
export const categories: ScholarshipCategory[] = [
  "Government",
  "Merit-Based",
  "Need-Based",
  "Engineering",
  "School Students",
  "Undergraduate",
  "Postgraduate",
  "Women",
  "State Scholarships",
];

export const educationLevels = [
  "School Students",
  "Undergraduate",
  "Postgraduate",
  "PhD",
  "Diploma",
  "All Levels",
];

export const states = [
  "All India",
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

export const courses = [
  "All Regular Degrees",
  "Engineering / B.Tech",
  "MBBS / Medical",
  "Science / B.Sc.",
  "Commerce / B.Com.",
  "Arts / Humanities",
  "Management / MBA",
  "Diploma / ITI",
  "Law / LLB",
];

export const amountRanges = [
  { label: "Under ₹25,000", min: 0, max: 25000 },
  { label: "₹25,000 - ₹50,000", min: 25000, max: 50000 },
  { label: "₹50,000 - ₹1,00,000", min: 50000, max: 100000 },
  { label: "Above ₹1,00,000", min: 100000, max: Infinity },
];
