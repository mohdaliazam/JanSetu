import { queryAll, run } from '../db/connection.js';
import type { Plan } from '../../shared/types.js';

export function findPlansByLocalityAndCategory(localityId: string, category: string): Plan[] {
  return queryAll<Plan>('SELECT * FROM plans WHERE locality_id = ? AND category = ?', [localityId, category]);
}

export function findPlansByLocality(localityId: string): Plan[] {
  return queryAll<Plan>('SELECT * FROM plans WHERE locality_id = ?', [localityId]);
}

export function upsertPlan(plan: any): void {
  run(`INSERT OR REPLACE INTO plans (id, locality_id, category, status, description, source_id, as_of)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [plan.id, plan.locality_id, plan.category, plan.status, plan.description, plan.source_id, plan.as_of]);
}
