import { NextRequest, NextResponse } from "next/server";
import { runIngestionJob } from "@/lib/ingestion-service";
import { getSourceById, SCHOLARSHIP_SOURCES_REGISTRY } from "@/lib/source-registry";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sourceId, sourceCategory } = body;

    // Validate single source if specified
    if (sourceId) {
      const source = getSourceById(sourceId);
      if (!source) {
        return NextResponse.json(
          {
            success: false,
            error: `Source '${sourceId}' is not found in the 33-source registry.`,
            validSourcesCount: SCHOLARSHIP_SOURCES_REGISTRY.length,
          },
          { status: 400 }
        );
      }
    }

    const job = await runIngestionJob({
      triggerType: sourceId ? "manual_single" : "manual_batch",
      sourceId,
      sourceCategory,
    });

    return NextResponse.json(
      {
        success: true,
        message: sourceId
          ? `Ingestion job started for source '${sourceId}'.`
          : "Batch ingestion job started.",
        job,
      },
      { status: 202 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initiate ingestion job",
        details: msg,
      },
      { status: msg.includes("currently running") ? 409 : 500 }
    );
  }
}
