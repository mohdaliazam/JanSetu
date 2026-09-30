import { Request, Response, NextFunction } from 'express';
import { queryOne, run, saveDb } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export function rateLimiter(bucket: string, max: number, windowMinutes: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.workspaceId) { next(); return; }

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000).toISOString();

    // Clean old entries
    run('DELETE FROM rate_limits WHERE workspace_id = ? AND bucket = ? AND window_start < ?',
      [req.workspaceId, bucket, windowStart]);

    // Count current
    const current = queryOne<any>(
      'SELECT SUM(count) as total FROM rate_limits WHERE workspace_id = ? AND bucket = ? AND window_start >= ?',
      [req.workspaceId, bucket, windowStart]
    );

    if (current && current.total >= max) {
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: `Rate limit exceeded for ${bucket}`, retryable: true },
        requestId: req.requestId || uuidv4(),
      });
      return;
    }

    // Increment
    const currentWindow = now.toISOString().substring(0, 16); // minute precision
    const existing = queryOne<any>(
      'SELECT count FROM rate_limits WHERE workspace_id = ? AND bucket = ? AND window_start = ?',
      [req.workspaceId, bucket, currentWindow]
    );
    if (existing) {
      run('UPDATE rate_limits SET count = count + 1 WHERE workspace_id = ? AND bucket = ? AND window_start = ?',
        [req.workspaceId, bucket, currentWindow]);
    } else {
      run('INSERT INTO rate_limits (workspace_id, bucket, window_start, count) VALUES (?, ?, ?, 1)',
        [req.workspaceId, bucket, currentWindow]);
    }
    saveDb();
    next();
  };
}
