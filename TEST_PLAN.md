# Verification strategy

## Levels of truth

H0 validates this blueprint and task-state consistency. Product gates G1-G8 require a running application and actual artifacts. H0 passing never satisfies a product gate.

| Gate | Checks | Required proof |
|---|---|---|
| H0 | Manifest, links, task DAG, state consistency, fixture boundaries, schemas, script regression checks | Harness command output; this is blueprint evidence only |
| G1 | Install/runtime/typecheck/lint/build | Commands, exit codes, runtime versions and source fingerprint |
| G2 | Deterministic services | Score oracles, grouping isolation, missingness, plan matching, evidence hashing tests |
| G3 | API/database/security | Session isolation, validation, idempotency, persistence/restart, secret boundaries |
| G4 | AI | Curated fixture cases plus explicitly separate real Gemini evaluation |
| G5 | UI journeys | Browser evidence at mobile/desktop, Hindi/English, loading/error states |
| G6 | Deployment | Live URL, revision, health, reload/restart persistence, real provider and isolation |
| G7 | Submission | Source access, deck pages/render, playable video duration, description and live link |
| G8 | Track extensions | Voice, signed messaging, public-data mapping/load and pilot role/retention tests |

## Unit/service assertions

- Score oracle 59.5 without funding; 44.5 with matched funded plan. No penalty for a plan in another locality/category; proposed plan no penalty.
- Cap population and demand components; clamp to 0..100; round to one decimal. Stable ID sort for ties.
- Missing gap/population => null score; zero is a valid observed gap. Reports remain visible.
- Same locality/category joins; different locality never joins; `other` unranked. Counts describe submissions.
- Evidence hash changes when reports, indicators, plans or formula version change. Sorted identical packets hash identically.
- Brief citation validator rejects unknown IDs, fabricated numbers and malformed response; never display a stale brief as current.

## Integration assertions

Test every API route's success and meaningful negative paths. Include missing session, invalid Origin, foreign workspace ID, duplicate confirmation, conflicting idempotency body, invalid input, expired session, provider 429/timeout/invalid JSON and missing key. Restart server against same database: confirmed report still exists. Concurrent confirmation results in one report. Migration rerun is harmless. Reset helper refuses non-demo configuration.

## AI evaluation

Use fixtures/ai-cases.json. Offline provider fixtures are allowed only in deterministic tests and must be labelled. Live run must evaluate at least English, Hindi, Hinglish, injection, ambiguous and multi-issue cases against the actual configured model. Record per-case category, quote validity, review flags, latency and failures. Do not use exact generated prose as an assertion. Required release behavior: all outputs schema-valid or visibly rejected, no invalid citations rendered, no injected instruction executed, and Hindi/English core examples correctly categorised. Failed quality cases require diagnosis or disclosed limitations, not invented accuracy percentages.

## Browser checks

F1 in Hindi and English; correction before confirmation; retry failure without losing draft; missing data visible; independent browser session isolation; exported mode/source markers; keyboard flow and 375px layout. Use actual screenshots for visual review, inspect console/network errors. Fixture-backed E2E is not live provider evidence.

## Submission acceptance

The deck is 10-12 actual slides and visually rendered; video is 180-300 seconds and playable; source URL has reviewer access; deployed app works in fresh session. Descriptions and slides state implemented versus planned features accurately. No fabricated impact, cost, user count or provider call.

## Evidence format

Create a JSON record based on harness/evidence/TEMPLATE.json. Each passed task lists its evidence paths in state. Include observed checks with commands/actions, expected/actual, status, source revision/fingerprint, timestamps, artifacts, environment and limitations. Each check's `acceptance` array maps it to the one-based criterion numbers in that task's acceptance list; every criterion must be covered before completion. Keep logs/screenshots referenced by relative path. Use `node scripts/harness.mjs record <task> <evidence.json>` then `set <task> done` only after human/agent review of all acceptance conditions. Merely writing "pass" cannot prove correctness.
