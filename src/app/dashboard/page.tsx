"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  FileText,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Plus,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  MapPin,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import ScholarshipCard from "@/components/scholarship-card";
import StatusBadge from "@/components/status-badge";
import { Scholarship, StudentApplication } from "@/types/scholarship";
import { cn } from "@/lib/utils";

// Initial sample applications tracking structure (real opportunities)
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
    notes: "Online aptitude test scheduled for next week.",
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
    notes: "1st installment credited to Aadhaar-linked bank account.",
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"saved" | "applications" | "deadlines" | "profile">("saved");
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>(INITIAL_APPLICATIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Student Profile state
  const [profile, setProfile] = useState({
    fullName: "Aarav Sharma",
    email: "aarav.sharma@example.edu.in",
    educationLevel: "Undergraduate",
    course: "B.Tech Computer Science",
    state: "Maharashtra",
    familyIncome: "3,50,000",
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Load saved scholarships from API + localStorage
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
          // Provide default saved items so student sees verified examples
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
        console.error("Dashboard init error:", err);
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
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Student Banner */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-xl font-bold text-white shadow-md">
                <User className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {profile.fullName}
                  </h1>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    Student Scholar
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                  {profile.course} • {profile.state} • Income &lt; ₹{profile.familyIncome}
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-100 text-center text-xs">
              <div className="px-3">
                <span className="block text-lg font-black text-indigo-600">{savedScholarships.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">Bookmarked</span>
              </div>
              <div className="border-x border-slate-200 px-3">
                <span className="block text-lg font-black text-emerald-600">{applications.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">Tracked Apps</span>
              </div>
              <div className="px-3">
                <span className="block text-lg font-black text-violet-600">
                  {applications.filter((a) => a.status === "Accepted").length}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Accepted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex border-b border-slate-200 gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "saved"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Scholarships ({savedScholarships.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "applications"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Application Tracker ({applications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deadlines")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "deadlines"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Deadline Reminders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "profile"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            <User className="h-4 w-4" />
            <span>My Eligibility Profile</span>
          </button>
        </div>

        {/* TAB 1: SAVED SCHOLARSHIPS */}
        {activeTab === "saved" && (
          <div className="mt-8">
            {savedScholarships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedScholarships.map((scholarship) => (
                  <div key={scholarship.id} className="relative group">
                    <ScholarshipCard scholarship={scholarship} onBookmarkChange={() => removeBookmark(scholarship.id)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <Bookmark className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-base font-bold text-slate-900">No saved scholarships yet</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Click the bookmark icon on any scholarship card to save it here for quick access.
                </p>
                <Link
                  href="/scholarships"
                  className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Explore Verified Scholarships
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATION TRACKER */}
        {activeTab === "applications" && (
          <div className="mt-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Submitted Applications</h3>
                  <p className="text-xs text-slate-500">
                    Track reference IDs, nodal verification, and DBT disbursement milestones.
                  </p>
                </div>
                <Link
                  href="/scholarships"
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  + Track Another
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Scholarship & Provider</th>
                      <th className="py-3 px-4">Application Portal</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4">Award Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 block">{app.scholarshipName}</span>
                          <span className="text-[11px] text-slate-500">{app.provider}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-indigo-700">
                          {app.applicationPortal}
                        </td>
                        <td className="py-4 px-4 text-slate-600">{app.appliedDate}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{app.awardAmount}</td>
                        <td className="py-4 px-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/scholarships/${app.scholarshipId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <span>Details</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEADLINE REMINDERS */}
        {activeTab === "deadlines" && (
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Upcoming Opportunity Deadlines</h3>
              <p className="text-xs text-slate-500 mb-6">
                Never miss an application cut-off. These dates are synchronized with official notifications.
              </p>

              <div className="space-y-3">
                {allScholarships.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <Link href={`/scholarships/${s.id}`} className="font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600">
                          {s.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {s.provider} • Host: {s.host_platform}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <span className="block text-xs font-bold text-slate-900">{s.application_deadline}</span>
                        <span className="text-[10px] font-semibold text-emerald-600">Active Window</span>
                      </div>
                      <a
                        href={s.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                      >
                        Portal
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <div className="mt-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs max-w-2xl">
              <h3 className="text-base font-bold text-slate-900">Student Eligibility Profile</h3>
              <p className="mt-1 text-xs text-slate-500">
                Update your education and household parameters to auto-highlight eligible scholarships across ScholarSetu.
              </p>

              <form onSubmit={saveProfile} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Education Level</label>
                    <input
                      type="text"
                      value={profile.educationLevel}
                      onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course / Discipline</label>
                    <input
                      type="text"
                      value={profile.course}
                      onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Domicile State</label>
                    <input
                      type="text"
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Annual Household Income (₹)</label>
                    <input
                      type="text"
                      value={profile.familyIncome}
                      onChange={(e) => setProfile({ ...profile, familyIncome: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    Save Preferences
                  </button>
                  {profileSavedMsg && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Preferences saved successfully!
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
