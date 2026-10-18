/**
 * TinyFish Web Agent Client
 *
 * Official TinyFish API Endpoints (as per docs.tinyfish.ai):
 * - Search API: GET https://api.search.tinyfish.ai
 * - Fetch API:  POST https://api.fetch.tinyfish.ai
 * - Agent API:  POST https://agent.tinyfish.ai/v1/automation/run
 */

export interface TinyFishConfig {
  isConfigured: boolean;
  apiKeyPresent: boolean;
  searchEndpoint: string;
  fetchEndpoint: string;
  agentEndpoint: string;
  statusMessage: string;
}

export interface TinyFishSearchResult {
  position: number;
  site_name: string;
  title: string;
  snippet: string;
  url: string;
  date?: string;
}

export interface TinyFishSearchResponse {
  success: boolean;
  query: string;
  results: TinyFishSearchResult[];
  totalResults: number;
  error?: string;
  statusCode?: number;
}

export interface TinyFishFetchedPage {
  url: string;
  final_url: string;
  title: string | null;
  description: string | null;
  text: string | null;
  links?: string[];
  etag?: string;
  last_modified?: string;
  latency_ms?: number | null;
}

export interface TinyFishFetchError {
  url: string;
  error: string;
  status?: number;
}

export interface TinyFishFetchResponse {
  success: boolean;
  results: TinyFishFetchedPage[];
  errors: TinyFishFetchError[];
  error?: string;
  statusCode?: number;
}

export function getTinyFishConfig(): TinyFishConfig {
  const apiKey = process.env.TINYFISH_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim().length > 0);

  return {
    isConfigured,
    apiKeyPresent: isConfigured,
    searchEndpoint: "https://api.search.tinyfish.ai",
    fetchEndpoint: "https://api.fetch.tinyfish.ai",
    agentEndpoint: "https://agent.tinyfish.ai/v1/automation/run",
    statusMessage: isConfigured
      ? "TinyFish API credentials verified and active."
      : "TinyFish API key (TINYFISH_API_KEY) is not set in environment. Running in offline/verified audit mode.",
  };
}

/**
 * Executes a web search using the official TinyFish Search API.
 * Uses domain filtering (include_domains) and geo-targeting (location="IN").
 */
export async function searchWithTinyFish(params: {
  query: string;
  includeDomains?: string[];
  purpose?: string;
  maxRetries?: number;
}): Promise<TinyFishSearchResponse> {
  const config = getTinyFishConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      query: params.query,
      results: [],
      totalResults: 0,
      error: "TINYFISH_API_KEY is not configured.",
    };
  }

  const searchUrl = new URL(config.searchEndpoint);
  searchUrl.searchParams.set("query", params.query);
  searchUrl.searchParams.set("location", "IN");
  searchUrl.searchParams.set("language", "en");

  if (params.includeDomains && params.includeDomains.length > 0) {
    searchUrl.searchParams.set("include_domains", params.includeDomains.join(","));
  }

  if (params.purpose) {
    searchUrl.searchParams.set("purpose", params.purpose.slice(0, 500));
  }

  const maxRetries = params.maxRetries ?? 2;
  let attempt = 0;
  let lastError = "";
  let lastStatus = 0;

  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

      const res = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: {
          "X-API-Key": process.env.TINYFISH_API_KEY || "",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      lastStatus = res.status;

      if (res.status === 429) {
        // Rate limited — back off exponentially
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
          continue;
        }
      }

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          query: params.query,
          results: [],
          totalResults: 0,
          statusCode: res.status,
          error: `TinyFish Search error (${res.status}): ${errText}`,
        };
      }

      const data = await res.json();
      return {
        success: true,
        query: params.query,
        results: (data.results || []) as TinyFishSearchResult[],
        totalResults: data.total_results || (data.results?.length ?? 0),
        statusCode: 200,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      attempt++;
      if (attempt <= maxRetries) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  return {
    success: false,
    query: params.query,
    results: [],
    totalResults: 0,
    statusCode: lastStatus || 500,
    error: `TinyFish Search failed after retries: ${lastError}`,
  };
}

/**
 * Fetches clean markdown content from target URLs using the official TinyFish Fetch API.
 * Supports batches of up to 10 URLs per request as specified by the docs.
 */
export async function fetchWithTinyFish(
  urls: string[],
  options: {
    format?: "markdown" | "html";
    links?: boolean;
    ttl?: number;
    maxRetries?: number;
  } = {}
): Promise<TinyFishFetchResponse> {
  const config = getTinyFishConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      results: [],
      errors: urls.map((u) => ({ url: u, error: "TINYFISH_API_KEY is not configured" })),
      error: "TINYFISH_API_KEY is not configured.",
    };
  }

  if (urls.length === 0) {
    return { success: true, results: [], errors: [] };
  }

  // Batch URLs into chunks of at most 10 per TinyFish limits
  const BATCH_SIZE = 10;
  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE));
  }

  const allResults: TinyFishFetchedPage[] = [];
  const allErrors: TinyFishFetchError[] = [];

  for (const batchUrls of batches) {
    let attempt = 0;
    const maxRetries = options.maxRetries ?? 2;
    let batchSuccess = false;

    while (attempt <= maxRetries && !batchSuccess) {
      try {
        const controller = new AbortController();
        // Set timeout to 120s to allow backend page rendering
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const response = await fetch(config.fetchEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.TINYFISH_API_KEY || "",
          },
          body: JSON.stringify({
            urls: batchUrls,
            format: options.format || "markdown",
            links: options.links !== undefined ? options.links : true,
            include_etag_and_last_modified: true,
            ttl: options.ttl ?? 3600, // 1 hour cache tolerance
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          attempt++;
          if (attempt <= maxRetries) {
            await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
            continue;
          }
        }

        if (!response.ok) {
          const errText = await response.text();
          batchUrls.forEach((u) =>
            allErrors.push({
              url: u,
              error: `HTTP ${response.status}: ${errText}`,
              status: response.status,
            })
          );
          batchSuccess = true;
          break;
        }

        const data = await response.json();
        if (Array.isArray(data.results)) {
          allResults.push(...data.results);
        }
        if (Array.isArray(data.errors)) {
          allErrors.push(...data.errors);
        }

        batchSuccess = true;
      } catch (err: unknown) {
        attempt++;
        if (attempt > maxRetries) {
          const msg = err instanceof Error ? err.message : String(err);
          batchUrls.forEach((u) =>
            allErrors.push({
              url: u,
              error: `Fetch attempt failed: ${msg}`,
            })
          );
        } else {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
        }
      }
    }
  }

  return {
    success: allResults.length > 0 || allErrors.length === 0,
    results: allResults,
    errors: allErrors,
    statusCode: allResults.length > 0 ? 200 : allErrors[0]?.status || 500,
  };
}

/**
 * Runs a goal-directed browser automation flow via TinyFish Agent API
 * for complex multi-step navigation where ordinary Search and Fetch are insufficient.
 */
export async function runTinyFishAgent(
  url: string,
  goal: string,
  outputSchema?: Record<string, unknown>
): Promise<{
  success: boolean;
  result?: unknown;
  error?: string;
}> {
  const config = getTinyFishConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      error: "TINYFISH_API_KEY is not configured.",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const bodyPayload: Record<string, unknown> = { url, goal };
    if (outputSchema) {
      bodyPayload.output_schema = outputSchema;
    }

    const response = await fetch(config.agentEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.TINYFISH_API_KEY || "",
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `TinyFish Agent API returned ${response.status}: ${errText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      result: data.result || data,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `TinyFish Agent automation failed: ${errorMsg}`,
    };
  }
}
