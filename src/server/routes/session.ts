import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { createWorkspace, findWorkspaceByTokenHash } from '../repositories/workspace.js';
import { seedWorkspace } from '../services/seed.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  try {
    // Check if valid session already exists
    const existingToken = req.cookies?.jansetu_session;
    if (existingToken) {
      const hash = crypto.createHash('sha256').update(existingToken).digest('hex');
      const existing = findWorkspaceByTokenHash(hash);
      if (existing) {
        res.status(200).json({
          workspaceExpiresAt: existing.expires_at,
          synthetic: true,
          providerMode: process.env.AI_MODE === 'live' ? 'live' : 'fixture',
        });
        return;
      }
    }

    // Create new workspace
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ttlHours = parseInt(process.env.WORKSPACE_TTL_HOURS || '24', 10);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

    const workspace = createWorkspace(tokenHash, expiresAt);

    // Seed with demo data
    seedWorkspace(workspace.id);

    // Set cookie
    const isSecure = process.env.APP_ORIGIN?.startsWith('https') || false;
    res.cookie('jansetu_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
      maxAge: ttlHours * 60 * 60 * 1000,
    });

    res.status(201).json({
      workspaceExpiresAt: expiresAt,
      synthetic: true,
      providerMode: process.env.AI_MODE === 'live' ? 'live' : 'fixture',
    });
  } catch (err: any) {
    console.error('[session] Error:', err.message);
    res.status(500).json({
      error: { code: 'SESSION_ERROR', message: 'Failed to create session', retryable: true },
      requestId: req.requestId || uuidv4(),
    });
  }
});

export default router;
