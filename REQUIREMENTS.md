# Requirement-to-evidence matrix

P = demo task; X = track-completion extension. All product evidence is initially absent. Gate definitions are in TEST_PLAN.md. The authoritative task state is harness/state.json.

| ID | Requirement | Owner task | Evidence required |
|---|---|---|---|
| R01 | Working citizen-to-project end-to-end flow | P02-P07 | E2E creates, confirms, groups, ranks and briefs a new request |
| R02 | Actual Google AI integration | P03, P09 | Sanitised real provider response metadata plus deployed live extraction |
| R03 | Hindi and English support | P03, P06 | Curated multilingual evaluation and browser runs in both languages |
| R04 | Realistic data and explicit provenance | P02 | Fixture checks and sample labels in UI/export |
| R05 | India across states and communities | P02, P06 | Three state contexts, filters, no city-specific hardcoding |
| R06 | Demographic, infrastructure and investment context | P04 | Known score examples and source-linked candidate views |
| R07 | Demand groups and proposed projects | P04-P05 | Locality/category boundaries, score components and cited brief |
| R08 | Data and AI uncertainty visible | P03-P06 | Failure, review-required, missing-indicator and fixture states |
| R09 | Voice input where track calls for it | X01 | Recorded Hindi/English journeys and unsupported-device fallback |
| R10 | Messaging-app input | X02 | Verified test webhook enters same confirmation/review pipeline |
| R11 | Public-good and interoperability direction | X03-X04 | Versioned export, import mapping, licence and pilot documentation |
| R12 | Public or access-granted source repository | P10 | Real repository URL opened with intended reviewer access |
| R13 | Working 3-5 minute demo video | P10 | Playable video file/link with duration checked |
| R14 | 10-12 slide pitch deck | P10 | Rendered slides opened and visually checked |
| R15 | 2-3 line description | P10 | Submission text matches verified functionality |
| R16 | Live deployed prototype | P09 | Public URL verified in fresh browser session and after restart |
| R17 | Protected secrets and isolated data | P02, P07-P09 | Negative isolation tests, bundle/log secret inspection, rate limits |
| R18 | Evidence-backed project memory | Every task | Updated state, evidence record and session handoff |
| R19 | Production pilot access and retention | X04 | Role/tenant denial tests and retention/deletion verification |

## Acceptance versus external eligibility

This matrix interprets the supplied screenshots; it is not an organiser-issued rubric. P00 must verify the exact deadline, whether voice/messaging are judged as mandatory for a prototype, AI model restrictions if any, team rules, and submission fields. Until clarified, report R09-R11 as gaps on a demo-only release. Do not assert guaranteed eligibility or winning potential.
