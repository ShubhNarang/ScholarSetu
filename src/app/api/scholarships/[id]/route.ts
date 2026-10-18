import { NextRequest, NextResponse } from "next/server";
import { getScholarshipById, getFieldEvidenceForScholarship } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scholarship = await getScholarshipById(id);

    if (!scholarship) {
      return NextResponse.json(
        {
          success: false,
          error: "Scholarship not found in verified database",
        },
        { status: 404 }
      );
    }

    const fieldEvidence = await getFieldEvidenceForScholarship(id);

    return NextResponse.json({
      success: true,
      scholarship: {
        ...scholarship,
        field_evidence: fieldEvidence.length > 0 ? fieldEvidence : scholarship.field_evidence || [],
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve scholarship",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
