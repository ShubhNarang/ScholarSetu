"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Check,
  Bookmark,
  Share2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  FileText,
  ArrowUpRight,
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

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch(`/api/scholarships/${id}`);
        const data = await res.json();
        if (!isMounted) return;
        if (data.success && data.scholarship) {
          setScholarship(data.scholarship);

          // Load related scholarships
          const relRes = await fetch(`/api/scholarships?category=${encodeURIComponent(data.scholarship.category)}`);
          const relData = await relRes.json();
          if (isMounted && relData.success && Array.isArray(relData.scholarships)) {
            setRelated(relData.scholarships.filter((s: Scholarship) => s.id !== id).slice(0, 2));
          }
        } else {
          setScholarship(null);
        }
      } catch (err) {
        console.error("Failed to fetch scholarship:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();

    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("scholarsetu_saved_ids") || "[]");
        if (isMounted) {
          setIsBookmarked(saved.includes(id));
        }
      } catch {
        // ignore
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
          <p className="text-[12px] text-[#86868b]">Loading verified scheme details…</p>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-[#86868b]" />
        <h1 className="mt-4 text-xl font-semibold text-[#1d1d1f]">Scholarship Not Found</h1>
        <p className="mt-2 text-[13px] text-[#6e6e73]">
          This record does not exist or has been removed from the verified index.
        </p>
        <Link
          href="/scholarships"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-5 py-2 text-[13px] font-medium text-[#1d1d1f] hover:bg-black/[0.03]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Scholarships</span>
        </Link>
      </div>
    );
  }

  const isVerified = scholarship.verification_status === "verified";

  return (
    <div className="min-h-screen bg-white pb-24 pt-6">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-[12px] text-[#86868b] mb-8">
          <Link href="/" className="hover:text-[#1d1d1f] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#86868b]" />
          <Link href="/scholarships" className="hover:text-[#1d1d1f] transition-colors">
            Scholarships
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#86868b]" />
          <span className="truncate max-w-xs text-[#1d1d1f] font-medium">{scholarship.name}</span>
        </nav>

        {/* Title Header Section */}
        <div className="pb-8 border-b border-black/[0.06]">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#86868b]">
            <span className="font-medium text-[#0071e3]">{scholarship.category}</span>
            <span>•</span>
            <span>{scholarship.provider}</span>
            {isVerified && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[#047857] font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Audited Official Scheme</span>
                </span>
              </>
            )}
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#1d1d1f] leading-tight">
            {scholarship.name}
          </h1>

          {/* Quick Actions Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <a
                href={scholarship.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-6 py-2.5 text-[13px] font-medium text-white shadow-2xs hover:bg-[#333336] transition-all"
              >
                <span>Apply on Official Website</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={toggleBookmark}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors",
                  isBookmarked
                    ? "border-black/[0.1] bg-[#f5f5f7] text-[#1d1d1f]"
                    : "border-black/[0.08] bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
                <span>{isBookmarked ? "Saved" : "Save"}</span>
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                aria-label="Share scholarship link"
                className="rounded-full border border-black/[0.08] bg-white p-2.5 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#047857]" /> : <Share2 className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="text-[12px] text-[#86868b]">
              Last verified: {new Date(scholarship.last_checked_at).toLocaleDateString()} via {scholarship.host_platform}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-b border-black/[0.06]">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
              Award Value
            </div>
            <div className="mt-1 text-[16px] font-semibold text-[#1d1d1f]">
              {scholarship.award_amount}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
              Application Deadline
            </div>
            <div className="mt-1 text-[15px] font-semibold text-[#1d1d1f]">
              {scholarship.application_deadline}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
              Income Limit
            </div>
            <div className="mt-1 text-[14px] font-medium text-[#1d1d1f]">
              {scholarship.family_income_limit}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
              Applicable States
            </div>
            <div className="mt-1 text-[14px] font-medium text-[#1d1d1f] truncate">
              {scholarship.eligible_states.join(", ")}
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content (2 Cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* 1. Overview */}
            <section className="space-y-3">
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                Overview
              </h2>
              <p className="text-[14px] leading-relaxed text-[#6e6e73]">
                {scholarship.description}
              </p>
            </section>

            {/* 2. Award Benefits */}
            {scholarship.award_benefits && scholarship.award_benefits.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                  Benefits & Disbursal Structure
                </h2>
                <ul className="space-y-2.5">
                  {scholarship.award_benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[14px] text-[#6e6e73]">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0071e3] flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 3. Eligibility Criteria */}
            <section className="space-y-3">
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                Eligibility Criteria
              </h2>
              <ul className="space-y-2.5">
                {scholarship.eligibility_criteria.map((criteria, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[14px] text-[#6e6e73]">
                    <Check className="h-4 w-4 text-[#047857] flex-shrink-0 mt-0.5" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Mandatory Documents Checklist */}
            <section className="space-y-3">
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                Required Documents Checklist
              </h2>
              <p className="text-[13px] text-[#86868b]">
                Ensure you have scanned soft copies of these documents ready before opening the application portal:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {scholarship.required_documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-black/[0.06] bg-[#fbfbfd] p-3 text-[13px] text-[#1d1d1f]"
                  >
                    <FileText className="h-4 w-4 text-[#86868b] flex-shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Official Source Notification */}
            <section className="rounded-xl border border-black/[0.06] bg-[#fbfbfd] p-5 space-y-2">
              <h3 className="text-[13px] font-semibold text-[#1d1d1f]">
                Official Source & Verification
              </h3>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">
                This scheme was verified directly against the published guidelines on{" "}
                <a
                  href={scholarship.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#0071e3] hover:underline"
                >
                  {scholarship.source_url}
                </a>
                . ScholarSetu does not accept payments or act as a commercial intermediary.
              </p>
            </section>
          </div>

          {/* Sticky Sidebar (1 Col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 space-y-5">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
                  Application Status
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span className="text-[14px] font-semibold text-[#1d1d1f]">
                    Active Application Window
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-black/[0.06] text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#86868b]">Host Portal</span>
                  <span className="font-medium text-[#1d1d1f] text-right truncate max-w-[150px]">
                    {scholarship.host_platform}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#86868b]">Education</span>
                  <span className="font-medium text-[#1d1d1f] text-right">
                    {scholarship.education_levels.join(", ")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#86868b]">Academic Reqs</span>
                  <span className="font-medium text-[#1d1d1f] text-right text-[12px] max-w-[140px] truncate">
                    {scholarship.academic_requirements}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.06]">
                <a
                  href={scholarship.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1d1d1f] py-3 text-[13px] font-medium text-white hover:bg-[#333336] transition-all"
                >
                  <span>Apply on Official Portal</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
                </a>

                <p className="mt-2 text-center text-[11px] text-[#86868b]">
                  Opens official portal in a new tab
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Opportunities */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-black/[0.06]">
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-6">
              Similar Scholarships in {scholarship.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
