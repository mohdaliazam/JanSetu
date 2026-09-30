import { Router } from 'express';
import { requireSession } from '../middleware/session.js';
import { findAllLocalities } from '../repositories/locality.js';

const router = Router();

router.get('/', requireSession, (req, res) => {
  try {
    const filters: any = {};
    if (req.query.state_code) filters.state_code = String(req.query.state_code);
    if (req.query.district_id) filters.district_id = String(req.query.district_id);
    const items = findAllLocalities(filters);
    res.json({ items });
  } catch (err: any) {
    res.status(400).json({
      error: { code: 'BAD_REQUEST', message: err.message, retryable: false },
      requestId: req.requestId,
    });
  }
});

export default router;
