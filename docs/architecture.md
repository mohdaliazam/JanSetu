# Architecture

## Chosen structure

React + TypeScript + Vite browser -> same-origin Express API -> application services -> SQLite repositories on a persistent disk. Only the API server calls Google Gemini. One deployable Node service serves the built client and API. The demo has isolated anonymous workspaces containing synthetic data.

```text
Text / later voice / later messaging
              |
     Intake + validation + redaction
              |
       Gemini extraction adapter
              |
       Draft review / confirmation
              |
     Confirmed report repository
              |
     Locality/category grouping
              |
Indicators + plans -> deterministic priority service
              |
  Evidence package -> Gemini brief -> citation validation
              |
     Analyst dashboard / JSON export
```

## Intended application layout (to be created during implementation)

```text
src/client/                 React routes, accessible components, locale strings
src/server/index.ts        server startup, static client serving
src/server/routes/         parse request, authorize workspace, call service
src/server/services/       intake, confirmation, grouping, priority, brief
src/server/repositories/   parameterized persistence and transactions
src/server/ai/             provider adapter, schema validation, prompts
src/shared/                API types and portable validation
migrations/                immutable numbered SQL migrations
tests/unit/                score, grouping, parsing, citation rules
tests/integration/         API, isolation, idempotency and persistence
tests/e2e/                 citizen and analyst browser journeys
```

Harness files remain at repository root. No second application subfolder unless a scaffold tool forces it and an ADR records paths.

## Request lifecycle

Create a workspace cookie on /api/session. Seed that workspace transactionally from fixtures. Submission validates body and redacts obvious PII server-side; original unredacted input is not persisted. Create draft with pending state, invoke provider within bounded timeout, store validated extraction or failed state. User confirms or corrects category/locality in the draft; confirmation atomically creates a report and attaches it to a group. Dashboard computes rankings from confirmed reports plus versioned indicators/plans. Brief generation receives only that group's evidence packet.

## Boundaries and scale

Demo: one server and local persistent database. A temporary container filesystem is not durable storage. No horizontal scaling with a shared local SQLite file. The pilot extension migrates behind repository interfaces to managed PostgreSQL if concurrency demands it; it adds tenant and role access. BRICS portability comes from locale codes, versioned exports and replaceable geography mappings, not claims of an already federated platform.

No vector database, background agent framework, model training, Redis, or geospatial server is necessary for the initial slice. Introduce a queue only when measured processing duration and provider limits justify it.
