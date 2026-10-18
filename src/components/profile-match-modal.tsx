"use client";

import { useState, useEffect } from "react";
import { X, Check, ArrowRight, ArrowLeft, Lock } from "lucide-react";
import { states, educationLevels, courses } from "@/lib/data";

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

interface ProfileMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSubmit: (profile: StudentProfile) => void;
  currentProfile?: StudentProfile | null;
}

export default function ProfileMatchModal({
  isOpen,
  onClose,
  onProfileSubmit,
  currentProfile,
}: ProfileMatchModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [educationLevel, setEducationLevel] = useState("Undergraduate");
  const [course, setCourse] = useState("Engineering / B.Tech");
  const [percentage, setPercentage] = useState<number>(75);
  const [state, setState] = useState("All India");
  const [category, setCategory] = useState("General");
  const [gender, setGender] = useState("female");
  const [annualIncome, setAnnualIncome] = useState<number>(350000);
  const [isSpeciallyAbled, setIsSpeciallyAbled] = useState(false);
  const [disabilityPercentage, setDisabilityPercentage] = useState<number>(40);

  useEffect(() => {
    if (!currentProfile) return;
    const timer = setTimeout(() => {
      setEducationLevel(currentProfile.educationLevel);
      setCourse(currentProfile.course);
      setPercentage(currentProfile.percentage);
      setState(currentProfile.state);
      setCategory(currentProfile.category);
      setGender(currentProfile.gender);
      setAnnualIncome(currentProfile.annualIncome);
      setIsSpeciallyAbled(currentProfile.isSpeciallyAbled);
      if (currentProfile.disabilityPercentage) {
        setDisabilityPercentage(currentProfile.disabilityPercentage);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentProfile]);

  if (!isOpen) return null;

  const handleFinish = () => {
    const profile: StudentProfile = {
      educationLevel,
      course,
      percentage,
      state,
      category,
      gender,
      annualIncome,
      isSpeciallyAbled,
      disabilityPercentage: isSpeciallyAbled ? disabilityPercentage : undefined,
    };
    onProfileSubmit(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-black/[0.08] transition-all">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-black/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[#0071e3]">
                Step {step} of 3
              </span>
              <span className="text-[#86868b]">•</span>
              <span className="text-[12px] text-[#86868b]">
                {step === 1 && "Academic Background"}
                {step === 2 && "Demographics & Category"}
                {step === 3 && "Financial & Special Criteria"}
              </span>
            </div>
            <h2 className="mt-1 text-[18px] font-semibold text-[#1d1d1f]">
              {step === 1 && "Tell us about your studies"}
              {step === 2 && "State of domicile and background"}
              {step === 3 && "Annual family income & eligibility"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close match dialog"
            className="rounded-full p-1.5 text-[#86868b] hover:bg-black/[0.04] hover:text-[#1d1d1f]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-6 space-y-5">
          {/* STEP 1: EDUCATION */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  Current Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2.5 text-[14px] text-[#1d1d1f] focus:border-[#0071e3] focus:bg-white focus:outline-none"
                >
                  {educationLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-[#86868b]">
                  Choose your current or incoming level of education for the academic session.
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  Academic Discipline or Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2.5 text-[14px] text-[#1d1d1f] focus:border-[#0071e3] focus:bg-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  Previous Examination Percentage or Equivalent ({percentage}%)
                </label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full accent-[#0071e3]"
                />
                <div className="flex justify-between text-[11px] text-[#86868b] mt-1">
                  <span>Pass (40%)</span>
                  <span className="font-semibold text-[#1d1d1f]">{percentage}% marks</span>
                  <span>Distinction (100%)</span>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: DEMOGRAPHICS */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  State of Domicile
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2.5 text-[14px] text-[#1d1d1f] focus:border-[#0071e3] focus:bg-white focus:outline-none"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-[#86868b]">
                  State schemes require domicile proof (e.g. MahaDBT requires Maharashtra domicile).
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  Social Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2.5 text-[14px] text-[#1d1d1f] focus:border-[#0071e3] focus:bg-white focus:outline-none"
                >
                  <option value="General">General / Unreserved</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="DNT">DNT (De-notified Tribes)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Female", val: "female" },
                    { label: "Male", val: "male" },
                    { label: "Other", val: "other" },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setGender(g.val)}
                      className={`rounded-xl border py-2 text-[13px] font-medium transition-all ${
                        gender === g.val
                          ? "border-[#0071e3] bg-[#f0f6ff] text-[#0071e3]"
                          : "border-black/[0.08] bg-[#fbfbfd] text-[#6e6e73] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-[#86868b]">
                  Several flagship central programs (like AICTE Pragati) are reserved exclusively for women scholars.
                </p>
              </div>
            </>
          )}

          {/* STEP 3: FINANCIAL & SPECIAL STATUS */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  Annual Gross Family Income
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#86868b]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="25000"
                    min="0"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] py-2.5 pl-8 pr-4 text-[14px] text-[#1d1d1f] focus:border-[#0071e3] focus:bg-white focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#86868b]">
                  {annualIncome <= 250000 && "Eligible for low-income & crisis support grants (under ₹2.5 Lakhs)."}
                  {annualIncome > 250000 && annualIncome <= 450000 && "Eligible for Central Sector Scheme & general need-based grants (under ₹4.5 Lakhs)."}
                  {annualIncome > 450000 && annualIncome <= 800000 && "Eligible for AICTE technical grants & state subsidies (under ₹8 Lakhs)."}
                  {annualIncome > 800000 && "Eligible for merit-based awards (e.g. Reliance Foundation up to ₹15L)."}
                </p>
              </div>

              {/* Specially-Abled progressive disclosure */}
              <div className="rounded-xl border border-black/[0.06] bg-[#fbfbfd] p-3.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpeciallyAbled}
                    onChange={(e) => setIsSpeciallyAbled(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#0071e3]"
                  />
                  <span className="text-[13px] font-medium text-[#1d1d1f]">
                    Person with benchmark disability (40% or more)
                  </span>
                </label>

                {isSpeciallyAbled && (
                  <div className="mt-3 pt-3 border-t border-black/[0.06]">
                    <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">
                      Certified Disability Percentage: {disabilityPercentage}%
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={disabilityPercentage}
                      onChange={(e) => setDisabilityPercentage(Number(e.target.value))}
                      className="w-full accent-[#0071e3]"
                    />
                    <p className="text-[11px] text-[#86868b] mt-1">
                      Requires UDID card or competent medical board certificate for schemes like AICTE Saksham and NSP Disabilities.
                    </p>
                  </div>
                )}
              </div>

              {/* Privacy Reassurance Note */}
              <div className="flex items-start gap-2 rounded-xl bg-[#f5f5f7] p-3 text-[11px] text-[#6e6e73]">
                <Lock className="h-3.5 w-3.5 text-[#86868b] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy reassurance:</strong> ScholarSetu never asks for Aadhaar numbers,
                  bank credentials, passwords, or fee payments. This information stays in your
                  browser session to evaluate eligibility.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#333336]"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-6 py-2 text-[13px] font-medium text-white hover:bg-[#0077ed]"
            >
              <Check className="h-3.5 w-3.5" />
              <span>See Matching Scholarships</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
