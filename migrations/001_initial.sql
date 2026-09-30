CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    token_hash TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS localities (
    id TEXT PRIMARY KEY,
    district_id TEXT NOT NULL,
    district_name TEXT NOT NULL,
    state_code TEXT NOT NULL,
    state_name TEXT NOT NULL,
    name TEXT NOT NULL,
    synthetic INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK(kind IN('synthetic','public')),
    title TEXT NOT NULL,
    url TEXT,
    licence TEXT,
    as_of TEXT NOT NULL,
    caveat TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS indicators (
    id TEXT PRIMARY KEY,
    locality_id TEXT NOT NULL REFERENCES localities(id),
    category TEXT NOT NULL,
    population INTEGER CHECK(population IS NULL OR population >= 0),
    gap_pct REAL CHECK(gap_pct IS NULL OR (gap_pct >= 0 AND gap_pct <= 100)),
    source_id TEXT NOT NULL REFERENCES sources(id),
    as_of TEXT NOT NULL,
    UNIQUE(locality_id, category, as_of)
);

CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    locality_id TEXT NOT NULL REFERENCES localities(id),
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN('proposed','funded','in_progress','completed')),
    description TEXT NOT NULL,
    source_id TEXT NOT NULL REFERENCES sources(id),
    as_of TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    redacted_text TEXT NOT NULL,
    input_language TEXT NOT NULL,
    locality_id TEXT NOT NULL REFERENCES localities(id),
    extraction_json TEXT,
    provider_mode TEXT NOT NULL,
    model_id TEXT,
    prompt_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN('pending','review','failed','confirmed')),
    error_code TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_drafts_workspace_id ON drafts(workspace_id);

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    draft_id TEXT UNIQUE NOT NULL REFERENCES drafts(id),
    locality_id TEXT NOT NULL REFERENCES localities(id),
    category TEXT NOT NULL,
    summary_en TEXT NOT NULL,
    language TEXT NOT NULL,
    redacted_text TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK(urgency IN('routine','elevated','urgent')),
    evidence_quote TEXT NOT NULL,
    provider_mode TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_workspace_id ON reports(workspace_id);

CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    locality_id TEXT NOT NULL REFERENCES localities(id),
    category TEXT NOT NULL,
    UNIQUE(workspace_id, locality_id, category)
);
CREATE INDEX IF NOT EXISTS idx_groups_workspace_id ON groups(workspace_id);

CREATE TABLE IF NOT EXISTS group_reports (
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    report_id TEXT NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
    PRIMARY KEY(group_id, report_id)
);

CREATE TABLE IF NOT EXISTS briefs (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    evidence_hash TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    model_id TEXT NOT NULL,
    provider_mode TEXT NOT NULL,
    body_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(workspace_id, group_id, evidence_hash, prompt_version, provider_mode)
);
CREATE INDEX IF NOT EXISTS idx_briefs_workspace_id ON briefs(workspace_id);

CREATE TABLE IF NOT EXISTS idempotency (
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    route TEXT NOT NULL,
    key TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    response_json TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    UNIQUE(workspace_id, route, key)
);

CREATE TABLE IF NOT EXISTS rate_limits (
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    bucket TEXT NOT NULL,
    window_start TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    UNIQUE(workspace_id, bucket, window_start)
);

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    safe_metadata_json TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_events_workspace_id ON audit_events(workspace_id);
