import { NextResponse } from "next/server";
import { getTinyFishConfig } from "@/lib/tinyfish";
import { getDatabaseStatus, getExtractionLogs } from "@/lib/db";

export async function GET() {
  try {
    const tinyFishConfig = getTinyFishConfig();
    const dbStatus = getDatabaseStatus();
    const recentLogs = await getExtractionLogs();

    return NextResponse.json({
      success: true,
      tinyfish: {
        isConfigured: tinyFishConfig.isConfigured,
        apiKeyPresent: tinyFishConfig.apiKeyPresent,
        fetchEndpoint: tinyFishConfig.fetchEndpoint,
        agentEndpoint: tinyFishConfig.agentEndpoint,
        statusMessage: tinyFishConfig.statusMessage,
      },
      database: dbStatus,
      verifiedSources: [
        {
          name: "National Scholarship Portal (NSP)",
          domain: "scholarships.gov.in",
          type: "Official Central Government",
          status: "Audited & Verified",
        },
        {
          name: "Ministry of Social Justice (NOS)",
          domain: "nosmsje.gov.in",
          type: "Central Sector Direct Portal",
          status: "Audited & Verified",
        },
        {
          name: "MahaDBT State Portal",
          domain: "mahadbt2.maharashtra.gov.in",
          type: "State Government DBT",
          status: "Audited & Verified",
        },
        {
          name: "Reliance Foundation Portal",
          domain: "scholarships.reliancefoundation.org",
          type: "Official Foundation",
          status: "Audited & Verified",
        },
        {
          name: "Kotak Education Foundation",
          domain: "kotakeducationfoundation.org",
          type: "Corporate CSR / Partner Host",
          status: "Audited & Verified",
        },
        {
          name: "ONGC Scholar Portal",
          domain: "ongcscholar.org",
          type: "PSU CSR Trust",
          status: "Audited & Verified",
        },
        {
          name: "Siemens India SSP Portal",
          domain: "ssp-india.co.in",
          type: "Corporate Citizenship",
          status: "Audited & Verified",
        },
      ],
      recentExtractionLogs: recentLogs.slice(0, 10),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read engine status",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
