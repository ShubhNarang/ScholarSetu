"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  ArrowRight,
  Trash2,
} from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { Scholarship, StudentApplication } from "@/types/scholarship";
import { cn } from "@/lib/utils";

const INITIAL_APPLICATIONS: StudentApplication[] = [
  {
    id: "app-1",
    scholarshipId: "nsp-aicte-pragati",
    scholarshipName: "AICTE Pragati Scholarship Scheme for Girl Students",
    provider: "AICTE, Ministry of Education",
    appliedDate: "2024-09-12",
    status: "Under Review",
    applicationPortal: "National Scholarship Portal (NSP)",
    awardAmount: "₹50,000 / year",
    notes: "OTR verified on NSP. College nodal officer verification completed.",
  },
  {
    id: "app-2",
    scholarshipId: "reliance-foundation-ug",
    scholarshipName: "Reliance Foundation Undergraduate Scholarships",
    provider: "Reliance Foundation",
    appliedDate: "2024-08-28",
    status: "Applied",
    applicationPortal: "Reliance Foundation Portal",
    awardAmount: "Up to ₹2,00,000",
    notes: "Online aptitude test screening scheduled.",
  },
  {
    id: "app-3",
    scholarshipId: "nsp-pmusp-csss",
    scholarshipName: "PM-USP Central Sector Scheme of Scholarship (CSSS)",
    provider: "Ministry of Education",
    appliedDate: "2024-07-20",
    status: "Accepted",
    applicationPortal: "National Scholarship Portal (NSP)",
    awardAmount: "₹12,000 / year",
    notes: "Disbursement credited to Aadhaar-seeded bank account.",
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"saved" | "applications" | "deadlines" | "profile">("saved");
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>(INITIAL_APPLICATIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Profile
  const [profile, setProfile] = useState({
    fullName: "Aarav Sharma",
    email: "aarav.sharma@example.edu.in",
    educationLevel: "Undergraduate",
    course: "B.Tech Computer Science",
    state: "Maharashtra",
    familyIncome: "3,50,000",
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch("/api/scholarships");
        const data = await res.json();
        if (data.success && Array.isArray(data.scholarships)) {
          setAllScholarships(data.scholarships);
        }

        const storedSaved = JSON.parse(localStorage.getItem("scholarsetu_saved_ids") || "[]");
        if (storedSaved.length === 0) {
          const defaults = ["nsp-aicte-pragati", "reliance-foundation-ug", "kotak-kanya-scholarship"];
          setSavedIds(defaults);
          localStorage.setItem("scholarsetu_saved_ids", JSON.stringify(defaults));
        } else {
          setSavedIds(storedSaved);
        }

        const storedApps = localStorage.getItem("scholarsetu_applications");
        if (storedApps) {
          setApplications(JSON.parse(storedApps));
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initDashboard();
  }, []);

  const savedScholarships = allScholarships.filter((s) => savedIds.includes(s.id));

  const removeBookmark = (id: string) => {
    const next = savedIds.filter((item) => item !== id);
    setSavedIds(next);
    localStorage.setItem("scholarsetu_saved_ids", JSON.stringify(next));
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Page Header */}
        <div className="pb-6 border-b border-black/[0.06]">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#0071e3]">
            Student Workspace
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            Application & Deadline Tracker
          </h1>
          <p className="mt-1 text-[13px] text-[#6e6e73]">
            Keep track of your saved scholarship opportunities, submitted official applications, and approaching deadlines.
          </p>
        </div>

        {/* Apple-Style Segmented Navigation Tabs */}
        <div className="mt-6 flex items-center border-b border-black/[0.06]">
          <nav className="flex space-x-6 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={cn(
                "pb-3 transition-colors relative cursor-pointer",
                activeTab === "saved"
                  ? "text-[#1d1d1f] font-semibold"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              )}
            >
              <span>Saved Scholarships ({savedScholarships.length})</span>
              {activeTab === "saved" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d1d1f]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className={cn(
                "pb-3 transition-colors relative cursor-pointer",
                activeTab === "applications"
                  ? "text-[#1d1d1f] font-semibold"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              )}
            >
              <span>Submitted Applications ({applications.length})</span>
              {activeTab === "applications" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d1d1f]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("deadlines")}
              className={cn(
                "pb-3 transition-colors relative cursor-pointer",
                activeTab === "deadlines"
                  ? "text-[#1d1d1f] font-semibold"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              )}
            >
              <span>Upcoming Deadlines</span>
              {activeTab === "deadlines" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d1d1f]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={cn(
                "pb-3 transition-colors relative cursor-pointer",
                activeTab === "profile"
                  ? "text-[#1d1d1f] font-semibold"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              )}
            >
              <span>My Profile</span>
              {activeTab === "profile" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d1d1f]" />
              )}
            </button>
          </nav>
        </div>

        {/* Tab 1: Saved Scholarships */}
        {activeTab === "saved" && (
          <div className="mt-8">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl border border-black/[0.06] bg-[#fbfbfd]" />
                ))}
              </div>
            ) : savedScholarships.length > 0 ? (
              <div className="space-y-3">
                {savedScholarships.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-black/[0.07] bg-white p-5 transition-all hover:border-black/[0.14]"
                  >
                    <div>
                      <span className="text-[11px] font-medium text-[#86868b]">
                        {s.provider} • {s.category}
                      </span>
                      <Link href={`/scholarships/${s.id}`} className="block mt-0.5">
                        <h3 className="text-[15px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
                          {s.name}
                        </h3>
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-[#6e6e73]">
                        <span>Award: <strong>{s.award_amount}</strong></span>
                        <span>•</span>
                        <span>Deadline: {s.application_deadline}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.06]">
                      <a
                        href={s.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#333336] transition-colors"
                      >
                        Apply Official
                      </a>
                      <button
                        type="button"
                        onClick={() => removeBookmark(s.id)}
                        aria-label="Remove bookmark"
                        className="rounded-full p-2 text-[#86868b] hover:bg-black/[0.04] hover:text-[#dc2626]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-12 text-center">
                <Bookmark className="mx-auto h-6 w-6 text-[#86868b]" />
                <h3 className="mt-3 text-[15px] font-semibold text-[#1d1d1f]">
                  No saved scholarships yet
                </h3>
                <p className="mt-1 text-[13px] text-[#6e6e73] max-w-sm mx-auto">
                  Browse opportunities and tap the bookmark icon on any card to save it for review.
                </p>
                <Link
                  href="/scholarships"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-5 py-2 text-[12px] font-medium text-white hover:bg-[#333336]"
                >
                  <span>Explore Scholarships</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Applications Tracker */}
        {activeTab === "applications" && (
          <div className="mt-8">
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-black/[0.07] bg-white p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-medium text-[#86868b]">{app.provider}</span>
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                        {app.scholarshipName}
                      </h3>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#6e6e73] pt-2 border-t border-black/[0.05]">
                    <span>Portal: <strong>{app.applicationPortal}</strong></span>
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    <span>Award: {app.awardAmount}</span>
                  </div>

                  {app.notes && (
                    <div className="rounded-lg bg-[#fbfbfd] border border-black/[0.04] p-2.5 text-[12px] text-[#6e6e73]">
                      <strong>Application note:</strong> {app.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Deadlines */}
        {activeTab === "deadlines" && (
          <div className="mt-8 space-y-3">
            {allScholarships
              .filter((s) => s.application_status === "verified_open")
              .map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-black/[0.07] bg-white p-4"
                >
                  <div>
                    <span className="text-[11px] font-medium text-[#86868b]">{s.provider}</span>
                    <Link href={`/scholarships/${s.id}`} className="block">
                      <h4 className="text-[14px] font-semibold text-[#1d1d1f] hover:text-[#0071e3]">
                        {s.name}
                      </h4>
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 text-[12px]">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-[#86868b] block">Official Deadline</span>
                      <span className="font-semibold text-[#1d1d1f]">{s.application_deadline}</span>
                    </div>

                    <Link
                      href={`/scholarships/${s.id}`}
                      className="rounded-full border border-black/[0.08] px-3.5 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-black/[0.03]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 4: Student Profile */}
        {activeTab === "profile" && (
          <div className="mt-8 max-w-xl">
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Education Level</label>
                  <input
                    type="text"
                    value={profile.educationLevel}
                    onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                    className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Domicile State</label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Annual Family Income (₹)</label>
                <input
                  type="text"
                  value={profile.familyIncome}
                  onChange={(e) => setProfile({ ...profile, familyIncome: e.target.value })}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#fbfbfd] px-3.5 py-2 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-[#1d1d1f] px-6 py-2 text-[13px] font-medium text-white hover:bg-[#333336] transition-colors"
                >
                  Save Profile
                </button>
                {profileSavedMsg && (
                  <span className="text-[12px] font-medium text-[#047857]">
                    Profile updated successfully.
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
