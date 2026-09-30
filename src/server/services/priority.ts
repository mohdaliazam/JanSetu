import { queryAll } from '../db/connection.js';
import { findLatestIndicator } from '../repositories/indicator.js';
import { findPlansByLocalityAndCategory } from '../repositories/plan.js';
import type { ScoreComponents } from '../../shared/types.js';

const URGENCY_VALUES: Record<string, number> = { routine: 0.25, elevated: 0.60, urgent: 1.00 };

export function calculateScore(groupId: string, workspaceId: string): ScoreComponents {
  // Get group
  const group = queryAll<any>('SELECT * FROM "groups" WHERE id = ? AND workspace_id = ?', [groupId, workspaceId])[0];
  if (!group) throw new Error('Group not found');

  // Get reports in this group
  const reports = queryAll<any>(
    `SELECT r.* FROM reports r JOIN group_reports gr ON r.id = gr.report_id WHERE gr.group_id = ?`,
    [groupId]
  );

  // Get indicator for this locality+category
  const indicator = findLatestIndicator(group.locality_id, group.category);

  // Get plans for this locality+category
  const plans = findPlansByLocalityAndCategory(group.locality_id, group.category);

  // Missing gap or population => insufficient data
  if (!indicator || indicator.gap_pct === null || indicator.population === null) {
    const urgency_component = reports.length > 0
      ? Math.max(...reports.map((r: any) => URGENCY_VALUES[r.urgency] || 0.25))
      : 0;
    const demand_component = Math.min(reports.length / 20, 1);
    return {
      gap: null, population_component: null,
      urgency_component, demand_component,
      funding_penalty: 0, score: null,
      formula_version: 'v1', insufficient_data: true,
    };
  }

  const gap = indicator.gap_pct / 100;
  const population_component = Math.min(indicator.population / 10000, 1);
  const urgency_component = reports.length > 0
    ? Math.max(...reports.map((r: any) => URGENCY_VALUES[r.urgency] || 0.25))
    : 0;
  const demand_component = Math.min(reports.length / 20, 1);

  // Funding penalty: 0.15 if any matching plan is funded or in_progress
  const hasFundedPlan = plans.some(p => p.status === 'funded' || p.status === 'in_progress');
  const funding_penalty = hasFundedPlan ? 0.15 : 0;

  const rawScore = 0.45 * gap + 0.25 * population_component + 0.20 * urgency_component + 0.10 * demand_component - funding_penalty;
  const clamped = Math.max(0, Math.min(rawScore, 1));
  const score = Math.round(100 * clamped * 10) / 10;

  return {
    gap, population_component, urgency_component, demand_component,
    funding_penalty, score, formula_version: 'v1', insufficient_data: false,
  };
}
