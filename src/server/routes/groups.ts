import { Router } from 'express';
import { requireSession } from '../middleware/session.js';
import { rateLimiter } from '../middleware/security.js';
import { queryAll, queryOne } from '../db/connection.js';
import { calculateScore } from '../services/priority.js';
import { generateBrief } from '../services/brief.js';
import { buildExportPacket } from '../services/evidence.js';
import { findLocalityById } from '../repositories/locality.js';
import { findLatestIndicator } from '../repositories/indicator.js';
import { findPlansByLocalityAndCategory } from '../repositories/plan.js';
import { findSourcesByIds } from '../repositories/source.js';

const router = Router();

// GET /api/groups
router.get('/', requireSession, (req, res) => {
  try {
    let sql = `SELECT g.*, COUNT(gr.report_id) as report_count FROM "groups" g
      LEFT JOIN group_reports gr ON g.id = gr.group_id
      WHERE g.workspace_id = ?`;
    const params: any[] = [req.workspaceId];
    if (req.query.category) { sql += ' AND g.category = ?'; params.push(String(req.query.category)); }
    sql += ' GROUP BY g.id ORDER BY g.locality_id, g.category';

    const groups = queryAll<any>(sql, params);

    const items: any[] = [];
    const insufficientData: any[] = [];

    for (const g of groups) {
      const locality = findLocalityById(g.locality_id);
      const score = calculateScore(g.id, req.workspaceId!);

      // Apply state/district filters
      if (req.query.state_code && locality?.state_code !== String(req.query.state_code)) continue;
      if (req.query.district_id && locality?.district_id !== String(req.query.district_id)) continue;

      const item = {
        id: g.id,
        locality_id: g.locality_id,
        category: g.category,
        report_count: g.report_count,
        score: score.score,
        insufficient_data: score.insufficient_data,
        locality_name: locality?.name || '',
        state_code: locality?.state_code || '',
        district_name: locality?.district_name || '',
      };

      if (score.insufficient_data) {
        insufficientData.push(item);
      } else {
        items.push(item);
      }
    }

    // Sort scored groups descending by score, then group ID ascending for ties
    items.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.id.localeCompare(b.id));

    res.json({ items, insufficientData, formulaVersion: 'v1' });
  } catch (err: any) {
    res.status(400).json({
      error: { code: 'BAD_REQUEST', message: err.message, retryable: false },
      requestId: req.requestId,
    });
  }
});

// GET /api/groups/:id
router.get('/:id', requireSession, (req, res) => {
  const group = queryOne<any>('SELECT * FROM "groups" WHERE id = ? AND workspace_id = ?',
    [req.params.id, req.workspaceId]);
  if (!group) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Group not found', retryable: false },
      requestId: req.requestId,
    });
    return;
  }

  const reports = queryAll<any>(
    `SELECT r.* FROM reports r JOIN group_reports gr ON r.id = gr.report_id WHERE gr.group_id = ? AND r.workspace_id = ?`,
    [group.id, req.workspaceId]
  );
  const locality = findLocalityById(group.locality_id);
  const indicators = findLatestIndicator(group.locality_id, group.category);
  const plans = findPlansByLocalityAndCategory(group.locality_id, group.category);
  const score = calculateScore(group.id, req.workspaceId!);

  const sourceIds = new Set<string>();
  if (indicators) sourceIds.add(indicators.source_id);
  plans.forEach(p => sourceIds.add(p.source_id));
  const sources = findSourcesByIds([...sourceIds]);

  res.json({
    ...group,
    reports,
    locality,
    indicators: indicators ? [indicators] : [],
    plans,
    sources,
    score,
    report_count: reports.length,
  });
});

// POST /api/groups/:id/brief
router.post('/:id/brief', requireSession, rateLimiter('brief', 5, 10), async (req, res) => {
  try {
    const group = queryOne<any>('SELECT * FROM "groups" WHERE id = ? AND workspace_id = ?',
      [req.params.id, req.workspaceId]);
    if (!group) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Group not found', retryable: false },
        requestId: req.requestId,
      });
      return;
    }

    const result = await generateBrief(String(req.params.id), req.workspaceId!);
    res.status(result.cached ? 200 : 201).json(result);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message, retryable: status >= 500 },
      requestId: req.requestId,
    });
  }
});

// GET /api/groups/:id/export
router.get('/:id/export', requireSession, (req, res) => {
  try {
    const group = queryOne<any>('SELECT * FROM "groups" WHERE id = ? AND workspace_id = ?',
      [req.params.id, req.workspaceId]);
    if (!group) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Group not found', retryable: false },
        requestId: req.requestId,
      });
      return;
    }
    const exportPacket = buildExportPacket(String(req.params.id), req.workspaceId!);
    res.json(exportPacket);
  } catch (err: any) {
    res.status(500).json({
      error: { code: 'EXPORT_ERROR', message: err.message, retryable: false },
      requestId: req.requestId,
    });
  }
});

export default router;
