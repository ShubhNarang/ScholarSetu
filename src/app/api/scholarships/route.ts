import { NextRequest, NextResponse } from "next/server";
import { getScholarships, getDatabaseStatus } from "@/lib/db";
import { FilterParams } from "@/types/scholarship";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: FilterParams = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      educationLevel: searchParams.get("educationLevel") || undefined,
      course: searchParams.get("course") || undefined,
      state: searchParams.get("state") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: (searchParams.get("sortBy") as FilterParams["sortBy"]) || "popular",
    };

    const { scholarships, total } = await getScholarships(filters);
    const dbStatus = getDatabaseStatus();

    return NextResponse.json({
      success: true,
      total,
      scholarships,
      meta: {
        databaseProvider: dbStatus.provider,
        verifiedOnly: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch scholarships from database",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
