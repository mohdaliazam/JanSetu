import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { findWorkspaceByTokenHash } from '../repositories/workspace.js';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      workspaceId?: string;
      requestId?: string;
    }
  }
}

export function requireSession(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.jansetu_session;
  if (!token) {
    res.status(401).json({
      error: { code: 'NO_SESSION', message: 'Session required', retryable: false },
      requestId: req.requestId || uuidv4(),
    });
    return;
  }

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const workspace = findWorkspaceByTokenHash(hash);
  if (!workspace) {
    res.status(401).json({
      error: { code: 'SESSION_EXPIRED', message: 'Session expired or invalid', retryable: false },
      requestId: req.requestId || uuidv4(),
    });
    return;
  }

  req.workspaceId = workspace.id;
  next();
}
