import { Suspense } from "react";
import ScholarshipDetailView from "./scholarship-detail-view";
import { VERIFIED_SCHOLARSHIPS } from "@/lib/verified-scholarships";

export async function generateStaticParams() {
  return VERIFIED_SCHOLARSHIPS.map((s) => ({
    id: s.id,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <ScholarshipDetailView id={id} />
    </Suspense>
  );
}
