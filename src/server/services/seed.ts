import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, transaction, saveDb } from '../db/connection.js';
import { upsertLocality } from '../repositories/locality.js';
import { upsertSource } from '../repositories/source.js';
import { upsertIndicator } from '../repositories/indicator.js';
import { upsertPlan } from '../repositories/plan.js';
import { getOrCreateGroup, addReportToGroup } from './grouping.js';
import { v4 as uuidv4 } from 'uuid';

export function seedWorkspace(workspaceId: string): void {
  const dataPath = path.resolve(process.cwd(), 'fixtures/demo-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  transaction(() => {
    // Insert sources
    for (const src of data.sources) {
      upsertSource(src);
    }

    // Insert localities
    for (const loc of data.localities) {
      upsertLocality(loc);
    }

    // Insert indicators
    for (const ind of data.indicators) {
      upsertIndicator(ind);
    }

    // Insert plans
    for (const plan of data.plans) {
      upsertPlan(plan);
    }

    // Create seed reports
    for (const seed of data.seed_reports) {
      const draftId = uuidv4();
      const reportId = uuidv4();
      const now = new Date().toISOString();

      // Create confirmed draft
      run(`INSERT OR IGNORE INTO drafts (id, workspace_id, redacted_text, input_language, locality_id, extraction_json, provider_mode, model_id, prompt_version, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [draftId, workspaceId, seed.text, seed.language, seed.locality_id,
         JSON.stringify({ category: seed.category, summary_en: seed.summary_en, language: seed.language, urgency: seed.urgency, evidence_quote: seed.text, needs_review: false, review_reasons: [] }),
         'fixture', null, 'extract-v1', 'confirmed', now]);

      // Create report
      run(`INSERT OR IGNORE INTO reports (id, workspace_id, draft_id, locality_id, category, summary_en, language, redacted_text, urgency, evidence_quote, provider_mode, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [reportId, workspaceId, draftId, seed.locality_id, seed.category,
         seed.summary_en, seed.language, seed.text, seed.urgency, seed.text, 'fixture', now]);

      // Group
      const groupId = getOrCreateGroup(workspaceId, seed.locality_id, seed.category);
      if (groupId) {
        addReportToGroup(groupId, reportId);
      }

      // Audit
      run(`INSERT INTO audit_events (id, workspace_id, event_type, entity_id, safe_metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), workspaceId, 'seed_report_created', reportId,
         JSON.stringify({ fixture_id: seed.id }), now]);
    }
  });
}
