# Technology decisions and command contract

## Baseline

- Node.js 22+ supported by the selected host; record exact runtime version in P00 evidence.
- TypeScript, React, Vite, plain CSS with reusable tokens; avoid dependency-heavy UI kits.
- Express, Zod for server validation, better-sqlite3 with SQL migrations.
- Google GenAI JavaScript SDK (`@google/genai`) behind a small server-only adapter.
- Vitest for application unit/integration tests; Playwright for browser flows.
- npm and a committed lockfile. Resolve compatible package versions at P01 and pin through the lockfile. Do not invent package versions in documentation.
- Docker packaging for a single service, plus a persistent volume on the chosen host.

## Why

One language and one deployable service minimise integration work. SQLite fits the isolated prototype and explicit persistence tests. PostgreSQL is the pilot option when multi-instance operation is needed. MERN in the attached guide is an example, not a user requirement. A training pipeline or vector store does not improve the first validated workflow.

## Commands the builder must implement in P01

| Command | Required behavior |
|---|---|
| npm run dev | Start client and API locally with documented same-origin proxy |
| npm run typecheck | TypeScript check for client, server and shared modules |
| npm run lint | Application lint, nonzero exit on errors |
| npm test | Unit and integration checks in non-watch mode |
| npm run test:e2e | Playwright fixtures and workflows, deterministic provider mode |
| npm run test:ai:live | Explicit opt-in live Gemini evaluation; no key -> fail with setup message |
| npm run build | Produce client and server artifacts |
| npm start | Serve built app using PORT and persistent DATA_DIR |
| npm run db:migrate | Apply pending migrations safely and idempotently |
| npm run verify | typecheck + lint + unit/integration + build; no swallowed failures |

These commands do not exist yet. P01 must create them and record observed outcomes. Harness commands in README.md already exist and need no dependencies.

## Provider version selection

GEMINI_MODEL is configured, not guessed from a track screenshot. At P00/P03 inspect current official Google documentation and the account's accessible models; prove a minimal real call with schema validation. Record model ID, SDK version and API surface in DECISIONS.md and evidence. Never claim a model works based solely on its name in a screenshot.
