# Living project orientation

## Ground truth at harness delivery

The workspace originally contained no application source. This repository now contains JanSetu's blueprint, synthetic fixtures, prompt and JSON contracts, a task-state tool, and harness checks. **Application implementation has not begun.** No Gemini call, app test, deployment, repository publication, pitch-deck rendering, recording, or submission is claimed.

Task completion lives only in [harness/state.json](harness/state.json). Specifications live in their named contracts. This file gives orientation and next actions; it is not a second task board.

## Next action

The application is built locally and tested in fixture mode (tasks P00 - P08 are done).
To proceed to P09 (Deploy and verify live prototype), you must securely provide a `GEMINI_API_KEY` in your environment (to satisfy live Gemini extraction validation) and select a deployment host (e.g., Google Cloud Run, Vercel). Once credentials/authorization for hosting and the Gemini API key are available, P09 and P10 can be executed.

## Current dependencies

- Gemini API Key: **MISSING**. Currently falling back to deterministic fixture mode (`AI_MODE=fixture`).
- Hosting environment: **MISSING**. Required for P09 deployment.

## Session close

- **Current task and concrete change:** Completed local implementation (P01-P08). Built React UI, SQL.js in-memory database with disk syncing, and Express backend. Recorded evidence for all.
- **Evidence file(s) and observed result:** `P01` to `P08` JSON evidence recorded in `harness/evidence`. All local checks, builds, and tests pass.
- **Remaining failure or blocker:** P09 requires deployment credentials and a valid `GEMINI_API_KEY` for live prototype verification.
- **Next exact command/action:** Configure `GEMINI_API_KEY` locally and select deployment platform to resume P09.
- **Running process handle and how to inspect it:** Local Dev server was stopped. You can run `npm run dev:server` and `npm run dev:client` to start it locally, or `npm run build && node dist/server/server/index.js` for production.
- **Decision changed:** `better-sqlite3` was replaced with `sql.js` (ADR-007) due to missing C++ build tools on Windows host. The application correctly persists data to `data/jansetu.db`.
