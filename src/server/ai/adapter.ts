import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExtractionSchema, BriefSchema } from '../../shared/types.js';
import type { Extraction, Brief, Locality } from '../../shared/types.js';

const EXTRACT_PROMPT = fs.readFileSync(path.resolve(process.cwd(), 'prompts/extract.md'), 'utf-8');
const BRIEF_PROMPT = fs.readFileSync(path.resolve(process.cwd(), 'prompts/brief.md'), 'utf-8');

// Load fixture responses for test mode
const AI_CASES_PATH = path.resolve(process.cwd(), 'fixtures/ai-cases.json');
let fixtureResponses: Map<string, Extraction> | null = null;

function getFixtureResponses(): Map<string, Extraction> {
  if (!fixtureResponses) {
    const cases = JSON.parse(fs.readFileSync(AI_CASES_PATH, 'utf-8'));
    fixtureResponses = new Map();
    for (const c of cases) {
      fixtureResponses.set(c.text.substring(0, 50), {
        category: c.expected_category || 'other',
        summary_en: `Fixture: ${c.purpose}`,
        language: c.text.match(/[\u0900-\u097F]/) ? 'hi' : 'en',
        urgency: 'routine',
        evidence_quote: c.text.substring(0, Math.min(50, c.text.length)),
        needs_review: c.expected_review,
        review_reasons: c.expected_review ? ['Fixture: requires review'] : [],
      });
    }
  }
  return fixtureResponses;
}

export async function extract(
  redactedText: string, locality: Locality, languageHint: string
): Promise<Extraction> {
  const mode = process.env.AI_MODE || 'fixture';

  if (mode !== 'live') {
    // Fixture mode
    const fixtures = getFixtureResponses();
    const key = redactedText.substring(0, 50);
    const fixture = fixtures.get(key);
    if (fixture) return fixture;

    // Default fixture response
    return {
      category: 'other',
      summary_en: 'Development need reported by citizen.',
      language: languageHint === 'hi' ? 'hi' : 'en',
      urgency: 'routine',
      evidence_quote: redactedText.substring(0, Math.min(100, redactedText.length)),
      needs_review: true,
      review_reasons: ['Category could not be determined from fixture mode'],
    };
  }

  // Live Gemini mode
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('GEMINI_API_KEY not configured. Set it in environment variables.'),
      { code: 'MISSING_API_KEY', status: 503 });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const ai = new GoogleGenAI({ apiKey });

  const dataEnvelope = JSON.stringify({
    text: redactedText,
    localityId: locality.id,
    localityName: locality.name,
    districtName: locality.district_name,
    stateName: locality.state_name,
    languageHint,
  });

  const maxAttempts = 2;
  const timeout = 25000;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: dataEnvelope }] }],
        config: {
          systemInstruction: EXTRACT_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object' as any,
            properties: {
              category: { type: 'string' as any, enum: ['water','roads','sanitation','lighting','education','healthcare_access','other'] },
              summary_en: { type: 'string' as any },
              language: { type: 'string' as any, enum: ['hi','en','mixed','unknown'] },
              urgency: { type: 'string' as any, enum: ['routine','elevated','urgent'] },
              evidence_quote: { type: 'string' as any },
              needs_review: { type: 'boolean' as any },
              review_reasons: { type: 'array' as any, items: { type: 'string' as any } },
            },
            required: ['category','summary_en','language','urgency','evidence_quote','needs_review','review_reasons'],
          },
        },
      });

      clearTimeout(timer);

      const text = response.text;
      if (!text) throw new Error('Empty model response');

      const parsed = JSON.parse(text);
      const validated = ExtractionSchema.parse(parsed);

      // Validate evidence_quote is substring of input
      if (!redactedText.includes(validated.evidence_quote)) {
        validated.evidence_quote = redactedText.substring(0, Math.min(100, redactedText.length));
        validated.needs_review = true;
        if (!validated.review_reasons.includes('Evidence quote adjusted')) {
          validated.review_reasons.push('Evidence quote adjusted');
        }
      }

      console.log(`[ai] extraction success: model=${model}, attempt=${attempt + 1}, category=${validated.category}`);
      return validated;

    } catch (err: any) {
      lastError = err;
      console.error(`[ai] extraction attempt ${attempt + 1} failed:`, err.message);

      if (err.message?.includes('API key') || err.code === 'MISSING_API_KEY') {
        throw err; // Don't retry auth errors
      }
      if (attempt < maxAttempts - 1) continue;
    }
  }

  throw Object.assign(
    new Error(`AI extraction failed after ${maxAttempts} attempts: ${lastError?.message}`),
    { code: 'EXTRACTION_FAILED', status: 502 }
  );
}

export async function generateBriefAI(evidencePacket: any): Promise<Brief> {
  const mode = process.env.AI_MODE || 'fixture';

  if (mode !== 'live') {
    // Fixture brief
    const sourceIds = [...(evidencePacket.source_ids || ['SRC-DEMO-01'])];
    const reportIds = evidencePacket.report_ids || [];
    return {
      title: `Infrastructure improvement for ${evidencePacket.group?.category || 'community'} in ${evidencePacket.locality?.name || 'locality'}`,
      rationale: [
        { claim: `${reportIds.length} citizen report(s) describe infrastructure needs in this locality.`, source_ids: sourceIds.length ? sourceIds : ['SRC-DEMO-01'] },
        { claim: 'Service gap indicators suggest underserved infrastructure.', source_ids: sourceIds.length ? sourceIds : ['SRC-DEMO-01'] },
      ],
      next_steps: [
        'Verify reported conditions with field inspection.',
        'Assess overlap with any existing funded plans.',
        'Consult community representatives for prioritisation input.',
      ],
      caveats: [
        'All data in this brief is synthetic and for demonstration purposes only.',
        'Report volume does not represent verified unique beneficiaries.',
        'Score components use illustrative weights, not a validated allocation policy.',
      ],
    };
  }

  // Live brief generation
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY not configured'), { code: 'MISSING_API_KEY', status: 503 });

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const ai = new GoogleGenAI({ apiKey });

  const packetJson = JSON.stringify({
    group_id: evidencePacket.group?.id,
    category: evidencePacket.group?.category,
    locality: evidencePacket.locality,
    reports: evidencePacket.reports?.map((r: any) => ({ id: r.id, redacted_text: r.redacted_text, urgency: r.urgency, summary_en: r.summary_en })),
    indicators: evidencePacket.indicators,
    plans: evidencePacket.plans,
    sources: evidencePacket.sources,
    score: evidencePacket.score,
    allowed_ids: [
      ...evidencePacket.report_ids, ...evidencePacket.indicator_ids,
      ...evidencePacket.plan_ids, ...evidencePacket.source_ids,
    ],
  });

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: packetJson }] }],
    config: {
      systemInstruction: BRIEF_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object' as any,
        properties: {
          title: { type: 'string' as any },
          rationale: { type: 'array' as any, items: { type: 'object' as any, properties: { claim: { type: 'string' as any }, source_ids: { type: 'array' as any, items: { type: 'string' as any } } }, required: ['claim', 'source_ids'] } },
          next_steps: { type: 'array' as any, items: { type: 'string' as any } },
          caveats: { type: 'array' as any, items: { type: 'string' as any } },
        },
        required: ['title', 'rationale', 'next_steps', 'caveats'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('Empty brief response');

  const parsed = JSON.parse(text);
  return BriefSchema.parse(parsed);
}
