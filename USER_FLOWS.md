# User journeys and branches

## F1 — Text to planning evidence

Open app -> session workspace provisioned -> choose Hindi/English -> select locality -> type community need -> validate/redact -> live Gemini extraction -> review/edit locality or category -> confirm -> persisted acknowledgement -> dashboard -> correct group -> score details -> generated cited brief -> export.

Accept when a report added through the UI appears after reload, is scoped to the same workspace and changes the evidence packet. Repeated confirm clicks do not duplicate it. A second independent browser has its own baseline.

## F2 — Review required

Ambiguous location, multiple issues or unclear request -> visible review reasons -> user corrects supported fields or edits/re-submits text -> confirm only explicit category/locality -> store a report. `other` remains unranked and visibly queued for review. No guessed location.

## F3 — Provider unavailable

Submit -> timeout/429/missing key -> visible failure with request ID -> preserve input -> bounded retry if user asks. No fake AI result. Fixture mode may be deliberately enabled for local tests but must be labelled and cannot count as a live release.

## F4 — Missing contextual data

Valid report -> group has missing infrastructure indicator -> insufficient-data section -> detail explains what is missing -> brief may describe known evidence but cannot assert a priority score. Source gap becomes an action item.

## F5 — Expired session

Workspace expires -> API 401 -> UI explains demo expiry -> create fresh session after user action -> seed fresh baseline. Do not silently make existing report IDs appear to persist.

## F6 — Voice extension

Choose voice/upload -> permission and recording limits -> secure transcription -> inspect/correct transcript -> same extraction and confirmation pipeline as F1. Unintelligible audio -> retry or text. Cancel deletes local recording; server temporary bytes discarded.

## F7 — Messaging extension

Provider sandbox sends signed inbound event -> signature + replay validation -> map channel session to isolated workspace/tenant -> extract to draft -> send confirmation only when channel messaging is explicitly authorized -> user confirmation or analyst review -> same report pipeline. No sender phone number appears in public demo evidence.

## F8 — Official pilot extension

Authenticated official -> tenant/role checks -> review reports -> inspect project evidence -> record review decision with audit trail. No public visitor can mutate another tenant's proposals. A planning review never automatically releases money.
