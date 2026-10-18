"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Calendar,
  IndianRupee,
  Clock,
  GraduationCap,
  MapPin,
  ExternalLink,
  CheckCircle2,
  FileText,
  Bookmark,
  Share2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Info,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import ScholarshipCard from "@/components/scholarship-card";
import { Scholarship } from "@/types/scholarship";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
}

export default function ScholarshipDetailView({ id }: Props) {
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [related, setRelated] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Student Eligibility Quick-Check interactive calculator
  const [userIncome, setUserIncome] = useState<string>("300000");
  const [userGender, setUserGender] = useState<string>("female");
  const [userCategory, setUserCategory] = useState<string>("General");
  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/scholarships/${id}`);
        const data = await res.json();
        if (data.success && data.scholarship) {
          setScholarship(data.scholarship);

          // Load related scholarships
          const relRes = await fetch(`/api/scholarships?category=${encodeURIComponent(data.scholarship.category)}`);
          const relData = await relRes.json();
          if (relData.success && Array.isArray(relData.scholarships)) {
            setRelated(relData.scholarships.filter((s: Scholarship) => s.id !== id).slice(0, 3));
          }
        } else {
          setScholarship(null);
        }
      } catch (err) {
        console.error("Failed to fetch scholarship:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Check if bookmarked
    try {
      const saved = JSON.parse(localStorage.getItem("scholarsetu_saved_ids") || "[]");
      setIsBookmarked(saved.includes(id));
    } catch {
      // ignore
    }
  }, [id]);

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("scholarsetu_saved_ids") || "[]");
      let next: string[];
      if (saved.includes(id)) {
        next = saved.filter((item) => item !== id);
        setIsBookmarked(false);
      } else {
        next = [...saved, id];
        setIsBookmarked(true);
      }
      localStorage.setItem("scholarsetu_saved_ids", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const evaluateEligibility = () => {
    if (!scholarship) return;
    const incomeNum = parseInt(userIncome, 10);

    // Rule checks
    if (scholarship.id === "nsp-aicte-pragati" && userGender !== "female") {
      setEligibilityResult("Ineligible: AICTE Pragati is exclusively reserved for female students.");
      return;
    }
    if (scholarship.id === "kotak-kanya-scholarship" && userGender !== "female") {
      setEligibilityResult("Ineligible: Kotak Kanya Scholarship is open exclusively to girl students.");
      return;
    }
    if (scholarship.id === "nsp-pmusp-csss" && incomeNum > 450000) {
      setEligibilityResult("Ineligible: Family income exceeds PM-USP limit of ₹4,50,000 / annum.");
      return;
    }
    if (scholarship.id === "siemens-scholarship-program" && incomeNum > 200000) {
      setEligibilityResult("Ineligible: Family income exceeds Siemens SSP cap of ₹2,00,000 / annum.");
      return;
    }

    setEligibilityResult("Eligible: Based on your income and criteria, you appear eligible! Proceed to review required documents and apply on the official portal.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading verified opportunity details...</p>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Scholarship Not Found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This scholarship record does not exist or may have been unverified.
        </p>
        <Link
          href="/scholarships"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to All Scholarships</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/scholarships" className="hover:text-indigo-600 transition-colors">
            Scholarships
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate max-w-xs text-slate-800 font-semibold">{scholarship.name}</span>
        </nav>

        {/* Top Header Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 text-xl font-black text-indigo-700 ring-1 ring-slate-200/80">
                {scholarship.provider.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                    {scholarship.category}
                  </span>
                  {scholarship.verification_status === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/80">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified via {scholarship.host_platform}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200/80">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      Needs Verification
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-medium">
                    Audited: {new Date(scholarship.last_checked_at).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                  {scholarship.name}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-600">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>{scholarship.provider}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleBookmark}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all",
                  isBookmarked
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                <span>{isBookmarked ? "Saved" : "Save"}</span>
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                <span>{copied ? "Link Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT 2 COLUMNS: COMPREHENSIVE DETAILS */}
          <div className="space-y-8 lg:col-span-2">
            {/* Overview Section */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Scholarship Overview
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {scholarship.description}
              </p>

              {/* Award Breakdown */}
              <div className="mt-6 rounded-2xl bg-indigo-50/60 p-5 border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <IndianRupee className="h-5 w-5 text-indigo-600" />
                  <span>Financial Grant & Key Benefits</span>
                </div>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-indigo-950 font-medium">
                  {scholarship.award_benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Eligibility Criteria */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Official Eligibility Rules
              </h2>
              <div className="mt-4 space-y-3">
                {scholarship.eligibility_criteria.map((criteria, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {criteria}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Criteria Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 p-3.5">
                  <span className="block font-semibold text-slate-400">Family Income Cap</span>
                  <span className="mt-1 block text-sm font-bold text-slate-900">
                    {scholarship.family_income_limit}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 p-3.5">
                  <span className="block font-semibold text-slate-400">Academic Benchmark</span>
                  <span className="mt-1 block text-sm font-bold text-slate-900">
                    {scholarship.academic_requirements}
                  </span>
                </div>
              </div>
            </section>

            {/* Interactive Eligibility Quick-Checker */}
            <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  Instant Eligibility Pre-Check
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Input your student parameters to evaluate if you satisfy the key rules before submitting.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Annual Family Income (₹)
                  </label>
                  <input
                    type="number"
                    value={userIncome}
                    onChange={(e) => setUserIncome(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    placeholder="300000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={userGender}
                    onChange={(e) => setUserGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={evaluateEligibility}
                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                  >
                    Evaluate Now
                  </button>
                </div>
              </div>

              {eligibilityResult && (
                <div
                  className={cn(
                    "mt-4 rounded-xl p-3.5 text-xs leading-relaxed font-semibold border",
                    eligibilityResult.startsWith("Eligible")
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  )}
                >
                  {eligibilityResult}
                </div>
              )}
            </section>

            {/* Required Documents */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Mandatory Documentation Checklist
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Keep scanned soft copies ready before initiating your application on the official portal.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scholarship.required_documents.map((doc, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs font-medium text-slate-700">
                    <FileText className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Source Attribution & Integrity Note */}
            <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                <Info className="h-4 w-4 text-indigo-600" />
                <span>Verification Source & Data Provenance</span>
              </div>
              <p className="leading-relaxed">
                This opportunity has been audited from official guidelines hosted at{" "}
                <a
                  href={scholarship.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:underline"
                >
                  {scholarship.source_url}
                </a>
                . ScholarSetu does not accept payments or act as a commercial intermediary. Applications
                are processed directly by {scholarship.provider} through {scholarship.host_platform}.
              </p>
            </section>
          </div>

          {/* RIGHT 1 COLUMN: STICKY OPPORTUNITY SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Opportunity Summary
                </span>

                {/* Amount */}
                <div className="mt-3 pb-4 border-b border-slate-100">
                  <span className="text-xs font-medium text-slate-500">Award Amount</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {scholarship.award_amount}
                    </span>
                  </div>
                </div>

                {/* Deadline & Key Facts */}
                <div className="mt-4 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Deadline:
                    </span>
                    <span className="font-bold text-slate-900">
                      {scholarship.application_deadline}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      Education Level:
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {scholarship.education_levels.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Eligible States:
                    </span>
                    <span className="font-bold text-slate-900">
                      {scholarship.eligible_states.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Host Platform:
                    </span>
                    <span className="font-bold text-indigo-700">
                      {scholarship.host_platform}
                    </span>
                  </div>
                </div>

                {/* PRIMARY ACTION BUTTON: APPLY ON OFFICIAL PORTAL */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                  {scholarship.verification_status === "verified" ? (
                    <a
                      href={scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <a
                      href={scholarship.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-amber-700"
                    >
                      <span>Application Link Needs Verification</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  <a
                    href={scholarship.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>View Official Notification / Guidelines</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED OPPORTUNITIES */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Similar Verified Opportunities in {scholarship.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
