import Link from "next/link";
import { GraduationCap, ShieldCheck, ExternalLink, Heart } from "lucide-react";

const officialPortals = [
  { name: "National Scholarship Portal (NSP)", href: "https://scholarships.gov.in" },
  { name: "Maharashtra MahaDBT Portal", href: "https://mahadbt2.maharashtra.gov.in" },
  { name: "Ministry of Social Justice (NOS)", href: "https://nosmsje.gov.in" },
  { name: "AICTE Student Development Schemes", href: "https://www.aicte.gov.in" },
  { name: "Reliance Foundation Scholarships", href: "https://scholarships.reliancefoundation.org" },
  { name: "ONGC Scholar Portal", href: "https://ongcscholar.org" },
];

const categoryLinks = [
  { label: "Government Scholarships", href: "/scholarships?category=Government" },
  { label: "Merit-Based Opportunities", href: "/scholarships?category=Merit-Based" },
  { label: "Engineering & Technical", href: "/scholarships?category=Engineering" },
  { label: "Women Empowerment Scholarships", href: "/scholarships?category=Women" },
  { label: "State Government Schemes", href: "/scholarships?category=State+Scholarships" },
  { label: "Undergraduate Grants", href: "/scholarships?category=Undergraduate" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-black text-white">
                Scholar<span className="text-indigo-400">Setu</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              India&apos;s trusted opportunity discovery platform for students. We index, verify,
              and connect scholars directly to official central, state government, and corporate
              CSR scholarship portals with transparent criteria.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5 text-xs text-slate-300 border border-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Zero mock data. 100% verified official portals.</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">
              Opportunity Categories
            </h3>
            <ul className="space-y-2.5">
              {categoryLinks.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="text-xs transition-colors hover:text-white"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Portals Directory */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">
              Verified Portals
            </h3>
            <ul className="space-y-2.5">
              {officialPortals.map((portal) => (
                <li key={portal.name}>
                  <a
                    href={portal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-indigo-300"
                  >
                    <span>{portal.name}</span>
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance & Platform Info */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform & Integrity
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/admin/sync" className="hover:text-white transition-colors">
                  Live Audit & Scraping Engine
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-white transition-colors">
                  All Scholarships Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                All scholarship trademarks, scheme names, and portal logos belong to their respective
                government ministries, trusts, and sponsoring foundations.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs sm:flex-row">
          <p className="text-slate-500">
            &copy; 2025 ScholarSetu. Empowering Indian students through accessible education financing.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="inline-flex items-center gap-1">
              Engineered with <Heart className="h-3 w-3 text-rose-500 fill-current" /> for Indian Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
