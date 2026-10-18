"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import ScholarshipCard from "@/components/scholarship-card";
import SearchBar from "@/components/search-bar";
import { Scholarship } from "@/types/scholarship";

export default function HomePage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");
  const [isSearchingLive, setIsSearchingLive] = useState(false);

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

  const handleHeroTinyFishSearch = (query: string) => {
    if (!query.trim()) return;
    setIsSearchingLive(true);
    router.push(`/scholarships?search=${encodeURIComponent(query.trim())}&live=true`);
  };

  const featured = scholarships.filter((s) => s.is_featured).slice(0, 4);

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Verified Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-medium text-[#6e6e73]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#047857]" />
            <span>Official Government & Foundation Portals</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1d1d1f] leading-[1.1]">
            Your future deserves <br className="hidden sm:inline" />
            every opportunity.
          </h1>

          {/* Supporting Text */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#6e6e73] leading-relaxed font-normal">
            Discover scholarships that match your education, circumstances, and ambitions.
            Powered by TinyFish live intelligence across 33 official portals.
          </p>

          {/* Prominent TinyFish Live Search Bar */}
          <div className="mt-10 mx-auto max-w-2xl text-left">
            <SearchBar
              size="large"
              value={heroSearch}
              onChange={setHeroSearch}
              onTinyFishSearch={handleHeroTinyFishSearch}
              isSearchingLive={isSearchingLive}
              placeholder="Search scheme name, course, state (e.g. AICTE Pragati, NSP, Tata)..."
              quickPills={[
                "AICTE Pragati",
                "NSP Post-Matric",
                "Reliance Foundation",
                "Tata Trusts",
                "Saksham (Disability)"
              ]}
            />
          </div>

          {/* Primary & Secondary Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/scholarships?match=open"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3 text-[14px] font-medium text-white shadow-2xs hover:bg-[#333336] active:scale-[0.99] transition-all"
            >
              <span>Match With My Profile</span>
              <ArrowRight className="h-4 w-4 opacity-70" />
            </Link>

            <Link
              href="/scholarships"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-black/[0.1] bg-white px-6 py-3 text-[14px] font-medium text-[#1d1d1f] hover:bg-black/[0.03] transition-colors"
            >
              Browse All Scholarships
            </Link>
          </div>

          {/* RESTful Visual Result Preview — Elegant Apple-Inspired Card */}
          <div className="mt-14 mx-auto max-w-2xl text-left">
            <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span className="text-[12px] font-medium text-[#1d1d1f]">
                    Personalized Match Result Preview
                  </span>
                </div>
                <span className="text-[11px] text-[#86868b]">
                  Matched via Student Profile
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
                    AICTE • Ministry of Education
                  </span>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
                    AICTE Pragati Scholarship for Girl Students
                  </h3>
                  <p className="text-[13px] text-[#6e6e73]">
                    Financial assistance for technical education in recognized degree & diploma programs.
                  </p>
                </div>

                <div className="sm:text-right flex-shrink-0">
                  <span className="text-[11px] text-[#86868b] block">Award Amount</span>
                  <span className="text-[16px] font-semibold text-[#1d1d1f]">
                    ₹50,000 / year
                  </span>
                </div>
              </div>

              {/* Criteria Match Details */}
              <div className="mt-5 rounded-xl bg-white border border-black/[0.05] p-3.5 space-y-2">
                <div className="text-[11px] font-medium text-[#1d1d1f]">
                  Criteria Matched to Your Profile:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#6e6e73]">
                  <div className="flex items-center gap-1.5 text-[#047857]">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Enrolled in B.Tech / Diploma</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#047857]">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Family income within ₹8,00,000</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#047857]">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Female scholar reservation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#047857]">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Direct submission via NSP Portal</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-[#86868b] pt-1">
                <span>Official Host: National Scholarship Portal (scholarships.gov.in)</span>
                <span className="font-medium text-[#0071e3]">100% verified source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST BENEFITS SECTION */}
      <section className="border-t border-black/[0.06] bg-[#fbfbfd] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="space-y-2">
              <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
                Matched to your profile.
              </h3>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                Provide your education level, income slab, and state once. ScholarSetu identifies
                only the schemes whose formal eligibility criteria you actually satisfy.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
                Linked directly to its source.
              </h3>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                Every scholarship is indexed from official government gazettes, NSP, MahaDBT, or
                authorized corporate CSR foundations. No secondary lead brokers.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
                Deadlines and documents in one place.
              </h3>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                Review verified closing dates, required certificates, and application steps
                clearly organized before opening the official submission portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-black/[0.06] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#0071e3]">
              Simple Process
            </h2>
            <h3 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              How ScholarSetu Works
            </h3>
            <p className="mt-2 text-[14px] text-[#6e6e73]">
              Three straightforward steps designed to save students from confusing portal labyrinths.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="relative space-y-3">
              <div className="text-[32px] font-light text-[#86868b] select-none">01</div>
              <h4 className="text-[16px] font-semibold text-[#1d1d1f]">
                Tell us about your education.
              </h4>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                Enter your course, current academic year, domicile state, and income category.
                We never ask for sensitive credentials or Aadhaar numbers.
              </p>
            </div>

            <div className="relative space-y-3">
              <div className="text-[32px] font-light text-[#86868b] select-none">02</div>
              <h4 className="text-[16px] font-semibold text-[#1d1d1f]">
                Discover scholarships that match your profile.
              </h4>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                Review matched central, state, and foundation awards with transparent criteria
                checklists showing exactly why each opportunity applies to you.
              </p>
            </div>

            <div className="relative space-y-3">
              <div className="text-[32px] font-light text-[#86868b] select-none">03</div>
              <h4 className="text-[16px] font-semibold text-[#1d1d1f]">
                Review requirements and apply directly.
              </h4>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                Assemble required marksheets and income certificates, then apply through direct
                links to National Scholarship Portal, MahaDBT, or official CSR portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SCHOLARSHIPS */}
      <section className="border-t border-black/[0.06] bg-[#fbfbfd] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#0071e3]">
                Verified Opportunities
              </h2>
              <h3 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                Featured Scholarships
              </h3>
              <p className="mt-1 text-[14px] text-[#6e6e73]">
                Audited schemes with verified guidelines and direct application portals.
              </p>
            </div>

            <Link
              href="/scholarships"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#0071e3] hover:underline"
            >
              <span>View all scholarships</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-60 animate-pulse rounded-xl border border-black/[0.06] bg-white p-6"
                />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {featured.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-black/[0.06] bg-white p-12 text-center">
              <p className="text-[13px] text-[#6e6e73]">
                No scholarships currently featured.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. ABOUT & REASSURANCE */}
      <section id="about" className="border-t border-black/[0.06] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#6e6e73]">
            Our Commitment to Students
          </h2>
          <h3 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
            Built to reduce friction, not create it.
          </h3>
          <p className="text-[14px] leading-relaxed text-[#6e6e73] max-w-2xl mx-auto">
            ScholarSetu operates with complete transparency. We do not charge application fees,
            harvest private student data, or act as an intermediary. Every eligible student is guided
            directly to the official government or trust authority responsible for disbursement.
          </p>

          <div className="pt-4 flex items-center justify-center gap-6 text-[12px] text-[#86868b]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#047857]" />
              Authentic Sources
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#1d1d1f]" />
              No Data Monetization
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-[#0071e3]" />
              Transparent Rules
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
