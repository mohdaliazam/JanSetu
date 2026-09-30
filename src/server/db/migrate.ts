// Migration runner for sql.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, exec, queryOne, run, saveDb } from './connection.js';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations');

export function runMigrations(): void {
  const db = getDb();

  // Create schema_migrations table if not exists
  exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`);

  // Read migration files
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('[migrate] No migrations directory found');
    return;
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const version = file.replace('.sql', '');
    const existing = queryOne<any>(
      'SELECT version FROM schema_migrations WHERE version = ?',
      [version]
    );

    if (existing) {
      continue; // Already applied
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`[migrate] Applying ${file}...`);

    // Execute the migration SQL
    exec(sql);

    // Record migration
    run(
      'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
      [version, new Date().toISOString()]
    );

    saveDb();
    console.log(`[migrate] Applied ${file}`);
  }
}

// Allow running standalone
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  import('./connection.js').then(({ initDb }) => {
    initDb().then(() => {
      runMigrations();
      console.log('[migrate] Done');
    });
  });
}
