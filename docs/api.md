# API contract v1

Same-origin JSON `/api`. UTF-8. Responses include requestId. Error envelope: `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`. Do not expose provider stack traces. Entity IDs opaque. GET limits: limit defaults 25, maximum 100; cursor opaque. Unsupported methods return 405.

All workspace routes require a valid cookie from session creation. Enforce Origin checks on mutations, body size, input schema and workspace-scoped lookups. Write endpoints accept `Idempotency-Key` (8-128 characters); body mismatch for same key is 409. Replay same body returns same result without another AI charge.

| Method + path | Request | Success | Required error paths |
|---|---|---|---|
| GET /api/health | none | 200 `{status:"ok",version}` without secrets | 503 if DB unavailable |
| POST /api/session | empty object | 201 cookie + `{workspaceExpiresAt,synthetic:true,providerMode}`; valid session -> 200 | 429 |
| GET /api/localities | optional state_code,district_id | 200 `{items:[...]}` | 400 bad filter |
| POST /api/drafts | `{text,localityId,languageHint}` | 201 `{draftId,status:"review",extraction,providerMode}` | 400/413 invalid input, 401 no session, 429 limit, 502 invalid AI, 503 provider, 504 timeout |
| GET /api/drafts/:id | none | 200 scoped draft incl failure state | 401/404 |
| POST /api/drafts/:id/confirm | `{category,localityId,acknowledged:true}` | 201 `{reportId,groupId,status:"confirmed"}`; replay -> existing result | 400 invalid, 404 unknown, 409 not review-ready |
| GET /api/reports | optional filters,cursor,limit | 200 `{items,nextCursor}` scoped redacted reports | 400/401 |
| GET /api/groups | optional state_code,district_id,category | 200 `{items,insufficientData,formulaVersion:"v1"}` | 400/401 |
| GET /api/groups/:id | none | 200 reports, indicators, plans, score components, provenance | 401/404 |
| POST /api/groups/:id/brief | empty object | 201 validated brief + evidenceHash + providerMode; cached -> 200 | 404/429/502/503/504 |
| GET /api/groups/:id/export | none | 200 versioned JSON with redaction, mode, provenance, formula | 401/404 |

Confirmation category enum matches extraction schema. A client may correct the category/locality; log those corrections and derive evidence from the stored draft. Client cannot set score, population, urgency or AI mode. `other` returns groupId=null and review-required status detail, with report stored but not ranked. DTOs must reflect that nullability.

Export includes a self-contained evidence_packet with safe locality, indicator, plan, redacted report and source snapshots. Project the allowed public DTO fields explicitly; never serialize entire database rows. The envelope provider_mode identifies the configured generation mode; every evidence report retains its own mode so live generation over fixture seeds is not misrepresented as live citizen data. Verify ID lists exactly match their included snapshots. The portable JSON contract defines minimum snapshot fields; application Zod schemas must validate all snapshot field types and enforce public-field allowlists from DATABASE_SCHEMA.md.

## Extensions

- X01 POST /api/audio/drafts: multipart audio + localityId + languageHint; max 5 MB and 60 seconds, supported MIME allowlist; transcript reviewed before confirmation. 415 wrong type; 413 too large; 422 unintelligible. Audio processing has a separately documented timeout validated on host. Delete audio after processing.
- X02 POST /api/webhooks/messaging/:adapter: validate provider signature against raw bytes before JSON parsing; replay prevention by provider event ID; reject unsigned calls. No anonymous public API token inside message content. Unconfirmed channel-derived drafts go to review, not straight to ranking.
- X03 GET /api/v1/exports: authenticated tenant export with schema_version and source licences; no raw PII.
- X04 protected official routes require explicit role + tenant checks; UI visibility is not authorization.

Runtime Zod types and route integration tests must mirror this contract. If a necessary change is found, update the contract and callers together, record ADR, rerun affected tests.
