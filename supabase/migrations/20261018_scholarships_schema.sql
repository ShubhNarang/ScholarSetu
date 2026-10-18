-- ============================================================================
-- ScholarSetu - Real Scholarship Discovery Platform Schema
-- Migration: 20261018_scholarships_schema.sql
-- ============================================================================

-- 1. SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS scholarships (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Government', 'Merit-Based', 'Need-Based', 'Engineering', 'School Students', 'Undergraduate', 'Postgraduate', 'Women', 'State Scholarships'
    description TEXT NOT NULL,
    award_amount TEXT NOT NULL,
    award_amount_value NUMERIC NOT NULL DEFAULT 0,
    award_benefits TEXT[] DEFAULT '{}',
    eligibility_criteria TEXT[] NOT NULL DEFAULT '{}',
    education_levels TEXT[] NOT NULL DEFAULT '{}', -- 'School', 'Undergraduate', 'Postgraduate', 'PhD', 'Diploma', 'All Levels'
    eligible_courses TEXT[] DEFAULT '{}',
    eligible_states TEXT[] NOT NULL DEFAULT '{}',
    family_income_limit TEXT,
    academic_requirements TEXT,
    required_documents TEXT[] NOT NULL DEFAULT '{}',
    application_start_date TEXT,
    application_deadline TEXT,
    application_status TEXT NOT NULL CHECK (
        application_status IN (
            'verified_open',
            'opening_later',
            'deadline_passed',
            'status_unknown',
            'needs_verification'
        )
    ),
    source_url TEXT NOT NULL,
    application_url TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (
        source_type IN (
            'official_government',
            'official_foundation',
            'trusted_platform',
            'corporate_csr'
        )
    ),
    host_platform TEXT NOT NULL, -- e.g. 'National Scholarship Portal (NSP)', 'MahaDBT', 'Buddy4Study (Official Partner)', etc.
    verification_status TEXT NOT NULL CHECK (
        verification_status IN ('verified', 'needs_verification', 'unverified')
    ),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    dedup_key TEXT UNIQUE NOT NULL
);

-- Indexes for high-performance discovery queries
CREATE INDEX IF NOT EXISTS idx_scholarships_category ON scholarships(category);
CREATE INDEX IF NOT EXISTS idx_scholarships_app_status ON scholarships(application_status);
CREATE INDEX IF NOT EXISTS idx_scholarships_ver_status ON scholarships(verification_status);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_featured ON scholarships(is_featured);
CREATE INDEX IF NOT EXISTS idx_scholarships_dedup ON scholarships(dedup_key);

-- 2. EXTRACTION LOGS TABLE (Audit trail of web discovery & TinyFish pipeline)
CREATE TABLE IF NOT EXISTS extraction_logs (
    id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    engine TEXT NOT NULL DEFAULT 'TinyFish', -- 'TinyFish', 'DirectVerifier', 'ManualAudit'
    status TEXT NOT NULL CHECK (status IN ('success', 'partial_success', 'failed', 'rate_limited')),
    items_extracted INTEGER NOT NULL DEFAULT 0,
    items_verified INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extraction_logs_created ON extraction_logs(created_at DESC);

-- 3. SAVED SCHOLARSHIPS (STUDENT BOOKMARKS)
CREATE TABLE IF NOT EXISTS saved_scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scholarship_id TEXT REFERENCES scholarships(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, scholarship_id)
);

-- 4. STUDENT APPLICATIONS TRACKER
CREATE TABLE IF NOT EXISTS student_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scholarship_id TEXT REFERENCES scholarships(id) ON DELETE CASCADE,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK (
        status IN ('Draft', 'Applied', 'Under Review', 'Accepted', 'Rejected')
    ),
    application_portal TEXT,
    application_reference_number TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_applications ENABLE ROW LEVEL SECURITY;

-- Public can read verified scholarships
CREATE POLICY "Public can view verified scholarships"
    ON scholarships FOR SELECT
    USING (true);

-- Extraction logs readable by authenticated admins or service role
CREATE POLICY "Extraction logs viewable by authenticated users"
    ON extraction_logs FOR SELECT
    TO authenticated
    USING (true);

-- Saved scholarships: users only see and manage their own bookmarks
CREATE POLICY "Users can manage own saved scholarships"
    ON saved_scholarships FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Student applications: users only see and manage their own applications
CREATE POLICY "Users can manage own applications"
    ON student_applications FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. AUTOMATIC TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS set_scholarships_timestamp ON scholarships;
CREATE TRIGGER set_scholarships_timestamp
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
