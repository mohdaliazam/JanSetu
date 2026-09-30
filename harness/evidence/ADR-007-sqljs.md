# ADR-007 — 2026-09-30 — Accepted: switch to sql.js from better-sqlite3

**Context**: better-sqlite3 requires native compilation (node-gyp + Visual Studio build tools). The development machine lacks Visual Studio C++ workload, causing npm install failure.

**Decision**: Use `sql.js` (Emscripten-compiled SQLite in pure JavaScript/WebAssembly) instead of `better-sqlite3`. sql.js provides a synchronous API compatible with the same SQL patterns. The persistence layer writes the database to disk manually after mutations.

**Tradeoff**: Slightly lower performance than native better-sqlite3, but eliminates native build dependency. The synchronous API pattern is preserved. For a prototype with SQLite, this is acceptable.

**Affected contracts**: TECH_STACK.md (better-sqlite3 → sql.js), all repository files.

**Verification**: npm install succeeds, database operations work correctly.
