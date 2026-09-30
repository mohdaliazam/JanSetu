import { queryOne, run, transaction } from '../db/connection.js';
import { getOrCreateGroup, addReportToGroup } from './grouping.js';
import { v4 as uuidv4 } from 'uuid';
import type { ConfirmResponse } from '../../shared/types.js';

export function confirmDraft(
  workspaceId: string, draftId: string, category: string, localityId: string
): ConfirmResponse {
  return transaction(() => {
    const draft = queryOne<any>(
      'SELECT * FROM drafts WHERE id = ? AND workspace_id = ?',
      [draftId, workspaceId]
    );
    if (!draft) throw Object.assign(new Error('Draft not found'), { status: 404, code: 'NOT_FOUND' });
    
    // Already confirmed? Return existing report (idempotent)
    if (draft.status === 'confirmed') {
      const existingReport = queryOne<any>(
        'SELECT * FROM reports WHERE draft_id = ? AND workspace_id = ?',
        [draftId, workspaceId]
      );
      if (existingReport) {
        const gr = queryOne<any>('SELECT group_id FROM group_reports WHERE report_id = ?', [existingReport.id]);
        return { reportId: existingReport.id, groupId: gr?.group_id || null, status: 'confirmed' as const };
      }
    }

    if (draft.status !== 'review') {
      throw Object.assign(new Error('Draft is not ready for confirmation'), { status: 409, code: 'NOT_REVIEW_READY' });
    }

    const extraction = draft.extraction_json ? JSON.parse(draft.extraction_json) : null;
    const reportId = uuidv4();
    const now = new Date().toISOString();

    // Update draft to confirmed
    run('UPDATE drafts SET status = ?, locality_id = ? WHERE id = ?', ['confirmed', localityId, draftId]);

    // Create report
    run(`INSERT INTO reports (id, workspace_id, draft_id, locality_id, category, summary_en, language, redacted_text, urgency, evidence_quote, provider_mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, workspaceId, draftId, localityId, category,
       extraction?.summary_en || 'No summary available',
       extraction?.language || draft.input_language || 'en',
       draft.redacted_text,
       extraction?.urgency || 'routine',
       extraction?.evidence_quote || draft.redacted_text.substring(0, 100),
       draft.provider_mode, now]);

    // Create/join group
    const groupId = getOrCreateGroup(workspaceId, localityId, category);
    if (groupId) {
      addReportToGroup(groupId, reportId);
    }

    // Audit event
    run(`INSERT INTO audit_events (id, workspace_id, event_type, entity_id, safe_metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), workspaceId, 'report_confirmed', reportId,
       JSON.stringify({ draft_id: draftId, category, locality_id: localityId }),
       now]);

    return { reportId, groupId, status: 'confirmed' as const };
  });
}
