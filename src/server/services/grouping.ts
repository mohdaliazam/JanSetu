import { queryOne, run, saveDb } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export function getOrCreateGroup(workspaceId: string, localityId: string, category: string): string | null {
  // 'other' category is not grouped
  if (category === 'other') return null;

  const existing = queryOne<any>(
    'SELECT id FROM "groups" WHERE workspace_id = ? AND locality_id = ? AND category = ?',
    [workspaceId, localityId, category]
  );
  if (existing) return existing.id;

  const id = uuidv4();
  run('INSERT INTO "groups" (id, workspace_id, locality_id, category) VALUES (?, ?, ?, ?)',
    [id, workspaceId, localityId, category]);
  saveDb();
  return id;
}

export function addReportToGroup(groupId: string, reportId: string): void {
  run('INSERT OR IGNORE INTO group_reports (group_id, report_id) VALUES (?, ?)',
    [groupId, reportId]);
  saveDb();
}
