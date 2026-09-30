# Google AI contract

## Responsibilities

1. Extract development needs from multilingual text into the schema in contracts/extraction.schema.json.
2. Explain an evidence packet as a project brief using contracts/brief.schema.json.
3. X01 adds audio transcription; X02 reuses the same validated text pipeline.

Use server-side Google GenAI SDK with an accessible configured model. Official structured-output documentation: https://ai.google.dev/gemini-api/docs/structured-output . JSON schema output still requires application-side validation. Key guidance: https://ai.google.dev/gemini-api/docs/api-key . Model/API compatibility must be verified at build time.

## Extraction envelope

Input: redacted user text (10-2000 characters), user-selected locality ID and its server-resolved locality/district/state names, locale hint, prompt version. The names let the model flag a conflicting location reference without guessing an ID. Treat user text only as evidence. Locality selection is authoritative for grouping; model text cannot override it. Extract `category`, `summary_en`, `language`, `urgency`, `evidence_quote`, `needs_review`, and `review_reasons`.

Use prompts/extract.md as the canonical instruction body. The provider adapter supplies it as a system-level instruction supported by the chosen API; text is a separate data field. Do not concatenate citizen instructions into system policy. Model has no tools, browsing, shell access or database access.

Postconditions: valid JSON; exact allowed keys/types; evidence_quote is a nonempty exact substring of redacted input; summary bounded; suspected multi-issue or conflicting location flagged for review. Model confidence is not a probability of truth. We deliberately do not display a fabricated confidence percentage.

User confirms/corrects category and locality before ranking. Model urgent claims are labelled reported urgency, never emergency verification. If multiple issues exist, ask the user to submit separate reports; no silent splitting in demo v1.

## Priority formula v1 (computed in code)

For each group with available gap_pct and population:

```text
gap = gap_pct / 100
population_component = min(population / 10000, 1)
urgency_component = max confirmed urgency among group reports
  (routine=0.25, elevated=0.60, urgent=1.00)
demand_component = min(confirmed report count / 20, 1)
funding_penalty = 0.15 when any matching plan is funded or in_progress, else 0
score = round(100 * clamp(
  0.45*gap + 0.25*population_component +
  0.20*urgency_component + 0.10*demand_component - funding_penalty,
  0, 1), 1)
```

Same locality/category plans only. Completed plans do not penalise automatically: show a discrepancy for analyst review if complaints remain. Proposed plans do not count as funded. Missing gap or population => score=null, status=insufficient_data; show in separate review section, never coerce to zero. Sort scored groups descending score, then group ID ascending for stable ties. Formula is illustrative and must be visible in the UI. Large population refers to locality population, not confirmed beneficiaries.

Sanity oracle: gap 70%, population 6000, elevated urgency, 2 reports, no funded plan => 59.5. Adding a funded plan => 44.5. With all components 1 and no penalty => 100. Zero reports are not ranked groups.

## Brief envelope

Build the evidence packet server-side: group ID, report IDs and redacted excerpts, indicator/source IDs, plan IDs/status, score and component values, missingness, synthetic flags. Hash it. Send only this packet using prompts/brief.md. The model proposes a project title, rationale, actions, caveats and cited source IDs; it never changes numeric scores or invents costs.

Every substantive claim entry cites one or more allowed IDs from the packet. Reject unknown IDs. In v1 reject digit-bearing free-text model claims and render numeric values directly from structured evidence, rather than attempting to validate arbitrary model arithmetic. Citation membership alone does not prove a claim is supported: evaluation must also check that cited excerpts actually support the claim, and the UI must let the analyst inspect them. If validation fails, retry once with a concise validation error; then return an explicit unavailable state. Do not cache malformed output. Display stale briefs as stale or regenerate after evidence changes.

## Failure and cost boundaries

Default budget: total provider work per request <=25 seconds, at most 2 attempts within that budget, retry only transient provider errors or one invalid structured response. Never retry invalid credentials; 429/timeout produce a clear retryable error. Limit input size and output length. Rate limits in SECURITY.md apply before provider calls. Logs contain request ID, duration, mode, prompt version, model ID and error code, not secrets or raw citizen text.

Provider modes: `live` (real Gemini), `fixture` (known test samples only). Live mode with missing credentials fails clearly; there is no automatic fixture fallback. Every API response, UI result and exported brief carries the mode. Fixture mode cannot pass R02 or P09's live gate.
