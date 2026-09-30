import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import { getDb } from './db/connection.js';
import { runMigrations } from './db/migrate.js';
import healthRouter from './routes/health.js';
import sessionRouter from './routes/session.js';
import localitiesRouter from './routes/localities.js';
import draftsRouter from './routes/drafts.js';
import groupsRouter from './routes/groups.js';
import reportsRouter from './routes/reports.js';
import { v4 as uuidv4 } from 'uuid';

const PORT = parseInt(process.env.PORT || '3000', 10);
const AI_MODE = process.env.AI_MODE || 'fixture';
const APP_ORIGIN = process.env.APP_ORIGIN || `http://localhost:${PORT}`;
const VERSION = '0.1.0';

import { initDb } from './db/connection.js';

// Run migrations and start server
async function startup() {
  try {
    await initDb();
    runMigrations();
    console.log('[startup] Migrations applied');
  } catch (err) {
    console.error('[startup] Migration failed:', err);
    process.exit(1);
  }


const app = express();

// Body limit
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// Origin validation for mutations
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.get('Origin');
    // In development, skip origin check if APP_ORIGIN is localhost
    if (origin && APP_ORIGIN && !APP_ORIGIN.includes('localhost')) {
      if (origin !== APP_ORIGIN) {
        res.status(403).json({
          error: { code: 'FORBIDDEN_ORIGIN', message: 'Origin not allowed', retryable: false },
          requestId: uuidv4(),
        });
        return;
      }
    }
  }
  next();
});

// Request ID
app.use((req, _res, next) => {
  (req as any).requestId = uuidv4();
  next();
});

// Mount API routes
app.use('/api/health', healthRouter);
app.use('/api/session', sessionRouter);
app.use('/api/localities', localitiesRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/reports', reportsRouter);

// Serve built client in production
const clientDir = path.resolve(process.cwd(), 'dist/client');
const clientDirAlt = path.resolve(process.cwd(), 'dist/client');

const staticDir = fs.existsSync(clientDir) ? clientDir : clientDirAlt;
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.use((_req, res, next) => {
    if (_req.method === 'GET' && !_req.path.startsWith('/api/')) {
      res.sendFile(path.join(staticDir, 'index.html'));
    } else {
      next();
    }
  });
}

// Error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[error] ${req.method} ${req.path}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: status === 500 ? 'Internal server error' : err.message,
      retryable: false,
    },
    requestId: (req as any).requestId || uuidv4(),
  });
});

  app.listen(PORT, () => {
    console.log(`[JanSetu] v${VERSION} listening on port ${PORT}`);
    console.log(`[JanSetu] AI_MODE=${AI_MODE}`);
    console.log(`[JanSetu] APP_ORIGIN=${APP_ORIGIN}`);
    console.log(`[JanSetu] DATA_DIR=${process.env.DATA_DIR || './data'}`);
  });
}

startup();

