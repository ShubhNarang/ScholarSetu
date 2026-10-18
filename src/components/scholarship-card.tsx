"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Calendar,
  GraduationCap,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  Building2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Scholarship } from "@/types/scholarship";
import { cn } from "@/lib/utils";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onBookmarkChange?: (isSaved: boolean) => void;
}

export default function ScholarshipCard({
  scholarship,
  onBookmarkChange,
}: ScholarshipCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("scholarsetu_saved_ids") || "[]");
      setIsBookmarked(saved.includes(scholarship.id));
    } catch {
      // ignore
    }
  }, [scholarship.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("scholarsetu_saved_ids") || "[]");
      let next: string[];
      if (saved.includes(scholarship.id)) {
        next = saved.filter((id) => id !== scholarship.id);
        setIsBookmarked(false);
        onBookmarkChange?.(false);
      } else {
        next = [...saved, scholarship.id];
        setIsBookmarked(true);
        onBookmarkChange?.(true);
      }
      localStorage.setItem("scholarsetu_saved_ids", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Calculate days left
  const calculateDaysLeft = (deadline: string) => {
    try {
      const diff = new Date(deadline).getTime() - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days < 0) return "Application Closed";
      if (days === 0) return "Last Day Today";
      if (days === 1) return "1 Day Left";
      return `${days} Days Left`;
    } catch {
      return "Active Cycle";
    }
  };

  const daysLeftText = calculateDaysLeft(scholarship.application_deadline);
  const isClosingSoon = daysLeftText.includes("Day") || daysLeftText.includes("Today");

  // Get provider initial
  const providerInitial = scholarship.provider.charAt(0).toUpperCase();

  // Category styles
  const categoryBadgeColors: Record<string, string> = {
    Government: "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Merit-Based": "bg-amber-50 text-amber-700 border-amber-200",
    "Need-Based": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Engineering: "bg-blue-50 text-blue-700 border-blue-200",
    Women: "bg-rose-50 text-rose-700 border-rose-200",
    "School Students": "bg-purple-50 text-purple-700 border-purple-200",
    Undergraduate: "bg-sky-50 text-sky-700 border-sky-200",
    Postgraduate: "bg-violet-50 text-violet-700 border-violet-200",
    "State Scholarships": "bg-teal-50 text-teal-700 border-teal-200",
  };

  const badgeClass =
    categoryBadgeColors[scholarship.category] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl">
      <div>
        {/* Top Header: Provider Avatar, Name & Bookmark Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 text-sm font-bold text-indigo-700 ring-1 ring-slate-200/80">
              {providerInitial}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                    badgeClass
                  )}
                >
                  {scholarship.category}
                </span>
                {scholarship.verification_status === "verified" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/60">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    Needs Verification
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                {scholarship.provider}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove from bookmarks" : "Save scholarship"}
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-all",
              isBookmarked
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          </button>
        </div>

        {/* Title */}
        <Link href={`/scholarships/${scholarship.id}`} className="mt-3.5 block">
          <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
            {scholarship.name}
          </h3>
        </Link>

        {/* Description Snippet */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {scholarship.description}
        </p>

        {/* Key Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-700 border border-slate-100">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <div>
              <span className="block text-[10px] font-medium text-slate-400">Award Amount</span>
              <span className="font-bold text-slate-900">{scholarship.award_amount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock
              className={cn(
                "h-4 w-4 flex-shrink-0",
                isClosingSoon ? "text-rose-600 animate-pulse" : "text-indigo-600"
              )}
            />
            <div>
              <span className="block text-[10px] font-medium text-slate-400">Deadline</span>
              <span
                className={cn(
                  "font-bold",
                  isClosingSoon ? "text-rose-600" : "text-slate-900"
                )}
              >
                {daysLeftText}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 flex-shrink-0 text-indigo-500" />
            <div className="min-w-0">
              <span className="block text-[10px] font-medium text-slate-400">Eligibility</span>
              <span className="block truncate font-medium text-slate-800">
                {scholarship.education_levels.slice(0, 2).join(", ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-slate-500" />
            <div className="min-w-0">
              <span className="block text-[10px] font-medium text-slate-400">Location</span>
              <span className="block truncate font-medium text-slate-800">
                {scholarship.eligible_states[0] || "All India"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Criteria Highlights */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {scholarship.family_income_limit && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              Max: {scholarship.family_income_limit}
            </span>
          )}
          {scholarship.host_platform && (
            <span className="rounded-md bg-indigo-50/70 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
              via {scholarship.host_platform}
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100">
        <Link
          href={`/scholarships/${scholarship.id}`}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          View Details
        </Link>

        {scholarship.verification_status === "verified" ? (
          <a
            href={scholarship.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 hover:shadow-md"
          >
            <span>Apply Now</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <a
            href={scholarship.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-amber-700"
            title="Application link needs verification. Link opens official source."
          >
            <span>Verify & Apply</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
