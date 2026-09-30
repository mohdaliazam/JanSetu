# Interface specification

## Visual direction

A calm civic planning workspace: warm off-white background, deep navy text, teal action colour, amber review states, red only for errors. Use readable system fonts, strong spacing, clear labels and compact evidence cards. No government emblem or suggestion of official affiliation. Product name JanSetu; tagline: "Citizen voices. Clearer public priorities."

## Routes and structure

- `/`: concise introduction, persistent "Synthetic hackathon demo" badge, language selector, primary "Report a community need", secondary "Explore planning dashboard".
- `/report`: locality selectors (state -> district -> fictional locality), text input with 2000-character count, Hindi/English labels, no personal details notice. Example buttons explicitly insert sample text. Submit shows pending state without fake streaming.
- `/report/:draftId`: original redacted text, AI summary, category, reported urgency, review reasons, live/fixture badge; editable category/locality and confirm action. Failure state offers retry or edit; never success toast on failure.
- `/dashboard`: scope filters, confirmed-report count, groups needing review, ranked table, top-project cards. A table is sufficient; map is optional. Counts always describe reports, never unique citizens.
- `/groups/:id`: component score chart with text values, data provenance, related reports, planned investments, missing-data notice, "Generate project brief", JSON export.
- `/groups/:id/brief`: evidence-linked rationale and next steps, synthetic and AI-mode labels, timestamp, stale flag if hash differs; no official approval button.

## States and responsiveness

Define loading, empty, populated, error, provider unavailable, insufficient data, expired workspace, stale brief and fixture mode. Preserve draft text through recoverable UI errors in component state; avoid browser persistent storage of sensitive text. 375px mobile and desktop layouts must work. Tables scroll accessibly or become cards with the same labels.

## Accessibility and language

Keyboard access, visible focus, semantic headings, associated input labels, status announcements, contrast checks, reduced motion. Never rely only on colour. Translation dictionaries cover UI buttons, validation, loading, errors and disclosure. User content remains original/redacted; English summary is explicitly a translation. Switching language does not erase input.

## X01 voice flow

Recording permission is requested only on an explicit action. Show timer, stop/cancel, 60-second cap and recording indicator. Review transcript before using it. If browser recording is unavailable, offer supported audio upload and text. Denied microphone permission does not disable text intake. Audio is never recorded in the background.

## Demo credibility

All visible functionality has working handlers. Do not add decorative counters, fake trends, fake official logos, invented benefit numbers or success claims. Screenshots for the deck must come from the implemented app.
