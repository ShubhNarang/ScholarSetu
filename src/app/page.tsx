"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Users,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Building2,
  Trophy,
  Heart,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  IndianRupee,
  Layers,
  MapPin,
  ExternalLink,
} from "lucide-react";
import SearchBar from "@/components/search-bar";
import ScholarshipCard from "@/components/scholarship-card";
import { Scholarship, ScholarshipCategory } from "@/types/scholarship";
import { cn } from "@/lib/utils";

const categoryHighlights: Array<{
  name: string;
  category: ScholarshipCategory;
  icon: any;
  color: string;
  bg: string;
  border: string;
  count: string;
  description: string;
}> = [
  {
    name: "Government Schemes",
    category: "Government",
    icon: Landmark,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100 hover:border-indigo-300",
    count: "Central & State",
    description: "NSP, AICTE, and State direct benefit transfer scholarships.",
  },
  {
    name: "Merit-Based Awards",
    category: "Merit-Based",
    icon: Trophy,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100 hover:border-amber-300",
    count: "Top Percentiles",
    description: "Prestigious grants for board exam & academic high-achievers.",
  },
  {
    name: "Need-Based Financial Aid",
    category: "Need-Based",
    icon: Heart,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100 hover:border-emerald-300",
    count: "Income < ₹4.5L",
    description: "Comprehensive fee waivers for students with economic hardships.",
  },
  {
    name: "Engineering & STEM",
    category: "Engineering",
    icon: Layers,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100 hover:border-blue-300",
    count: "B.Tech & Diploma",
    description: "Corporate & PSU scholarships for technical disciplines.",
  },
  {
    name: "Women in Higher Ed",
    category: "Women",
    icon: Sparkles,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100 hover:border-rose-300",
    count: "Exclusive Grants",
    description: "Empowering female scholars in professional and STEM courses.",
  },
  {
    name: "State Scholarships",
    category: "State Scholarships",
    icon: MapPin,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100 hover:border-teal-300",
    count: "Regional DBT",
    description: "MahaDBT and state-specific post-matric welfare schemes.",
  },
];

