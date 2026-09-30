# Security and privacy requirements

## Prototype boundary

This is an isolated synthetic demonstration, not an official complaint service. Show "Do not enter personal information" before intake. No user account or government affiliation is implied. All public visitors can explore only their own generated demo workspace; there is no shared public writeable dashboard.

## Secrets and provider access

GEMINI_API_KEY is server-only and excluded from source control, client environment variables, logs and screenshots. No VITE_ prefix for secrets. Local `.env` files remain ignored; deploy through host secret settings. Key guidance: https://ai.google.dev/gemini-api/docs/api-key . Rotate a leaked key before continuing; never repeat its value in evidence.

## Isolation and request protection

- Generate at least 32 random bytes for workspace tokens. Store a hash, not the token, in the database.
- Cookie: HttpOnly, SameSite=Lax, Secure on HTTPS, Path=/, Max-Age matching 24-hour expiry.
- For all mutations validate Origin against APP_ORIGIN. Same-origin browser fetch only; no wildcard credentialed CORS.
- Every entity lookup checks the cookie workspace, including report/draft/group/brief IDs and exports.
- Validate inputs, sizes and enums at the server. Escape React text normally; no raw HTML from model responses.
- Parameterized SQL, explicit JSON serialization, attachment download headers where appropriate.
- Default limits per workspace: 10 drafts/10 minutes, 5 brief generations/10 minutes, 100 accepted reports/day. Session creation additionally limited by short-lived salted IP hash (no raw IP logs), 10/hour. Limits are demo defaults, not a DDoS guarantee.
- Enforce reverse-proxy trust explicitly for the chosen host. Do not trust arbitrary forwarded headers.

## Data minimisation

Do not ask for identity, phone, email or precise address. Redact obvious phone/email/identity-like numeric patterns before provider calls and persistence; document that pattern redaction is incomplete and not a guarantee of anonymisation. Do not persist the original unredacted text. Keep redacted source evidence and supported locale. Synthetic fixture messages contain no real people's details.

Workspace data is purged after 24 hours. Exports exclude tokens and raw contact information. Audio is transient; remove it after transcription or any error. X04 must define real-data consent, retention, access and deletion with domain/legal review before collecting real citizen records.

## AI trust boundary

Citizen content can contain prompt injection, allegations, or emergency language. Extract only permitted fields and evidence; ignore embedded requests to change policy or execute tools. Model output is untrusted: schema-check, citation-check and render as text. No model-triggered tool calls or government notifications.

## Release checks

Cross-workspace GET/POST/export requests return 404; invalid Origin denied; unauthenticated workspace routes denied; oversized bodies denied before model calls; repeated idempotency key cannot double charge; malformed AI rejected; no credential in client bundles or logs. X04 adds role/tenant tests, authenticated audit review, backup restore and retention verification.
