"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  RotateCcw,
  ShieldCheck,
  Grid3X3,
  List,
  X,
  UserCheck,
  Sparkles,
} from "lucide-react";
import ScholarshipCard from "@/components/scholarship-card";
import ProfileMatchModal, { StudentProfile } from "@/components/profile-match-modal";
import { evaluateScholarshipMatch } from "@/lib/eligibility-matcher";
import { Scholarship } from "@/types/scholarship";
import { categories, educationLevels, states, courses } from "@/lib/data";
import { cn } from "@/lib/utils";

function ScholarshipsDiscoveryContent() {
  const searchParams = useSearchParams();

  // Data & View State
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // Filters State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "All");
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get("course") || "All");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "All");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "deadline" | "amount_high" | "amount_low" | "recently_checked">("popular");

  // Load student profile from localStorage & check URL trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("scholarsetu_student_profile");
        if (stored) {
          setStudentProfile(JSON.parse(stored));
        }
      } catch {
        // ignore
      }

      if (searchParams.get("match") === "open") {
        setIsMatchModalOpen(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Load scholarships from API
  useEffect(() => {
    async function fetchFiltered() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        if (selectedLevel !== "All") params.set("educationLevel", selectedLevel);
        if (selectedCourse !== "All") params.set("course", selectedCourse);
        if (selectedState !== "All") params.set("state", selectedState);
        if (selectedStatus !== "All") params.set("status", selectedStatus);
        if (sortBy) params.set("sortBy", sortBy);

        const res = await fetch(`/api/scholarships?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.scholarships)) {
          let list: Scholarship[] = data.scholarships;
          if (verifiedOnly) {
            list = list.filter((s) => s.verification_status === "verified");
          }
          setScholarships(list);
        }
      } catch (err) {
        console.error("Error fetching filtered scholarships:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchFiltered, 120);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLevel, selectedCourse, selectedState, selectedStatus, verifiedOnly, sortBy]);

  // Sync category & search params if URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search");
    if (cat || q) {
      const timer = setTimeout(() => {
        if (cat) setSelectedCategory(cat);
        if (q) setSearch(q);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleProfileSubmit = (profile: StudentProfile) => {
    setStudentProfile(profile);
    try {
      localStorage.setItem("scholarsetu_student_profile", JSON.stringify(profile));
    } catch {
      // ignore
    }
  };

  const clearProfile = () => {
    setStudentProfile(null);
    try {
      localStorage.removeItem("scholarsetu_student_profile");
    } catch {
      // ignore
    }
  };

  const resetAllFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedCourse("All");
    setSelectedState("All");
    setSelectedStatus("All");
    setVerifiedOnly(false);
    setSortBy("popular");
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedCategory !== "All" ||
    selectedLevel !== "All" ||
    selectedCourse !== "All" ||
    selectedState !== "All" ||
    selectedStatus !== "All" ||
    verifiedOnly;

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header Title with Subtlety */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <span className="text-[12px] font-medium uppercase tracking-wider text-[#0071e3]">
              Scholarship Discovery
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              {studentProfile ? "Recommended for Your Profile" : "All Available Scholarships"}
            </h1>
            <p className="mt-1 text-[13px] text-[#6e6e73]">
              Browse verified central, state, and foundation opportunities with direct portal links.
            </p>
          </div>

          {/* View Mode Segmented Control */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-black/[0.08] bg-[#f5f5f7] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-white text-[#1d1d1f] shadow-2xs"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "list"
                    ? "bg-white text-[#1d1d1f] shadow-2xs"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Personalized Matching Reassurance Banner */}
        <div className="mt-6">
          {studentProfile ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-[#fbfbfd] p-4 text-[13px]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ecfdf5] text-[#047857]">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#1d1d1f]">Profile active: </span>
                  <span className="text-[#6e6e73]">
                    {studentProfile.educationLevel} • {studentProfile.course} • {studentProfile.state} • Income ≤ ₹{studentProfile.annualIncome.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(true)}
                  className="rounded-full border border-black/[0.1] bg-white px-3.5 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-black/[0.03]"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={clearProfile}
                  className="rounded-full px-2.5 py-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f]"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-[#fbfbfd] p-4 text-[13px]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f6ff] text-[#0071e3]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#1d1d1f]">Match your profile: </span>
                  <span className="text-[#6e6e73]">
                    Answer 3 quick questions to highlight scholarships you are eligible for.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMatchModalOpen(true)}
                className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#333336] transition-colors"
              >
                Find My Matches
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="mt-6 space-y-3">
          {/* Search & Sort Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scheme name, provider, course, or keyword…"
                className="w-full rounded-xl border border-black/[0.08] bg-[#fbfbfd] py-2 pl-9 pr-9 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:bg-white focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Verified Only Checkbox */}
              <label className="flex items-center gap-1.5 text-[12px] text-[#6e6e73] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-[#0071e3]"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#047857]" />
                  Verified sources only
                </span>
              </label>

              {/* Sort By Select */}
              <div className="flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-lg border border-black/[0.08] bg-[#fbfbfd] py-1 px-2.5 text-[12px] font-medium text-[#1d1d1f] focus:outline-none"
                >
                  <option value="popular">Most Relevant</option>
                  <option value="deadline">Closing Soonest</option>
                  <option value="amount_high">Award Amount: High to Low</option>
                  <option value="amount_low">Award Amount: Low to High</option>
                  <option value="recently_checked">Recently Audited</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary Facets Dropdowns (State, Course, Level) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-black/[0.08] bg-[#fbfbfd] py-1 px-2.5 text-[#1d1d1f] focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="rounded-lg border border-black/[0.08] bg-[#fbfbfd] py-1 px-2.5 text-[#1d1d1f] focus:outline-none"
            >
              <option value="All">All States / UTs</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg border border-black/[0.08] bg-[#fbfbfd] py-1 px-2.5 text-[#1d1d1f] focus:outline-none"
            >
              <option value="All">All Education Levels</option>
              {educationLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-lg border border-black/[0.08] bg-[#fbfbfd] py-1 px-2.5 text-[#1d1d1f] focus:outline-none"
            >
              <option value="All">All Courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-[#b45309] hover:bg-[#fffbeb] transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-6 flex items-center justify-between text-[12px] text-[#86868b] border-t border-black/[0.06] pt-4">
          <span>
            Showing <strong>{scholarships.length}</strong> {scholarships.length === 1 ? "scholarship" : "scholarships"} based on actual database records
          </span>
          {hasActiveFilters && (
            <span className="text-[#6e6e73]">Filtered results</span>
          )}
        </div>

        {/* Results Listing */}
        <div className="mt-5">
          {isLoading ? (
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            )}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-black/[0.06] bg-[#fbfbfd]"
                />
              ))}
            </div>
          ) : scholarships.length > 0 ? (
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            )}>
              {scholarships.map((scholarship) => {
                const matchData = studentProfile
                  ? evaluateScholarshipMatch(scholarship, studentProfile)
                  : undefined;
                return (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                    matchData={matchData}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-12 text-center">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                No matching scholarships found
              </h3>
              <p className="mt-1 text-[13px] text-[#6e6e73] max-w-sm mx-auto">
                Try widening your search filters or resetting domicile and category constraints.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-4 py-2 text-[12px] font-medium text-[#1d1d1f] hover:bg-black/[0.03]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Matching Guided Onboarding Modal */}
      <ProfileMatchModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        onProfileSubmit={handleProfileSubmit}
        currentProfile={studentProfile}
      />
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
        </div>
      }
    >
      <ScholarshipsDiscoveryContent />
    </Suspense>
  );
}
