import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "ScholarSetu — Discover Scholarships That Match Your Future",
  description:
    "Discover scholarships that match your education, circumstances, and ambitions. One profile. Relevant opportunities. Clear next steps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-white text-[#1d1d1f] antialiased selection:bg-[#0071e3]/10 selection:text-[#0071e3]">
        <Suspense fallback={<div className="h-14 w-full border-b border-black/[0.06] bg-white/80" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
