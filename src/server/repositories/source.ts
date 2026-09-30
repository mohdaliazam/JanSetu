import { queryAll, queryOne, run } from '../db/connection.js';
import type { Source } from '../../shared/types.js';

export function findSourceById(id: string): Source | null {
  return queryOne<Source>('SELECT * FROM sources WHERE id = ?', [id]);
}

export function findAllSources(): Source[] {
  return queryAll<Source>('SELECT * FROM sources');
}

export function findSourcesByIds(ids: string[]): Source[] {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  return queryAll<Source>(`SELECT * FROM sources WHERE id IN (${placeholders})`, ids);
}

export function upsertSource(src: any): void {
  run(`INSERT OR REPLACE INTO sources (id, kind, title, url, licence, as_of, caveat)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [src.id, src.kind, src.title, src.url || null, src.licence || null, src.as_of, src.caveat]);
}
