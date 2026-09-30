# Implementation plan

## Targets and ordering

Task definitions and dependencies: harness/tasks.json. Status: harness/state.json. Start with `node scripts/harness.mjs next`. Default `demo` target contains P00-P10. `full` adds X01-X04. Use `node scripts/harness.mjs target full` to include track extensions; do not downgrade without explicit scope agreement.

The harness is delivered as complete planning infrastructure. Its product tasks correctly remain pending. P00 must recalculate available time from the actual deadline; the earlier two-hour limit is historical context.

## Reference two-hour allocation

| Window | Work |
|---|---|
| 0-10 min | P00 access, scope and runtime; P01 minimal boot/deployment skeleton |
| 10-30 min | P02 persistence/session/fixtures; P03 real Gemini extraction |
| 30-50 min | P04 grouping/score; P05 brief and export |
| 50-70 min | P06 full usable frontend and bilingual paths |
| 70-85 min | P07 integration hardening, P08 browser checks |
| 85-100 min | P09 deployed verification and fix critical failures |
| 100-120 min | P10 deck, recorded demo, source access, submission checks |

This is a prioritisation budget, not a promise that tasks take these durations. Deployment smoke testing should start as soon as P01 can boot. Draft pitch content already exists under submission/PLAN.md; actual screenshots and video must wait for working software.

## Vertical slice strategy

Avoid building all UI before backend. First connect a single text request -> Gemini -> stored draft -> confirmation -> group -> score -> brief. Then add the remaining filters, bilingual labels and error states. Preserve contracts and evidence while iterating.

## Task boundaries

- P00: verify full rules, time, toolchain, provider and host access. Missing external access must be recorded, not invented. Can finish preflight with clearly identified blockers; dependent live gates still cannot pass.
- P01: build app skeleton and all documented commands. Preserve the harness. Capture dev health/build outputs.
- P02: implement persistent DB/migrations, workspace isolation, seed/import code and intake records.
- P03: implement Google adapter and real validated extraction, confirmation boundary and fixtures for offline tests.
- P04: implement grouping, missing data and deterministic ranking with known oracle results.
- P05: implement evidence packet, validated brief and JSON export.
- P06: connect accessible bilingual frontend and all specified states.
- P07: apply security, negative API cases, restart and idempotency checks.
- P08: execute complete browser flows and AI evaluation, repair actual failures.
- P09: deploy persistent service; verify deployed revision and real Gemini flow.
- P10: create and review submission assets, verify access and record actual submission status.

Extensions X01-X04 may be implemented once their dependencies pass. They have explicit acceptance criteria and should not be disguised as completed by design documentation alone.

## If time is running out

Stop cosmetic work. Preserve a working vertical slice. Finish evidence and submission package; disclose unmet gates. Do not disable tests, replace live AI with invisible fixtures, or claim a deployment from localhost screenshots. Never mark all product tasks done because a deadline arrived.
