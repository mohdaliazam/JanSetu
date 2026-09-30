# Agent operation and recovery

## Commands available now

```text
node scripts/harness.mjs validate
node scripts/harness.mjs status
node scripts/harness.mjs next
node scripts/harness.mjs set P00 in_progress
node scripts/harness.mjs record P00 harness/evidence/P00-preflight.json
node scripts/harness.mjs set P00 done
node scripts/harness.mjs set P03 blocked "Gemini key unavailable; offline tests can continue"
node scripts/harness.mjs target full
node scripts/harness.mjs release-check
```

`record` requires an actual JSON evidence file following TEMPLATE.json; do not use the template itself. `done` requires passed dependencies and structurally valid all-pass evidence covering every numbered acceptance criterion. The check's `acceptance` array uses one-based numbers from the task's acceptance list. Acceptance review remains the agent's responsibility. `release-check` fails until all selected target tasks are done; even a pass is only a state audit, not independent runtime verification.

Set a completed task back to `in_progress` or `pending` when regressions invalidate it. Reopening a task automatically resets completed descendants to pending, so release state cannot retain a known-invalid dependency chain. Evidence remains for history; collect fresh evidence after fixes. Record the reason and affected revision in SESSION_LOG.md.

## Evidence writing

1. Run real checks.
2. Save sanitized output/screenshots under harness/evidence/ with task-prefixed names.
3. Write task JSON with source revision or local fingerprint, check results and artifact paths.
4. Record the file with the CLI. Review it, then mark task done if acceptance is satisfied.
5. Append session log and update PROJECT_CONTEXT.md.

## Recovery table

| Symptom | Investigation and next step |
|---|---|
| Empty model output / bad JSON | Inspect sanitized validation error, verify SDK/API compatibility, retry once within deadline; then surface error |
| Invalid credentials | Verify secret configuration without printing value; do not keep retrying or silently mock |
| 429 | Enforce local rate limits, respect retry guidance, show retryable state; no unbounded loop |
| Deployment loses data | Inspect DATA_DIR and volume mount; never claim persistence until restart proof |
| Native SQLite install fails | Verify runtime/build tool compatibility, use host-supported container build; change DB only with ADR and contract updates |
| UI works but backend fails | Inspect actual HTTP response and same-origin config; no fake success state |
| A prior agent stopped | Inspect files, task/evidence and any actual live process handle; resume unfinished slice, not all scaffolding |
| State JSON malformed | Restore from reviewed previous version or state.json.bak; compare filesystem before accepting recovered state |
| New scope or architecture | Update authoritative contract, append ADR, reopen affected tasks, rerun relevant checks |
| Secret in source or screenshot | Remove exposure, rotate secret with authorized account access, regenerate affected artifacts; never repeat secret |

## Permission and external access

Use already-authorized actions without asking repeatedly. If publication/access is missing, prepare artifacts and ask for that specific missing step. Never claim another tool can read these files unless it has this folder open. The harness cannot bypass an agent's permissions or a hosting account login.

## Safe stopping point

Leave a runnable or clearly diagnosed state. Write exact next step, failing check, evidence path, source changes, required access and any process handle in PROJECT_CONTEXT.md. An old "in_progress" entry alone is not a running process.
