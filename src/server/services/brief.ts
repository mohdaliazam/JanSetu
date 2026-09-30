import { queryOne, run, saveDb } from '../db/connection.js';
import { buildEvidencePacket, hashEvidencePacket } from './evidence.js';
import { generateBriefAI } from '../ai/adapter.js';
import { BriefSchema } from '../../shared/types.js';
import { v4 as uuidv4 } from 'uuid';
import type { Brief } from '../../shared/types.js';

export async function generateBrief(groupId: string, workspaceId: string): Promise<{
  brief: Brief; evidenceHash: string; providerMode: string; cached: boolean;
}> {
  const packet = buildEvidencePacket(groupId, workspaceId);
  const evidenceHash = hashEvidencePacket(packet);
  const providerMode = process.env.AI_MODE === 'live' ? 'live' : 'fixture';
  const promptVersion = 'brief-v1';

  // Check cache
  const cached = queryOne<any>(
    `SELECT * FROM briefs WHERE workspace_id = ? AND group_id = ? AND evidence_hash = ? AND prompt_version = ? AND provider_mode = ?`,
    [workspaceId, groupId, evidenceHash, promptVersion, providerMode]
  );
  if (cached) {
    return { brief: JSON.parse(cached.body_json), evidenceHash, providerMode, cached: true };
  }

  // Generate new brief
  const briefResult = await generateBriefAI(packet);
  const parsed = BriefSchema.parse(briefResult);

  // Validate citations
  const allowedIds = new Set([
    ...packet.report_ids, ...packet.indicator_ids,
    ...packet.plan_ids, ...packet.source_ids,
  ]);
  for (const item of parsed.rationale) {
    for (const sid of item.source_ids) {
      if (!allowedIds.has(sid)) {
        throw Object.assign(new Error(`Brief contains unknown citation: ${sid}`), { status: 502, code: 'INVALID_CITATION' });
      }
    }
  }

  // Cache the brief
  const modelId = process.env.GEMINI_MODEL || 'fixture';
  run(`INSERT OR REPLACE INTO briefs (id, workspace_id, group_id, evidence_hash, prompt_version, model_id, provider_mode, body_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), workspaceId, groupId, evidenceHash, promptVersion, modelId, providerMode,
     JSON.stringify(parsed), new Date().toISOString()]);
  saveDb();

  return { brief: parsed, evidenceHash, providerMode, cached: false };
}
