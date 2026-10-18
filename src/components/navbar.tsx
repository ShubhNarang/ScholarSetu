"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Explore Scholarships", href: "/scholarships" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About", href: "/#about" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Typographic Wordmark */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f] transition-opacity group-hover:opacity-80">
            ScholarSetu
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-[13px] font-normal transition-colors",
                  isActive
                    ? "text-[#1d1d1f] font-medium"
                    : "text-[#6e6e73] hover:text-[#1d1d1f]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Primary Action Button */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/scholarships?match=open"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-1.5 text-[13px] font-medium text-white shadow-2xs hover:bg-[#333336] active:scale-[0.98] transition-all"
          >
            <span>Find My Scholarships</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-[#6e6e73] hover:bg-black/[0.04] hover:text-[#1d1d1f]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-black/[0.06] bg-white px-4 pb-6 pt-3 md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-[14px] font-medium text-[#1d1d1f] hover:bg-black/[0.03]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/scholarships?match=open"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1d1d1f] py-2.5 text-[13px] font-medium text-white"
              >
                <span>Find My Scholarships</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
