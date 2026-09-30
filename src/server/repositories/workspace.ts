import { queryAll, queryOne, run, transaction, saveDb } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export function createWorkspace(tokenHash: string, expiresAt: string) {
  const id = uuidv4();
  const now = new Date().toISOString();
  run('INSERT INTO workspaces (id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)',
    [id, tokenHash, now, expiresAt]);
  saveDb();
  return { id, token_hash: tokenHash, created_at: now, expires_at: expiresAt };
}

export function findWorkspaceByTokenHash(tokenHash: string) {
  const ws = queryOne<any>('SELECT * FROM workspaces WHERE token_hash = ?', [tokenHash]);
  if (!ws) return null;
  if (new Date(ws.expires_at) < new Date()) return null;
  return ws;
}

export function purgeExpiredWorkspaces(): number {
  const expired = queryAll<any>('SELECT id FROM workspaces WHERE expires_at < ?', [new Date().toISOString()]);
  for (const ws of expired) {
    run('DELETE FROM workspaces WHERE id = ?', [ws.id]);
  }
  if (expired.length > 0) saveDb();
  return expired.length;
}
