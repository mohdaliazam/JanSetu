# Decision record

Each material change gets an appended ADR: ID, date, status, context, choice, tradeoff, affected contracts and verification. Supersede an old decision explicitly; do not erase history.

## ADR-001 — 2026-09-30 — Accepted: focus on Track 1

Citizen-to-project planning provides an achievable visible workflow with real Google AI use. It avoids pretending to validate physical forecasts under a hackathon deadline. Tradeoff: national deployment and communication-channel coverage require explicit extensions.

## ADR-002 — 2026-09-30 — Accepted: two named completion targets

`demo` proves a narrow complete flow plus submission package; `full` adds X01-X04. The requirement matrix exposes gaps. Tradeoff: a demo is not a claim of full track compliance.

## ADR-003 — 2026-09-30 — Accepted: deterministic priorities

Gemini extracts and explains. Formula v1 computes score and components from bounded inputs, with a small capped report signal. Tradeoff: these are illustrative planning weights, not a validated allocation policy.

## ADR-004 — 2026-09-30 — Accepted: one Node service and SQLite

Use React/Vite + Express + persistent SQLite for the prototype. Tradeoff: single-instance writes and host disk support; repository interfaces preserve a migration route.

## ADR-005 — 2026-09-30 — Accepted: isolated synthetic demo workspaces

Every visitor receives a private synthetic workspace via a random secure cookie. No real official role is implied. Tradeoff: shared official collaboration belongs to X04, not the public demo.

## ADR-006 — 2026-09-30 — Accepted: evidence-backed state

harness/tasks.json defines work; harness/state.json records status; evidence files record observations. Markdown links provide navigation rather than duplicated task checkboxes. Tradeoff: agents must maintain evidence; scripts cannot judge whether prose is truthful.

## Next ADR template

ID / date / accepted or superseded / trigger / alternatives / decision / tradeoff / contracts touched / measured verification.
