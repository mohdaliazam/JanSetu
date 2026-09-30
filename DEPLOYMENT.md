# Deployment blueprint

## Preferred topology

One Node service serving Express API and Vite build, with a persistent disk mounted at DATA_DIR. Docker packages the runtime consistently. Choose a host the user can access that supports long-running Node and persistent storage. No paid plan is authorised merely by this document. A serverless ephemeral filesystem is unsuitable for SQLite persistence.

P00 records the selected host and its constraints. If only an ephemeral/serverless host is available, explicitly switch repositories to managed PostgreSQL with an ADR before deployment; do not silently lose reports on restart.

## Environment contract

See .env.example. GEMINI_API_KEY, GEMINI_MODEL and APP_ORIGIN configured server-side. APP_ORIGIN is the deployed HTTPS origin. DATA_DIR is a writable persistent directory. AI_MODE=live for the live integration gate. PORT is host supplied or local default. No secret is included in built client config.

## Build and start sequence to implement

1. Install pinned dependencies with npm ci.
2. Run npm run verify and offline E2E against isolated temporary database.
3. Build client/server artifacts; image runs as a non-root user with DATA_DIR ownership set.
4. Back up persistent DB where meaningful, run versioned migrations, start server.
5. Route health checks to /api/health and terminate TLS through the host.
6. Verify deployed revision and real extraction from a fresh browser; check data after process restart.

Create Dockerfile, .dockerignore and any host-specific config during P09 from actual runtime requirements, not speculative version snippets. Document the exact chosen commands in the final application README.

## Release verification

- Public HTTPS URL opens on desktop/mobile without developer login.
- UI identifies synthetic data and live Gemini mode.
- Health reports nonsecret version; database reachable.
- Hindi and English report -> confirm -> group -> score -> brief works live.
- Another browser cannot read the first workspace's IDs.
- Report survives server restart and browser reload within cookie lifetime.
- No secret in browser network payloads or client assets.
- Error and provider-rate-limit states remain understandable.

Record URL, source revision, time and observed outcomes in evidence. Do not expose a private raw database or local .env in a deployment artifact.

## Rollback and maintenance

Keep previous deploy artifact and backup before schema changes. Roll back app only when schema compatible; otherwise restore a validated backup in authorized maintenance. Never reset user data as a routine startup step. Record demo expiry and known single-instance constraints. X04 adds managed backups, restore drill, role access and realistic operating monitoring.
