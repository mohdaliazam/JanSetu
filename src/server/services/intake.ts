import { run, queryOne, saveDb } from '../db/connection.js';
import { redact } from './redaction.js';
import { extract } from '../ai/adapter.js';
import { findLocalityById } from '../repositories/locality.js';
import { v4 as uuidv4 } from 'uuid';
import type { DraftResponse, Language } from '../../shared/types.js';

export async function createDraft(
  workspaceId: string, text: string, localityId: string, languageHint?: string
): Promise<DraftResponse> {
  const locality = findLocalityById(localityId);
  if (!locality) throw Object.assign(new Error('Locality not found'), { status: 400, code: 'INVALID_LOCALITY' });

  const redactedText = redact(text);
  const draftId = uuidv4();
  const now = new Date().toISOString();
  const detectedLang = (languageHint || 'en') as Language;

  // Create pending draft
  run(`INSERT INTO drafts (id, workspace_id, redacted_text, input_language, locality_id, provider_mode, prompt_version, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [draftId, workspaceId, redactedText, detectedLang, localityId,
     process.env.AI_MODE === 'live' ? 'live' : 'fixture', 'extract-v1', 'pending', now]);
  saveDb();

  try {
    const extraction = await extract(redactedText, locality, detectedLang);
    const status = extraction.needs_review ? 'review' : 'review'; // Always go to review for user confirmation
    const modelId = process.env.GEMINI_MODEL || 'fixture';

    run(`UPDATE drafts SET extraction_json = ?, model_id = ?, status = ?, provider_mode = ? WHERE id = ?`,
      [JSON.stringify(extraction), modelId, status, process.env.AI_MODE === 'live' ? 'live' : 'fixture', draftId]);
    saveDb();

    return {
      draftId, status, extraction, redactedText,
      localityId, providerMode: (process.env.AI_MODE === 'live' ? 'live' : 'fixture') as any,
      reviewReasons: extraction.review_reasons,
    };
  } catch (err: any) {
    const errorCode = err.code || 'EXTRACTION_FAILED';
    run('UPDATE drafts SET status = ?, error_code = ? WHERE id = ?', ['failed', errorCode, draftId]);
    saveDb();

    return {
      draftId, status: 'failed', extraction: null, redactedText,
      localityId, providerMode: (process.env.AI_MODE === 'live' ? 'live' : 'fixture') as any,
      errorCode,
    };
  }
}
