"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Scholarship } from "@/types/scholarship";
import { cn } from "@/lib/utils";

interface MatchExplanation {
  matchReasons?: string[];
  missingCriteria?: string[];
}

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onBookmarkChange?: (isSaved: boolean) => void;
  matchData?: MatchExplanation;
  viewMode?: "grid" | "list";
}

export default function ScholarshipCard({
  scholarship,
  onBookmarkChange,
  matchData,
  viewMode = "grid",
}: ScholarshipCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("scholarsetu_saved_ids") || "[]");
        setIsBookmarked(saved.includes(scholarship.id));
      } catch {
        // ignore
      }
    }, 0);

    return () => clearTimeout(timer);
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

  const isVerified = scholarship.verification_status === "verified";

  // List view representation
  if (viewMode === "list") {
    return (
      <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-black/[0.07] bg-white p-5 transition-all hover:border-black/[0.14] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#86868b]">
            <span>{scholarship.provider}</span>
            <span>•</span>
            <span>{scholarship.category}</span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-[#047857] font-medium">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified Source</span>
              </span>
            )}
          </div>

          <Link href={`/scholarships/${scholarship.id}`} className="mt-1 block">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors leading-snug">
              {scholarship.name}
            </h3>
          </Link>

          <p className="mt-1 text-[13px] text-[#6e6e73] line-clamp-1">
            {scholarship.description}
          </p>

          {/* Criteria Match pill if available */}
          {matchData && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              {matchData.missingCriteria && matchData.missingCriteria.length === 0 ? (
                <span className="inline-flex items-center gap-1 text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded-md font-medium">
                  <Check className="h-3 w-3" />
                  <span>Meets {matchData.matchReasons?.length || 4} checked criteria</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#b45309] bg-[#fffbeb] px-2 py-0.5 rounded-md font-medium">
                  <span>{matchData.missingCriteria?.[0] || "Review scheme conditions"}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/[0.06] flex-shrink-0">
          <div className="text-left sm:text-right">
            <div className="text-[14px] font-semibold text-[#1d1d1f]">
              {scholarship.award_amount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#86868b] mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>{scholarship.application_deadline}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleBookmark}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark scholarship"}
              className={cn(
                "rounded-full p-2 text-[#86868b] hover:bg-black/[0.04] transition-colors",
                isBookmarked && "text-[#1d1d1f] fill-current"
              )}
            >
              <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            </button>

            <Link
              href={`/scholarships/${scholarship.id}`}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0071e3] hover:underline"
            >
              <span>View details</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view representation (Default)
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-black/[0.07] bg-white p-5 transition-all hover:border-black/[0.14] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div>
        {/* Header: Provider & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#86868b]">
            <span className="font-medium">{scholarship.category}</span>
            {isVerified && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[#047857] font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified</span>
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark scholarship"}
            className={cn(
              "rounded-full p-1.5 text-[#86868b] hover:bg-black/[0.04] hover:text-[#1d1d1f] transition-colors -mr-1 -mt-1",
              isBookmarked && "text-[#1d1d1f] fill-current"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current text-[#1d1d1f]")} />
          </button>
        </div>

        {/* Title */}
        <Link href={`/scholarships/${scholarship.id}`} className="mt-2 block">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors leading-snug line-clamp-2">
            {scholarship.name}
          </h3>
        </Link>

        {/* Provider */}
        <p className="mt-1 text-[12px] text-[#86868b] line-clamp-1">
          {scholarship.provider}
        </p>

        {/* Description */}
        <p className="mt-2.5 text-[13px] text-[#6e6e73] line-clamp-2 leading-relaxed">
          {scholarship.description}
        </p>

        {/* Match Status explanation if profile active */}
        {matchData && (
          <div className="mt-3">
            {matchData.missingCriteria && matchData.missingCriteria.length === 0 ? (
              <div className="inline-flex items-center gap-1 rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-medium text-[#047857]">
                <Check className="h-3 w-3" />
                <span>Meets checked criteria</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-md bg-[#fffbeb] px-2 py-0.5 text-[11px] font-medium text-[#b45309]">
                <span>{matchData.missingCriteria?.[0] || "Review specific criteria"}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Facts */}
      <div className="mt-5 border-t border-black/[0.05] pt-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#86868b] font-medium">
              Award
            </div>
            <div className="text-[13px] font-semibold text-[#1d1d1f]">
              {scholarship.award_amount}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#86868b] font-medium">
              Deadline
            </div>
            <div className="text-[12px] font-medium text-[#6e6e73]">
              {scholarship.application_deadline}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#86868b]">
            Via {scholarship.host_platform.split(" ")[0]}
          </span>
          <Link
            href={`/scholarships/${scholarship.id}`}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0071e3] hover:underline"
          >
            <span>Details</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
