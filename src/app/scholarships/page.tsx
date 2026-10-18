"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Grid3X3,
  List,
  Sparkles,
  IndianRupee,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ScholarshipCard from "@/components/scholarship-card";
import { Scholarship, ScholarshipCategory } from "@/types/scholarship";
import { categories, educationLevels, states, courses } from "@/lib/data";
import { cn } from "@/lib/utils";

function ScholarshipsDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "All");
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get("course") || "All");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "All");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "All");
  const [sortBy, setSortBy] = useState<"popular" | "deadline" | "amount_high" | "amount_low" | "recently_checked">("popular");

  // Load from API
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
          setScholarships(data.scholarships);
        }
      } catch (err) {
        console.error("Error fetching filtered scholarships:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchFiltered, 150);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLevel, selectedCourse, selectedState, selectedStatus, sortBy]);

  // Sync category param if URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get("search");
    if (q && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);

  const resetAllFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedCourse("All");
    setSelectedState("All");
    setSelectedStatus("All");
    setSortBy("popular");
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedCategory !== "All" ||
    selectedLevel !== "All" ||
    selectedCourse !== "All" ||
    selectedState !== "All" ||
    selectedStatus !== "All";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                Discovery Engine
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                Audited Portals Only
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Scholarship Opportunities
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Browse genuine central, state, and corporate CSR opportunities with direct portal application links.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 lg:hidden"
            >
              <Filter className="h-4 w-4 text-slate-500" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-lg p-1.5 text-slate-500 transition-colors",
                  viewMode === "grid" ? "bg-indigo-50 text-indigo-700" : "hover:text-slate-900"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-lg p-1.5 text-slate-500 transition-colors",
                  viewMode === "list" ? "bg-indigo-50 text-indigo-700" : "hover:text-slate-900"
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              selectedCategory === "All"
                ? "bg-indigo-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            All Opportunities
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 2-Column Discovery Grid */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                  <span>Filters</span>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Search Keywords
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="E.g. AICTE, Reliance, Girls..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Education Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
                >
                  <option value="All">All Education Levels</option>
                  {educationLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stream / Course */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Degree / Stream
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
                >
                  <option value="All">All Degrees & Streams</option>
                  {courses.map((crs) => (
                    <option key={crs} value={crs}>
                      {crs}
                    </option>
                  ))}
                </select>
              </div>

              {/* State / Domicile */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  State / Domicile
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
                >
                  <option value="All">All India & States</option>
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Application Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Application Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
                >
                  <option value="All">All Active Statuses</option>
                  <option value="verified_open">Verified & Open Now</option>
                  <option value="opening_later">Opening Soon</option>
                </select>
              </div>

              {/* Info Disclaimer */}
              <div className="rounded-xl bg-indigo-50/70 p-3 text-[11px] leading-relaxed text-indigo-900 border border-indigo-100">
                <span className="font-bold">Verified Direct Links:</span> Every opportunity on
                ScholarSetu points directly to the real application form on official portals (NSP,
                MahaDBT, Reliance).
              </div>
            </div>
          </aside>

          {/* MAIN RESULTS AREA */}
          <main className="lg:col-span-3">
            {/* Results Status & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {isLoading ? "Searching verified schemes..." : `${scholarships.length} Opportunities Available`}
                </span>
                {hasActiveFilters && (
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
                    Filtered
                  </span>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="popular">Most Relevant / Popular</option>
                  <option value="deadline">Deadline: Ending Soonest</option>
                  <option value="amount_high">Award Amount: High to Low</option>
                  <option value="amount_low">Award Amount: Low to High</option>
                  <option value="recently_checked">Recently Audited</option>
                </select>
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pb-4">
                {search && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    Query: &quot;{search}&quot;
                    <button type="button" onClick={() => setSearch("")} className="hover:text-slate-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    Category: {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory("All")} className="hover:text-indigo-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedLevel !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    Level: {selectedLevel}
                    <button type="button" onClick={() => setSelectedLevel("All")} className="hover:text-indigo-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCourse !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    Course: {selectedCourse}
                    <button type="button" onClick={() => setSelectedCourse("All")} className="hover:text-indigo-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedState !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    State: {selectedState}
                    <button type="button" onClick={() => setSelectedState("All")} className="hover:text-indigo-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* SCHOLARSHIP CARDS CONTAINER */}
            {isLoading ? (
              <div
                className={cn(
                  "grid gap-5",
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  />
                ))}
              </div>
            ) : scholarships.length > 0 ? (
              <div
                className={cn(
                  "grid gap-5",
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}
              >
                {scholarships.map((s) => (
                  <ScholarshipCard key={s.id} scholarship={s} />
                ))}
              </div>
            ) : (
              /* Professional Empty State */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No verified scholarships found
                </h3>
                <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
                  No verified scholarships are available for these filters right now. Try changing your
                  filters or explore other categories.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    Reset All Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetAllFilters();
                      setSelectedCategory("Government");
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Explore Government Schemes
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-xs lg:hidden">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Education Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  <option value="All">All Levels</option>
                  {educationLevels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  <option value="All">All Courses</option>
                  {courses.map((crs) => (
                    <option key={crs} value={crs}>
                      {crs}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  <option value="All">All States</option>
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      }
    >
      <ScholarshipsDiscoveryContent />
    </Suspense>
  );
}
