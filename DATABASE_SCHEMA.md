# Database and data lifecycle contract

Use parameterized SQL and foreign keys enabled. IDs are server-generated UUIDs, except immutable fixture geography IDs. All timestamps are UTC ISO-8601 strings. Every mutable domain record is scoped by workspace_id. Repository calls require workspace_id, including nested lookups.

## Tables to implement

| Table | Required columns and constraints |
|---|---|
| schema_migrations | version PK, applied_at |
| workspaces | id PK, token_hash UNIQUE, created_at, expires_at; cookie stores random token, DB stores hash |
| localities | id PK, district_id, district_name, state_code, state_name, name, synthetic boolean |
| indicators | id PK, locality_id FK, category, population nullable >=0, gap_pct nullable 0..100, source_id, as_of; UNIQUE(locality_id,category,as_of) |
| plans | id PK, locality_id FK, category, status enum, description, source_id, as_of |
| sources | id PK, kind synthetic/public, title, url nullable, licence nullable, as_of, caveat |
| drafts | id PK, workspace_id FK, redacted_text, input_language, locality_id FK, extraction_json nullable, provider_mode, model_id nullable, prompt_version, status pending/review/failed/confirmed, error_code nullable, created_at |
| reports | id PK, workspace_id FK, draft_id UNIQUE FK, locality_id FK, category, summary_en, language, redacted_text, urgency, evidence_quote, provider_mode, created_at |
| groups | id PK, workspace_id FK, locality_id FK, category, UNIQUE(workspace_id,locality_id,category) |
| group_reports | group_id FK, report_id UNIQUE FK; workspace consistency verified within transaction |
| briefs | id PK, workspace_id FK, group_id FK, evidence_hash, prompt_version, model_id, provider_mode, body_json, created_at; UNIQUE(workspace_id,group_id,evidence_hash,prompt_version,provider_mode) |
| idempotency | workspace_id FK, route, key, request_hash, response_json, expires_at; UNIQUE(workspace_id,route,key) |
| rate_limits | workspace_id FK, bucket, window_start, count; UNIQUE(workspace_id,bucket,window_start) |
| audit_events | id PK, workspace_id FK, event_type, entity_id, safe_metadata_json, created_at; no raw input/secrets |

Data integrity: report/category/locality changes through confirmation only. No arbitrary client-supplied workspace IDs. A duplicate confirmation returns the existing report. Duplicate idempotency key with a different body returns 409. Requests to another workspace's entities return 404. Select the latest indicator by as_of at or before evaluation time for a locality/category; display its date. Do not silently mix values across geography levels or reporting periods.

Seed import: create a matching confirmed fixture draft for each seed report, generate workspace-specific draft/report IDs, and record the fixture's stable ID in safe audit metadata. Never reuse mutable SEED IDs as global report primary keys. Seed groups are created by the same grouping service; no network model call is needed to seed. Seed evidence always retains provider_mode=fixture even when new user requests use live Gemini.

## Grouping rule v1

One group per confirmed locality + category within a workspace. Confirmed `other` reports stay in review and are not ranked. Text similarity never merges locations. Repeated wording is not an identity signal and does not prove unique citizens. Distinct accepted submissions can raise report count; cap its scoring contribution. Preserve every report's reference and timestamp.

## Transaction boundaries

Workspace seed is atomic. Confirm draft -> insert report -> upsert group -> membership -> audit event -> idempotency response is atomic. Network AI calls happen outside database write transactions. Mark stale pending drafts failed during recovery after two minutes; do not replay provider requests indefinitely. Brief cache keys use a stable hash of the sorted evidence packet and score version so new evidence invalidates stale output.

## Retention and evolution

Demo workspace expires after 24 hours; purge scoped drafts/reports/groups/briefs/events with cascading relationships in a scheduled cleanup or safe startup/request cleanup. Keep immutable synthetic baseline separately. Do not persist voice binaries after transcription. Export contains schema_version, synthetic marker, geography, indicators, score formula version, source references, and no secret tokens.

Migrations are additive and versioned. Back up a real persistent database before destructive migration. Local disposable fixtures may be reset with an explicit demo-only command; production data is never auto-reset.
