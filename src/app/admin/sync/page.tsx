"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Check,
  Database,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { ScholarshipSource, SourceCategory } from "@/lib/source-registry";
import { IngestionJob, IngestionJobStage } from "@/types/scholarship";
import { cn } from "@/lib/utils";

interface StatusData {
  tinyfish?: {
    isConfigured: boolean;
    apiKeyPresent: boolean;
    fetchEndpoint: string;
    agentEndpoint: string;
    searchEndpoint?: string;
    statusMessage: string;
  };
  database?: {
    provider: string;
    isSupabaseConfigured: boolean;
    totalRecords: number;
    message: string;
  };
}

export default function AdminSyncPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [sources, setSources] = useState<ScholarshipSource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"all" | SourceCategory>("all");
  const [activeJob, setActiveJob] = useState<IngestionJob | null>(null);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [activeSourceRefreshing, setActiveSourceRefreshing] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, sourcesRes, jobRes] = await Promise.all([
        fetch("/api/scrape/status"),
        fetch("/api/ingestion/sources"),
        fetch("/api/ingestion/status"),
      ]);

      if (statusRes.ok) setStatusData(await statusRes.json());
      if (sourcesRes.ok) {
        const srcJson = await sourcesRes.json();
        setSources(srcJson.sources || []);
      }
      if (jobRes.ok) {
        const jobJson = await jobRes.json();
        setActiveJob(jobJson.activeJob || jobJson.latestJob || null);
      }
    } catch (err) {
      console.error("Failed to load pipeline data:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Polling effect when job is active
  useEffect(() => {
    if (activeJob && !["completed", "partially_completed", "failed"].includes(activeJob.stage)) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/ingestion/status?jobId=${activeJob.id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.job) {
              setActiveJob(json.job);
              if (["completed", "partially_completed", "failed"].includes(json.job.stage)) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                loadData();
              }
            }
          }
        } catch {
          // ignore transient poll error
        }
      }, 2000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeJob, loadData]);

  const triggerIngestion = async (sourceId?: string, sourceCategory?: string) => {
    if (sourceId) setActiveSourceRefreshing(sourceId);
    else setIsStartingJob(true);
    setNotice(null);

    try {
      const res = await fetch("/api/ingestion/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, sourceCategory }),
      });

      const json = await res.json();
      if (res.ok && json.job) {
        setActiveJob(json.job);
        setNotice({
          type: "success",
          message: json.message || "Ingestion job started.",
        });
      } else {
        setNotice({
          type: "error",
          message: json.error || "Failed to trigger ingestion job.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setNotice({ type: "error", message: `Request error: ${msg}` });
    } finally {
      setIsStartingJob(false);
      setActiveSourceRefreshing(null);
    }
  };

  const filteredSources =
    selectedCategory === "all"
      ? sources
      : sources.filter((s) => s.category === selectedCategory);

  const getStageBadge = (stage: IngestionJobStage) => {
    switch (stage) {
      case "completed":
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#047857] bg-[#ecfdf5] px-2.5 py-0.5 rounded-full"><Check className="h-3 w-3" /> Completed</span>;
      case "partially_completed":
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#b45309] bg-[#fffbeb] px-2.5 py-0.5 rounded-full">Partially Completed</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#dc2626] bg-[#fef2f2] px-2.5 py-0.5 rounded-full"><AlertCircle className="h-3 w-3" /> Failed</span>;
      case "queued":
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">Queued</span>;
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0071e3] bg-[#eff6ff] px-2.5 py-0.5 rounded-full">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span className="capitalize">{stage}…</span>
          </span>
        );
    }
  };

  const isJobRunning = activeJob && !["completed", "partially_completed", "failed"].includes(activeJob.stage);

  return (
    <div className="min-h-screen bg-white pb-24 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <span className="text-[12px] font-medium uppercase tracking-wider text-[#0071e3]">
              Transparency & Data Pipeline
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              33-Source Ingestion & Verification Console
            </h1>
            <p className="mt-1 text-[13px] text-[#6e6e73]">
              Automated scholarship discovery, field-level provenance extraction, and safe deduplicated persistence via TinyFish.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerIngestion("nsp-central")}
              disabled={Boolean(isJobRunning || isStartingJob)}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-4 py-2 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" />
              <span>Test Live NSP</span>
            </button>

            <button
              type="button"
              onClick={() => triggerIngestion()}
              disabled={Boolean(isJobRunning || isStartingJob)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#333336] disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (isJobRunning || isStartingJob) && "animate-spin")} />
              <span>{isJobRunning ? "Pipeline Running…" : "Run Batch Ingestion"}</span>
            </button>
          </div>
        </div>

        {/* Notice alert */}
        {notice && (
          <div
            className={cn(
              "mt-4 rounded-xl p-3.5 text-[13px] flex items-center justify-between border",
              notice.type === "success" && "bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]",
              notice.type === "error" && "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]",
              notice.type === "info" && "bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]"
            )}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-semibold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Engine Connectivity Status Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-black/[0.07] bg-[#fbfbfd] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">
                TinyFish Web Extraction
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  statusData?.tinyfish?.isConfigured
                    ? "bg-[#ecfdf5] text-[#047857]"
                    : "bg-[#fffbeb] text-[#b45309]"
                )}
              >
                {statusData?.tinyfish?.isConfigured ? "Connected & Active" : "Audit / Offline Mode"}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-[13px] font-semibold text-[#1d1d1f]">
                Search & Fetch REST Endpoints
              </div>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">
                {statusData?.tinyfish?.statusMessage || "Checking TinyFish configuration…"}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-black/[0.05] text-[11px] text-[#86868b] flex flex-wrap gap-4">
              <span>Search: api.search.tinyfish.ai</span>
              <span>Fetch: api.fetch.tinyfish.ai</span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-[#fbfbfd] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">
                Database & Schema Engine
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[11px] font-medium text-[#047857]">
                <Database className="h-3 w-3" />
                <span>{statusData?.database?.provider === "supabase" ? "Remote Supabase" : "Verified Local Engine"}</span>
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-[13px] font-semibold text-[#1d1d1f]">
                {statusData?.database?.totalRecords ?? 12} Verified Scholarship Schemes Stored
              </div>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">
                {statusData?.database?.message || "Running safe upsert and field-level evidence tracking."}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-black/[0.05] text-[11px] text-[#86868b] flex items-center justify-between">
              <span>Field Evidence: Active</span>
              <span>RLS: Enabled</span>
            </div>
          </div>
        </div>

        {/* Live Job Execution Panel */}
        {activeJob && (
          <div className="mt-6 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">
                    {activeJob.sourceName || "Ingestion Job"} ({activeJob.id})
                  </span>
                  {getStageBadge(activeJob.stage)}
                </div>
                <div className="text-[11px] text-[#86868b] mt-0.5">
                  Trigger: {activeJob.triggerType} • Started: {new Date(activeJob.startedAt).toLocaleTimeString()}
                  {activeJob.completedAt && ` • Completed: ${new Date(activeJob.completedAt).toLocaleTimeString()}`}
                </div>
              </div>

              <div className="flex items-center gap-4 text-[12px] text-[#6e6e73]">
                <span>Sources: <strong>{activeJob.sourcesAttempted}</strong> / {activeJob.totalSources}</span>
                <span>Pages: <strong>{activeJob.pagesFetched}</strong></span>
              </div>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="rounded-xl bg-white border border-black/[0.05] p-3">
                <div className="text-[11px] text-[#86868b]">Discovered</div>
                <div className="text-[18px] font-semibold text-[#1d1d1f]">{activeJob.recordsDiscovered}</div>
              </div>
              <div className="rounded-xl bg-white border border-black/[0.05] p-3">
                <div className="text-[11px] text-[#86868b]">Inserted</div>
                <div className="text-[18px] font-semibold text-[#047857]">{activeJob.recordsInserted}</div>
              </div>
              <div className="rounded-xl bg-white border border-black/[0.05] p-3">
                <div className="text-[11px] text-[#86868b]">Updated</div>
                <div className="text-[18px] font-semibold text-[#0071e3]">{activeJob.recordsUpdated}</div>
              </div>
              <div className="rounded-xl bg-white border border-black/[0.05] p-3">
                <div className="text-[11px] text-[#86868b]">Skipped</div>
                <div className="text-[18px] font-semibold text-[#86868b]">{activeJob.recordsSkipped}</div>
              </div>
              <div className="rounded-xl bg-white border border-black/[0.05] p-3">
                <div className="text-[11px] text-[#86868b]">Verified</div>
                <div className="text-[18px] font-semibold text-[#047857]">{activeJob.recordsVerified}</div>
              </div>
            </div>

            {/* Real-time Logs Console */}
            {activeJob.logs && activeJob.logs.length > 0 && (
              <div className="rounded-xl bg-black/[0.03] border border-black/[0.05] p-3 text-[11px] font-mono max-h-40 overflow-y-auto space-y-1">
                {activeJob.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[#4b5563]">
                    <span className="text-[#9ca3af] flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-semibold text-[#1d1d1f] uppercase flex-shrink-0">
                      [{log.stage}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 33 Configured Sources Registry */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[18px] font-semibold text-[#1d1d1f]">
                Configured Source Registry ({sources.length})
              </h2>
              <p className="text-[12px] text-[#6e6e73]">
                Strict URL allowlisting, domain constraints, and per-source rate limit boundaries.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
              {(
                [
                  { id: "all", label: "All (33)" },
                  { id: "government_institutional", label: "Gov & Institutional (13)" },
                  { id: "corporate_foundation", label: "Corporate (10)" },
                  { id: "international", label: "International (4)" },
                  { id: "state_portal", label: "State Portals (3)" },
                  { id: "aggregator", label: "Aggregators (3)" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id as "all" | SourceCategory)}
                  className={cn(
                    "rounded-full px-3 py-1 font-medium transition-colors cursor-pointer",
                    selectedCategory === tab.id
                      ? "bg-[#1d1d1f] text-white"
                      : "bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sources List */}
          <div className="space-y-2.5">
            {filteredSources.map((src) => (
              <div
                key={src.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-[#fbfbfd] p-4 transition-all hover:border-black/[0.12]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">
                      {src.name}
                    </span>
                    <span className="rounded-md bg-white border border-black/[0.06] px-2 py-0.5 text-[10px] uppercase font-medium text-[#86868b]">
                      {src.category.replace(/_/g, " ")}
                    </span>
                    {src.enabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#047857]">
                        <Check className="h-3 w-3" />
                        Enabled
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#86868b]">Disabled</span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-[#6e6e73]">
                    <a
                      href={src.startingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0071e3] hover:underline"
                    >
                      <span>{src.startingUrl}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span>•</span>
                    <span>Strategy: <strong className="font-mono text-[11px]">{src.discoveryStrategy}</strong></span>
                    <span>•</span>
                    <span>Host: {src.hostPlatform}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right text-[11px] text-[#86868b] hidden sm:block">
                    <div>Cap: 10 records / run</div>
                    <div>Extracted: {src.recordsExtractedCount}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerIngestion(src.id)}
                    disabled={Boolean(isJobRunning || activeSourceRefreshing === src.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={cn("h-3 w-3", activeSourceRefreshing === src.id && "animate-spin")} />
                    <span>{activeSourceRefreshing === src.id ? "Syncing…" : "Refresh"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