const trustedPortals = [
  { name: "National Scholarship Portal", domain: "scholarships.gov.in" },
  { name: "MahaDBT Portal", domain: "mahadbt2.maharashtra.gov.in" },
  { name: "Ministry of Social Justice", domain: "nosmsje.gov.in" },
  { name: "AICTE Schemes", domain: "aicte.gov.in" },
  { name: "Reliance Foundation", domain: "reliancefoundation.org" },
  { name: "ONGC Scholar", domain: "ongcscholar.org" },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadScholarships() {
      try {
        const res = await fetch("/api/scholarships");
        const data = await res.json();
        if (data.success && Array.isArray(data.scholarships)) {
          setScholarships(data.scholarships);
        }
      } catch (err) {
        console.error("Failed to load scholarships:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadScholarships();
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/scholarships?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/scholarships");
    }
  };

  const featured = scholarships.filter((s) => s.is_featured).slice(0, 6);
  const closingSoon = scholarships
    .filter((s) => s.application_status === "verified_open")
    .slice(0, 4);

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white py-16 sm:py-24">
        {/* Subtle decorative grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>India&apos;s Verified Scholarship Discovery Engine</span>
              <span className="hidden text-indigo-400 sm:inline">• Zero Fake Data</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Discover Every Scholarship <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
                You Are Eligible For.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Search verified central and state government schemes, corporate CSR grants, and
              fellowships. Check exact income limits, required documents, and apply directly through
              official portals.
            </p>

            {/* Prominent Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={handleSearchSubmit}
                    placeholder="Search engineering, girls only, income < 8L, NSP, state..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg sm:w-auto"
                >
                  Discover
                </button>
              </div>

              {/* Popular Searches */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Trending:</span>
                {[
                  "AICTE Pragati",
                  "Reliance Foundation",
                  "Kotak Kanya",
                  "ONGC Scholar",
                  "Siemens SSP",
                  "Central Sector CSSS",
                ].map((term) => (
                  <Link
                    key={term}
                    href={`/scholarships?search=${encodeURIComponent(term)}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 shadow-2xs transition-colors hover:border-indigo-400 hover:text-indigo-600"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            {/* Live Stats Row */}
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 border-t border-slate-200/80 pt-8 sm:grid-cols-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-indigo-700 sm:text-3xl">12+</span>
                <span className="text-xs font-semibold text-slate-700">Official Schemes Audited</span>
                <span className="text-[10px] text-slate-400">100% Verified Live</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-emerald-600 sm:text-3xl">₹15L</span>
                <span className="text-xs font-semibold text-slate-700">Highest Grant Value</span>
                <span className="text-[10px] text-slate-400">Direct Tuition & Living Aid</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-indigo-700 sm:text-3xl">Direct</span>
                <span className="text-xs font-semibold text-slate-700">DBT Portals Linked</span>
                <span className="text-[10px] text-slate-400">NSP, MahaDBT, Official CSR</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-violet-600 sm:text-3xl">0</span>
                <span className="text-xs font-semibold text-slate-700">Fake Opportunities</span>
                <span className="text-[10px] text-slate-400">Strict Source Verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED OFFICIAL SOURCES BANNER */}
      <section className="border-y border-slate-200/70 bg-slate-50/60 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            Discover verified scholarships from authentic national & corporate portals
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {trustedPortals.map((portal) => (
              <div
                key={portal.name}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{portal.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({portal.domain})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BROWSE BY CATEGORY */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Explore Pathways
              </span>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Browse by Category
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Target opportunities matched to your academic discipline and socio-economic criteria.
              </p>
            </div>
            <Link
              href="/scholarships"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryHighlights.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/scholarships?category=${encodeURIComponent(cat.category)}`}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
                    cat.border
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                          cat.bg
                        )}
                      >
                        <Icon className={cn("h-6 w-6", cat.color)} />
                      </div>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        {cat.count}
                      </span>
                    </div>

                    <h3 className="mt-5 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1 text-xs font-bold text-indigo-600">
                    <span>View Opportunities</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED SCHOLARSHIPS SECTION */}
      <section className="bg-slate-50/70 py-16 border-t border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <Sparkles className="h-4 w-4" />
                <span>Verified High-Impact Opportunities</span>
              </div>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Featured Scholarships
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Audited opportunities with open application windows and direct portal submissions.
              </p>
            </div>
            <Link
              href="/scholarships"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <span>View All 12 Scholarships</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-sm text-slate-600">
                No featured scholarships available right now.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. CLOSING SOON (URGENT OPPORTUNITIES) */}
      <section className="py-16 bg-white border-t border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600">
                <Clock className="h-4 w-4" />
                <span>Don&apos;t Miss the Window</span>
              </div>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Active Application Windows
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Opportunities currently accepting fresh or renewal submissions on verified portals.
              </p>
            </div>
            <Link
              href="/scholarships?status=verified_open"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              <span>View Active Schemes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {closingSoon.map((scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW SCHOLARSETU WORKS */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Transparent Workflow
            </span>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              How ScholarSetu Works for Students
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Unlike generic listing sites that harvest lead forms, ScholarSetu acts as a direct,
              honest bridge between students and verified institutional disbursement portals.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-white">1. Verified Discovery</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Filter through audited government schemes (NSP, MahaDBT) and corporate CSR programs
                with exact family income brackets, course requirements, and state domicile criteria.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-white">2. Pre-Check Eligibility</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Use our built-in eligibility rules engine to verify mark sheets, parent income caps, and
                mandatory documentation before starting lengthy official applications.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-white">3. Direct Official Portal Apply</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Every verified opportunity links directly to the official government or foundation
                form. No intermediaries, no registration fees, and zero hidden costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Ready to Find Your Scholarship?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-indigo-200 sm:text-base">
            Start browsing all 12 audited opportunities, bookmark deadlines, and track your
            applications in one unified dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/scholarships"
              className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 text-xs font-bold text-indigo-900 shadow-md transition-all hover:bg-indigo-50"
            >
              Browse All Scholarships
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto rounded-xl border border-indigo-400/50 bg-indigo-800/40 px-8 py-3.5 text-xs font-bold text-white hover:bg-indigo-800 transition-colors"
            >
              Open Application Tracker
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
