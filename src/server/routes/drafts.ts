import { Router } from 'express';
import { requireSession } from '../middleware/session.js';
import { rateLimiter } from '../middleware/security.js';
import { createDraft } from '../services/intake.js';
import { confirmDraft } from '../services/confirmation.js';
import { CreateDraftSchema, ConfirmDraftSchema } from '../../shared/types.js';
import { queryOne } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/drafts
router.post('/', requireSession, rateLimiter('drafts', 10, 10), async (req, res) => {
  try {
    const parsed = CreateDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: parsed.error.message, retryable: false },
        requestId: req.requestId,
      });
      return;
    }
    const { text, localityId, languageHint } = parsed.data;
    const result = await createDraft(req.workspaceId!, text, localityId, languageHint);
    res.status(result.status === 'failed' ? 502 : 201).json(result);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message, retryable: status >= 500 },
      requestId: req.requestId,
    });
  }
});

// GET /api/drafts/:id
router.get('/:id', requireSession, (req, res) => {
  const draft = queryOne<any>('SELECT * FROM drafts WHERE id = ? AND workspace_id = ?',
    [req.params.id, req.workspaceId]);
  if (!draft) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Draft not found', retryable: false },
      requestId: req.requestId,
    });
    return;
  }
  res.json({
    draftId: draft.id,
    status: draft.status,
    extraction: draft.extraction_json ? JSON.parse(draft.extraction_json) : null,
    providerMode: draft.provider_mode,
    redactedText: draft.redacted_text,
    localityId: draft.locality_id,
    reviewReasons: draft.extraction_json ? JSON.parse(draft.extraction_json).review_reasons : [],
    errorCode: draft.error_code,
  });
});

// POST /api/drafts/:id/confirm
router.post('/:id/confirm', requireSession, async (req, res) => {
  try {
    const parsed = ConfirmDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'INVALID_INPUT', message: parsed.error.message, retryable: false },
        requestId: req.requestId,
      });
      return;
    }
    const { category, localityId, acknowledged } = parsed.data;
    const result = confirmDraft(req.workspaceId!, String(req.params.id), category, localityId);
    res.status(201).json(result);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message, retryable: false },
      requestId: req.requestId,
    });
  }
});

export default router;
