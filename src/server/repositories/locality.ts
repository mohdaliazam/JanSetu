import { queryAll, queryOne, run } from '../db/connection.js';
import type { Locality } from '../../shared/types.js';

export function findAllLocalities(filters?: { state_code?: string; district_id?: string }): Locality[] {
  let sql = 'SELECT * FROM localities WHERE 1=1';
  const params: any[] = [];
  if (filters?.state_code) { sql += ' AND state_code = ?'; params.push(filters.state_code); }
  if (filters?.district_id) { sql += ' AND district_id = ?'; params.push(filters.district_id); }
  sql += ' ORDER BY state_code, district_name, name';
  return queryAll<Locality>(sql, params).map(r => ({ ...r, synthetic: !!r.synthetic }));
}

export function findLocalityById(id: string): Locality | null {
  const r = queryOne<any>('SELECT * FROM localities WHERE id = ?', [id]);
  return r ? { ...r, synthetic: !!r.synthetic } : null;
}

export function upsertLocality(loc: Locality): void {
  run(`INSERT OR REPLACE INTO localities (id, district_id, district_name, state_code, state_name, name, synthetic)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loc.id, loc.district_id, loc.district_name, loc.state_code, loc.state_name, loc.name, loc.synthetic ? 1 : 0]);
}
