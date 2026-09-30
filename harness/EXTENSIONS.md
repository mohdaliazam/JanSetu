# Full-track implementation contracts

These extend the proven demo without replacing its pipeline. Update task evidence and requirements as they are implemented. A full release is still a pilot, not a verified nationwide service.

## X01 — Voice

Use browser MediaRecorder for explicit recording and a file-upload fallback. Send bounded audio to the server; check declared MIME and actual file signature, enforce 5 MB and 60 seconds. Select an accessible Google AI audio-capable service/model using current official documentation, record exact API and accepted formats, and prove it with real Hindi/English clips. Do not guess that every Gemini model supports every recording format. Convert format server-side only when needed and with resource limits.

Server transcribes to text; user can edit transcript before extraction and confirmation. Do not store audio after completion/failure. Add tests for denied permission, unsupported browser, invalid MIME/signature, oversize/overlong, silent recording, transcription error, cancellation, timeout and cleanup. Limit simultaneous audio jobs. No background microphone access. Demo must distinguish transcribed text from user corrections.

## X02 — Messaging

Choose one channel for which the user has authorised sandbox access; do not create accounts or message real people by inference. Read current provider webhook docs. Verify signatures over exact raw bytes, provider event timestamps where available, and event-ID deduplication. Store a salted channel sender mapping outside public output; never infer official identity from a display name. Associate inbound reports with a selected/confirmed locality, not an AI guess.

Feed messages into the same draft/extraction service. Confirmation can occur through an authorised sandbox interaction or analyst review; unconfirmed messages never rank. Test invalid signature, replay, missing location, unknown sender mapping, provider retries and injection text. Record one actual signed sandbox event end to end. If outbound permission is absent, keep processing inbound in review and document the limitation.

## X03 — Public data, scale and portability

Select an actual public demographic/infrastructure dataset with permitted reuse; record exact URL, publisher, retrieval date, licence, geographic unit and publication period. Do not scrape around access restrictions. Write an import mapping from source fields to indicator schema, units, nulls and geography IDs. Real district aggregates must not masquerade as fictional locality statistics: keep distinct levels and flag mismatch, or introduce real geography rows with explicit mapping.

Preserve source snapshot/checksum for reproducibility when redistribution is allowed; otherwise keep retrieval instructions. Reject negative population, out-of-range gaps, duplicate geographic keys and incompatible dates. Existing plans remain separately sourced; do not invent plan statuses from demographic data.

Run a documented synthetic load scenario, initially 10,000 reports across 100 synthetic localities and 10 concurrent clients. Record hardware/host, p50/p95 latency, errors, query indexes and database size; do not extrapolate to nationwide capacity. Separate offline fixture throughput from provider latency and quota limits. If contention requires PostgreSQL, migrate through repositories with data-integrity tests.

Exports must include version, locale/geography definitions, units, provenance, formula version and mode. Add import/export roundtrip tests; document how a different state/country could supply mapping and locale files. No claim that sharing a schema equals federated modelling.

## X04 — Pilot hardening

Use a maintained identity provider available to the user rather than custom password storage. Separate citizen, analyst and administrator permissions. Require tenant scope and role enforcement at API layer, with explicit cross-tenant/role-negative tests. Establish consent and retention policy before real data collection; deletion must remove or appropriately anonymise related records and invalidate briefs, preserving only permitted audit metadata.

Verify backups by restoration into an isolated environment. Define health, provider failure, latency and storage alerts with redacted logs. Choose an open-source licence after confirming ownership; include third-party notices and data-source licences. Explain that an open repository is not formal Digital Public Goods certification.

Refresh deployed checks, pitch, demo recording and limitations after extensions; do not use old demo-only evidence to claim full target completion.
