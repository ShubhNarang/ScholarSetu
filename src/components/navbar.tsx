"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
  Search,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Bookmark,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoriesList = [
  { label: "Government Scholarships", href: "/scholarships?category=Government" },
  { label: "Merit-Based Schemes", href: "/scholarships?category=Merit-Based" },
  { label: "Need-Based Financial Aid", href: "/scholarships?category=Need-Based" },
  { label: "Engineering & STEM", href: "/scholarships?category=Engineering" },
  { label: "Women & Girl Students", href: "/scholarships?category=Women" },
  { label: "School Students (1-12)", href: "/scholarships?category=School+Students" },
  { label: "Undergraduate Degrees", href: "/scholarships?category=Undergraduate" },
  { label: "Postgraduate & Research", href: "/scholarships?category=Postgraduate" },
  { label: "State Government Schemes", href: "/scholarships?category=State+Scholarships" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 px-4 py-1.5 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span className="font-medium">100% Verified Opportunities</span>
            <span className="hidden text-indigo-200 sm:inline">
              — Direct application links to National Scholarship Portal, MahaDBT & Official CSR Trusts
            </span>
          </div>
          <Link
            href="/admin/sync"
            className="flex items-center gap-1 font-medium text-indigo-100 hover:text-white hover:underline"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Live Audit Engine</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Scholar<span className="text-indigo-600">Setu</span>
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                Official Scholarship Discovery
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                pathname === "/"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              Discover
            </Link>

            <Link
              href="/scholarships"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                pathname === "/scholarships"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              Scholarships
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setCategoriesOpen((prev) => !prev)}
              >
                Categories
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-slate-400 transition-transform",
                    categoriesOpen && "rotate-180"
                  )}
                />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 top-full w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {categoriesList.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setCategoriesOpen(false)}
                      className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/dashboard"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                pathname === "/dashboard"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              My Applications
            </Link>
          </nav>
        </div>

        {/* Right Section: Quick Search + Dashboard / Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/scholarships"
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50/70 px-3.5 py-1.5 text-xs text-slate-500 transition-colors hover:border-indigo-300 hover:bg-white lg:flex"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search scholarships, NSP, grants...</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              /
            </kbd>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            title="Saved Opportunities"
          >
            <Bookmark className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">Saved</span>
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span>Sign Up Free</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Discover
            </Link>
            <Link
              href="/scholarships"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Browse All Scholarships
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              My Dashboard & Applications
            </Link>
            <Link
              href="/admin/sync"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Verification Engine & TinyFish Status
            </Link>

            <hr className="my-2 border-slate-200" />

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-indigo-600 py-2.5 text-center text-xs font-bold text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
