import { Router } from 'express';
import { getDb } from '../db/connection.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const db = getDb();
    db.exec('SELECT 1');
    res.json({ status: 'ok', version: '0.1.0' });
  } catch (_err) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

export default router;
