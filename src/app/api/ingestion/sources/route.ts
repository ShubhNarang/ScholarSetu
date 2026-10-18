import { NextResponse } from "next/server";
import { SCHOLARSHIP_SOURCES_REGISTRY } from "@/lib/source-registry";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      totalSources: SCHOLARSHIP_SOURCES_REGISTRY.length,
      sources: SCHOLARSHIP_SOURCES_REGISTRY,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to list scholarship sources",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
