import { NextRequest, NextResponse } from "next/server";
import {
  getActiveIngestionJob,
  getIngestionJobById,
  getRecentIngestionJobs,
  getDatabaseStatus,
} from "@/lib/db";
import { getTinyFishConfig } from "@/lib/tinyfish";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");

    const tinyfish = getTinyFishConfig();
    const database = getDatabaseStatus();

    if (jobId) {
      const job = getIngestionJobById(jobId);
      if (!job) {
        return NextResponse.json(
          { success: false, error: `Job '${jobId}' not found.` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        job,
        tinyfish,
        database,
      });
    }

    const activeJob = getActiveIngestionJob();
    const recentJobs = getRecentIngestionJobs(5);

    return NextResponse.json({
      success: true,
      activeJob,
      latestJob: recentJobs[0] || null,
      recentJobs,
      tinyfish,
      database,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch ingestion job status",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
