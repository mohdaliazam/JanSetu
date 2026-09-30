import { Router } from 'express';
import { requireSession } from '../middleware/session.js';
import { queryAll } from '../db/connection.js';

const router = Router();

router.get('/', requireSession, (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || '25'), 10), 100);
    const cursor = req.query.cursor ? String(req.query.cursor) : null;

    let sql = 'SELECT * FROM reports WHERE workspace_id = ?';
    const params: any[] = [req.workspaceId];

    if (cursor) {
      sql += ' AND created_at < ?';
      params.push(cursor);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit + 1);

    const rows = queryAll<any>(sql, params);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : undefined;

    res.json({ items, nextCursor });
  } catch (err: any) {
    res.status(400).json({
      error: { code: 'BAD_REQUEST', message: err.message, retryable: false },
      requestId: req.requestId,
    });
  }
});

export default router;
