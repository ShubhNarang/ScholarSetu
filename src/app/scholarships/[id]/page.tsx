import { Suspense } from "react";
import ScholarshipDetailView from "./scholarship-detail-view";
import { VERIFIED_SCHOLARSHIPS } from "@/lib/verified-scholarships";

export async function generateStaticParams() {
  return VERIFIED_SCHOLARSHIPS.map((s) => ({
    id: s.id,
  }));
}

async function ScholarshipDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScholarshipDetailView id={id} />;
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
        </div>
      }
    >
      <ScholarshipDetailContent params={params} />
    </Suspense>
  );
}
