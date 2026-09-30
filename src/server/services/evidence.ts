import crypto from 'node:crypto';
import { queryAll, queryOne } from '../db/connection.js';
import { findIndicatorsByLocality } from '../repositories/indicator.js';
import { findPlansByLocality } from '../repositories/plan.js';
import { findSourcesByIds } from '../repositories/source.js';
import { findLocalityById } from '../repositories/locality.js';
import { calculateScore } from './priority.js';
import type { ExportPacket } from '../../shared/types.js';

export function buildEvidencePacket(groupId: string, workspaceId: string): any {
  const group = queryOne<any>('SELECT * FROM "groups" WHERE id = ? AND workspace_id = ?', [groupId, workspaceId]);
  if (!group) throw new Error('Group not found');

  const locality = findLocalityById(group.locality_id);
  if (!locality) throw new Error('Locality not found');

  const reports = queryAll<any>(
    `SELECT r.* FROM reports r JOIN group_reports gr ON r.id = gr.report_id WHERE gr.group_id = ? AND r.workspace_id = ?`,
    [groupId, workspaceId]
  );

  const indicators = findIndicatorsByLocality(group.locality_id)
    .filter(i => i.category === group.category);
  const plans = findPlansByLocality(group.locality_id)
    .filter(p => p.category === group.category);

  const sourceIds = new Set<string>();
  indicators.forEach(i => sourceIds.add(i.source_id));
  plans.forEach(p => sourceIds.add(p.source_id));
  const sources = findSourcesByIds([...sourceIds]);

  const score = calculateScore(groupId, workspaceId);

  return {
    group, locality, reports, indicators, plans, sources, score,
    report_ids: reports.map((r: any) => r.id),
    indicator_ids: indicators.map(i => i.id),
    plan_ids: plans.map(p => p.id),
    source_ids: [...sourceIds],
  };
}

export function hashEvidencePacket(packet: any): string {
  const canonical = JSON.stringify({
    report_ids: [...packet.report_ids].sort(),
    indicator_ids: [...packet.indicator_ids].sort(),
    plan_ids: [...packet.plan_ids].sort(),
    source_ids: [...packet.source_ids].sort(),
    score: packet.score,
    formula_version: 'v1',
  });
  return crypto.createHash('sha256').update(canonical).digest('hex').substring(0, 16);
}

export function buildExportPacket(groupId: string, workspaceId: string): ExportPacket {
  const ep = buildEvidencePacket(groupId, workspaceId);

  return {
    schema_version: '1.0',
    synthetic: true,
    provider_mode: ep.reports.some((r: any) => r.provider_mode === 'live') ? 'live' : 'fixture',
    group_id: groupId,
    locality_id: ep.group.locality_id,
    category: ep.group.category,
    report_ids: ep.report_ids,
    indicator_ids: ep.indicator_ids,
    plan_ids: ep.plan_ids,
    source_ids: ep.source_ids,
    score: ep.score.score,
    formula_version: 'v1',
    exported_at: new Date().toISOString(),
    evidence_packet: {
      locality: {
        id: ep.locality.id,
        name: ep.locality.name,
        state_code: ep.locality.state_code,
        district_id: ep.locality.district_id,
        synthetic: !!ep.locality.synthetic,
      },
      indicators: ep.indicators.map((i: any) => ({
        id: i.id, locality_id: i.locality_id, category: i.category,
        population: i.population, gap_pct: i.gap_pct, source_id: i.source_id, as_of: i.as_of,
      })),
      plans: ep.plans.map((p: any) => ({
        id: p.id, locality_id: p.locality_id, category: p.category,
        status: p.status, source_id: p.source_id, as_of: p.as_of,
      })),
      reports: ep.reports.map((r: any) => ({
        id: r.id, redacted_text: r.redacted_text, provider_mode: r.provider_mode,
      })),
      sources: ep.sources.map((s: any) => ({
        id: s.id, kind: s.kind, title: s.title, as_of: s.as_of, caveat: s.caveat,
      })),
    },
  };
}
