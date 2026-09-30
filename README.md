# JanSetu — agent-ready project harness

**Current deliverable: an executable blueprint and project memory, not a built application.**

JanSetu turns multilingual citizen development requests into evidence-linked infrastructure proposals. This folder gives Antigravity or another coding agent a defined destination, implementation contracts, ordered tasks, persistent memory, and verification gates.

## Begin here

1. Open this entire folder in your coding agent.
2. Paste the instruction in [START_HERE.md](START_HERE.md).
3. The agent reads [AGENTS.md](AGENTS.md), [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), and the next task's referenced files.
4. It builds, tests, records evidence, updates state, and proceeds to the next eligible task.

The harness does not start agents or install software by itself. Navigation files work even when an editor does not automatically load repository instructions. Explicitly point the agent at START_HERE.md.

## Available commands now

Requires Node.js 22 or newer; no package installation is needed for the harness.

```text
node scripts/harness.mjs validate
node scripts/harness.mjs status
node scripts/harness.mjs next
node scripts/harness.test.mjs
```

Application commands will be created and verified during P01. Do not interpret their specifications as evidence that the application already runs.

## Map

| Need | Authoritative file |
|---|---|
| Agent operating rules | [AGENTS.md](AGENTS.md) |
| Session orientation and resumption | [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) |
| Machine-readable task progress | [harness/state.json](harness/state.json) |
| Requirements and track coverage | [PROJECT_BRIEF.md](PROJECT_BRIEF.md), [REQUIREMENTS.md](REQUIREMENTS.md) |
| Scope and release boundaries | [MVP_SCOPE.md](MVP_SCOPE.md) |
| Build order and task acceptance | [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [harness/tasks.json](harness/tasks.json) |
| Design and tools | [ARCHITECTURE.md](ARCHITECTURE.md), [TECH_STACK.md](TECH_STACK.md) |
| Product contracts | [API_SPEC.md](API_SPEC.md), [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md), [AI_SPEC.md](AI_SPEC.md) |
| Interface and journeys | [UI_UX_SPEC.md](UI_UX_SPEC.md), [USER_FLOWS.md](USER_FLOWS.md) |
| Verification and recovery | [TEST_PLAN.md](TEST_PLAN.md), [RUNBOOK.md](RUNBOOK.md) |
| Privacy, deployment, risks | [SECURITY.md](SECURITY.md), [DEPLOYMENT.md](DEPLOYMENT.md), [KNOWN_RISKS.md](KNOWN_RISKS.md) |
| Why decisions were made | [DECISIONS.md](DECISIONS.md) |
| Submission assets to produce | [submission/PLAN.md](submission/PLAN.md) |
| Source interpretation | [SOURCES.md](SOURCES.md) |
| Blueprint verification and limits | [harness/BLUEPRINT_AUDIT.md](harness/BLUEPRINT_AUDIT.md) |

## Completion means evidence

Passing the harness validator means the blueprint is internally usable. It does **not** prove the app, Gemini integration, deployment, video, or deck works. Product tasks begin as pending. Release requires the independent evidence in TEST_PLAN.md and submission/PLAN.md.

Do not place API keys or personal citizen data in these files. The templates contain no credentials. The sample dataset is wholly synthetic.
