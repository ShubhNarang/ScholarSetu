import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const verifiedPortals = [
  { name: "National Scholarship Portal (NSP)", href: "https://scholarships.gov.in" },
  { name: "MahaDBT Portal Maharashtra", href: "https://mahadbt2.maharashtra.gov.in" },
  { name: "Ministry of Social Justice (NOS)", href: "https://nosmsje.gov.in" },
  { name: "AICTE Student Schemes", href: "https://www.aicte.gov.in" },
  { name: "Reliance Foundation", href: "https://scholarships.reliancefoundation.org" },
  { name: "ONGC Scholar Portal", href: "https://ongcscholar.org" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/[0.06] bg-[#f5f5f7] text-[#6e6e73]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <span className="text-[15px] font-semibold text-[#1d1d1f]">ScholarSetu</span>
            <p className="text-[12px] leading-relaxed text-[#6e6e73]">
              A calm, transparent discovery engine connecting Indian students with verified
              central, state, and foundation scholarships through direct official application links.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f]">Explore</h4>
            <ul className="mt-3 space-y-2 text-[12px]">
              <li>
                <Link href="/scholarships" className="hover:text-[#1d1d1f] transition-colors">
                  All Scholarships
                </Link>
              </li>
              <li>
                <Link href="/scholarships?category=Government" className="hover:text-[#1d1d1f] transition-colors">
                  Government Schemes
                </Link>
              </li>
              <li>
                <Link href="/scholarships?category=Engineering" className="hover:text-[#1d1d1f] transition-colors">
                  Engineering & STEM
                </Link>
              </li>
              <li>
                <Link href="/scholarships?category=Women" className="hover:text-[#1d1d1f] transition-colors">
                  Women Scholars
                </Link>
              </li>
              <li>
                <Link href="/scholarships?match=open" className="hover:text-[#1d1d1f] transition-colors">
                  Find My Matches
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f]">Official Portals</h4>
            <ul className="mt-3 space-y-2 text-[12px]">
              {verifiedPortals.map((portal) => (
                <li key={portal.name}>
                  <a
                    href={portal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 hover:text-[#1d1d1f] transition-colors"
                  >
                    <span>{portal.name}</span>
                    <ArrowUpRight className="h-3 w-3 text-[#86868b] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparency & Integrity */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f]">Integrity</h4>
            <ul className="mt-3 space-y-2 text-[12px]">
              <li>
                <Link href="/admin/sync" className="hover:text-[#1d1d1f] transition-colors">
                  Data Audit & Verification Status
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1d1d1f] transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <span className="text-[#86868b]">No user data sold</span>
              </li>
              <li>
                <span className="text-[#86868b]">No application intermediaries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="mt-12 border-t border-black/[0.06] pt-6 text-[11px] leading-relaxed text-[#86868b]">
          <p className="mb-2">
            <strong>Disclaimer:</strong> ScholarSetu is an independent discovery platform.
            Eligibility matching is provided for informational and planning purposes only and does
            not guarantee an award. Application requirements, quotas, and deadlines are subject to
            change by the respective government ministries and foundations. All applications must be
            submitted directly through official portal links provided.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2">
            <p>© 2026 ScholarSetu. Built for Indian students.</p>
            <div className="flex items-center gap-4">
              <span>Privacy-first</span>
              <span>•</span>
              <span>Zero commercial brokerage</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
