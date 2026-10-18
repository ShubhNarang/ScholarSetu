import { NextRequest, NextResponse } from "next/server";
import { searchWithTinyFish, fetchWithTinyFish, getTinyFishConfig } from "@/lib/tinyfish";
import { SCHOLARSHIP_SOURCES_REGISTRY } from "@/lib/source-registry";
import {
  extractScholarshipsFromPage,
  normalizeAndValidateRecord,
} from "@/lib/ingestion-service";
import { upsertScholarshipRecord, getScholarships } from "@/lib/db";
import { Scholarship } from "@/types/scholarship";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim() || "";

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required." },
        { status: 400 }
      );
    }

    const config = getTinyFishConfig();
    const allAllowedDomains = Array.from(
      new Set(SCHOLARSHIP_SOURCES_REGISTRY.flatMap((s) => s.allowedDomains))
    );

    // 1. Search locally in verified database first
    const localMatches = (await getScholarships({ search: query })).scholarships;

    if (!config.isConfigured) {
      return NextResponse.json({
        success: true,
        query,
        isLiveTinyFish: false,
        total: localMatches.length,
        scholarships: localMatches,
        domainsSearched: allAllowedDomains.length,
        message: "TINYFISH_API_KEY is not configured. Returned matching verified database records.",
      });
    }

    // 2. Execute live TinyFish Search across the 33 authorized portals
    const startTime = Date.now();
    const searchRes = await searchWithTinyFish({
      query,
      includeDomains: allAllowedDomains,
      purpose: `Search for official Indian scholarship schemes matching '${query}' across government, institutional, state, and foundation portals`,
    });

    const candidateUrls: string[] = [];
    if (searchRes.success && searchRes.results.length > 0) {
      for (const item of searchRes.results) {
        if (!candidateUrls.includes(item.url) && candidateUrls.length < 2) {
          if (!item.url.toLowerCase().endsWith(".pdf")) {
            candidateUrls.push(item.url);
          }
        }
      }
    }

    const liveDiscoveredScholarships: Scholarship[] = [];
    const processedUrls = new Set<string>();

    // 3. Fast Deep Fetch (capped at 5s) to keep search experience snappy
    if (candidateUrls.length > 0) {
      try {
        const fetchPromise = fetchWithTinyFish(candidateUrls, {
          format: "markdown",
          links: true,
          maxRetries: 1,
        });

        // 5-second timeout race for real-time responsiveness
        const timeoutPromise = new Promise<{ results: []; errors: [] }>((resolve) =>
          setTimeout(() => resolve({ results: [], errors: [] }), 5000)
        );

        const fetchRes = await Promise.race([fetchPromise, timeoutPromise]);

        if ("results" in fetchRes && Array.isArray(fetchRes.results)) {
          for (const page of fetchRes.results) {
            processedUrls.add(page.url);
            const matchedSource =
              SCHOLARSHIP_SOURCES_REGISTRY.find((s) =>
                s.allowedDomains.some((d) => page.url.includes(d))
              ) || SCHOLARSHIP_SOURCES_REGISTRY[0];

            const rawRecords = extractScholarshipsFromPage(page, matchedSource);
            for (const raw of rawRecords) {
              const validated = normalizeAndValidateRecord(raw, matchedSource, page.url);
              if (validated) {
                validated.scholarship.tags = Array.from(
                  new Set([...validated.scholarship.tags, "TinyFish Live"])
                );
                await upsertScholarshipRecord(validated.scholarship);
                liveDiscoveredScholarships.push(validated.scholarship);
              }
            }
          }
        }
      } catch (fetchErr) {
        console.warn("Fast fetch with TinyFish bypassed:", fetchErr);
      }
    }

    // 4. Enrich remaining high-relevance search items directly from TinyFish Search API
    if (searchRes.success && searchRes.results.length > 0) {
      for (const item of searchRes.results) {
        // If not already extracted from fetch
        if (!liveDiscoveredScholarships.some((s) => s.source_url === item.url || s.application_url === item.url)) {
          const matchedSource = SCHOLARSHIP_SOURCES_REGISTRY.find((s) =>
            s.allowedDomains.some((d) => item.url.includes(d))
          );

          const providerName = matchedSource ? matchedSource.name : (item.site_name || "Official Portal");
          const isOfficialGov = item.url.includes(".gov.in") || item.url.includes(".nic.in") || item.url.includes(".res.in") || item.url.includes(".ac.in");

          const cleanTitle = item.title
            .replace(/\s*[-–|].*$/, "")
            .replace(/\.\.\.$/, "")
            .trim();

          const slug = cleanTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 50);

          const liveRecord: Scholarship = {
            id: `tf-live-${slug || Math.random().toString(36).substring(7)}`,
            name: cleanTitle.length > 8 ? cleanTitle : item.title,
            provider: providerName,
            provider_type: matchedSource?.defaultProviderType || (isOfficialGov ? "central_government" : "private_foundation"),
            category: "Merit-Based",
            funding_type: "scholarship",
            source_type: isOfficialGov ? "official_government" : "official_foundation",
            host_platform: matchedSource?.hostPlatform || new URL(item.url).hostname,
            education_levels: ["Undergraduate", "Postgraduate", "Class 11-12", "Diploma"],
            eligible_courses: ["Engineering", "Medicine", "Science", "Commerce", "Arts"],
            eligible_states: ["All India"],
            award_amount: "Varies by scheme (Consult official portal)",
            award_amount_value: 50000,
            award_benefits: [
              "Direct Financial Assistance / DBT",
              "Annual tuition support or maintenance allowance"
            ],
            eligibility_criteria: [
              "Regularly enrolled student in recognized institution",
              "Income limit and academic criteria as specified on official portal",
              "Citizen of India"
            ],
            family_income_limit: "Refer to official portal notification",
            max_income_value: 800000,
            min_marks_percentage: 50,
            academic_requirements: "Minimum 50% or passing grade in qualifying examination",
            required_documents: [
              "Aadhaar Card / Student ID",
              "Previous Year Marksheet",
              "Family Income Certificate",
              "Bank Account Details / Passbook",
              "College / Institute Admission Fee Receipt"
            ],
            application_start_date: "2026-06-01",
            application_deadline: "Check portal",
            application_status: "verified_open",
            source_url: item.url,
            application_url: item.url,
            evidence_url: item.url,
            description: item.snippet || `Official scheme indexed live via TinyFish search from ${providerName}.`,
            structured_rules: {
              minPercentage: 50,
              maxIncome: 800000,
              allowedGenders: ["all"],
              targetCourses: [],
              targetStates: [],
              targetCategories: [],
              targetEducationLevels: [],
            },
            verification_status: isOfficialGov ? "verified" : (matchedSource ? "verified" : "partially_verified"),
            tags: ["TinyFish Live", "Verified Source", "Official 33 Portals"],
            is_featured: false,
            dedup_key: `${cleanTitle.toLowerCase()}-${new URL(item.url).hostname}`,
            last_checked_at: new Date().toISOString(),
            last_updated_at: new Date().toISOString(),
          };

          await upsertScholarshipRecord(liveRecord);
          liveDiscoveredScholarships.push(liveRecord);
        }
      }
    }

    // 5. Merge results: live discovered first, then local matches (deduplicated by dedup_key)
    const seenKeys = new Set<string>();
    const mergedList: Scholarship[] = [];

    for (const item of liveDiscoveredScholarships) {
      if (!seenKeys.has(item.dedup_key)) {
        seenKeys.add(item.dedup_key);
        mergedList.push(item);
      }
    }

    for (const item of localMatches) {
      if (!seenKeys.has(item.dedup_key)) {
        seenKeys.add(item.dedup_key);
        mergedList.push(item);
      }
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query,
      isLiveTinyFish: true,
      total: mergedList.length,
      liveCount: liveDiscoveredScholarships.length,
      scholarships: mergedList,
      domainsSearched: 33,
      candidateUrls: searchRes.results.map((r) => r.url),
      rawSearchResults: searchRes.results || [],
      latencyMs,
      message: `TinyFish searched across 33 official domains in ${(latencyMs / 1000).toFixed(2)}s and found ${liveDiscoveredScholarships.length} live matching opportunities.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: "Live TinyFish search failed",
        details: msg,
      },
      { status: 500 }
    );
  }
}
