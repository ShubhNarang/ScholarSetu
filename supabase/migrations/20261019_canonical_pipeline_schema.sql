-- ============================================================================
-- ScholarSetu - Real TinyFish Pipeline & Canonical Model Migration
-- Migration: 20261019_canonical_pipeline_schema.sql
-- ============================================================================

-- 1. EXTEND SCHOLARSHIPS TABLE WITH CANONICAL FIELD AUDIT COLUMNS
ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS provider_type TEXT,
    ADD COLUMN IF NOT EXISTS funding_type TEXT,
    ADD COLUMN IF NOT EXISTS award_currency TEXT DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS award_frequency TEXT DEFAULT 'annually',
    ADD COLUMN IF NOT EXISTS max_income_value NUMERIC,
    ADD COLUMN IF NOT EXISTS min_marks_percentage NUMERIC,
    ADD COLUMN IF NOT EXISTS academic_year TEXT,
    ADD COLUMN IF NOT EXISTS evidence_url TEXT,
    ADD COLUMN IF NOT EXISTS first_discovered_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS structured_rules JSONB,
    ADD COLUMN IF NOT EXISTS missing_fields TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS field_evidence JSONB DEFAULT '[]'::jsonb;

-- 2. CREATE SOURCES REGISTRY TABLE
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    starting_url TEXT NOT NULL,
    category TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    discovery_strategy TEXT NOT NULL DEFAULT 'search_and_fetch',
    allowed_domains TEXT[] NOT NULL DEFAULT '{}',
    host_platform TEXT NOT NULL,
    default_provider_type TEXT NOT NULL,
    search_queries TEXT[] DEFAULT '{}',
    last_attempt_at TIMESTAMPTZ,
    last_successful_fetch_at TIMESTAMPTZ,
    last_error TEXT,
    records_extracted_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREATE FIELD-LEVEL SOURCE EVIDENCE AUDIT TABLE
CREATE TABLE IF NOT EXISTS scholarship_source_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scholarship_id TEXT REFERENCES scholarships(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    extracted_value TEXT NOT NULL,
    source_url TEXT NOT NULL,
    evidence_snippet TEXT,
    confidence_score NUMERIC DEFAULT 1.0,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_scholarship ON scholarship_source_evidence(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_evidence_field ON scholarship_source_evidence(field_name);

-- 4. CREATE INGESTION JOBS TABLE (Real Run Tracking)
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id TEXT PRIMARY KEY,
    trigger_type TEXT NOT NULL, -- 'manual_single', 'manual_batch', 'scheduled'
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    source_name TEXT,
    stage TEXT NOT NULL CHECK (
        stage IN (
            'queued',
            'running',
            'discovering',
            'fetching',
            'extracting',
            'validating',
            'saving',
            'completed',
            'partially_completed',
            'failed'
        )
    ),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_sources INTEGER NOT NULL DEFAULT 0,
    sources_attempted INTEGER NOT NULL DEFAULT 0,
    sources_succeeded INTEGER NOT NULL DEFAULT 0,
    sources_failed INTEGER NOT NULL DEFAULT 0,
    pages_attempted INTEGER NOT NULL DEFAULT 0,
    pages_fetched INTEGER NOT NULL DEFAULT 0,
    records_discovered INTEGER NOT NULL DEFAULT 0,
    records_inserted INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    records_skipped INTEGER NOT NULL DEFAULT 0,
    records_verified INTEGER NOT NULL DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    logs JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_started ON ingestion_jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_stage ON ingestion_jobs(stage);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_source_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- Public read for sources (transparency)
CREATE POLICY "Public can view sources registry"
    ON sources FOR SELECT
    USING (true);

-- Public read for source evidence
CREATE POLICY "Public can view verified source evidence"
    ON scholarship_source_evidence FOR SELECT
    USING (true);

-- Public read for ingestion status transparency
CREATE POLICY "Public can view ingestion jobs transparency"
    ON ingestion_jobs FOR SELECT
    USING (true);
