import { queryAll, queryOne, run } from '../db/connection.js';
import type { Indicator } from '../../shared/types.js';

export function findLatestIndicator(localityId: string, category: string): Indicator | null {
  return queryOne<Indicator>(
    'SELECT * FROM indicators WHERE locality_id = ? AND category = ? ORDER BY as_of DESC LIMIT 1',
    [localityId, category]
  );
}

export function findIndicatorsByLocality(localityId: string): Indicator[] {
  return queryAll<Indicator>('SELECT * FROM indicators WHERE locality_id = ?', [localityId]);
}

export function upsertIndicator(ind: any): void {
  run(`INSERT OR REPLACE INTO indicators (id, locality_id, category, population, gap_pct, source_id, as_of)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [ind.id, ind.locality_id, ind.category, ind.population, ind.gap_pct, ind.source_id, ind.as_of]);
}
