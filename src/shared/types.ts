// Shared types and validation schemas for JanSetu
import { z } from 'zod';

// === Enums ===
export const CategoryEnum = z.enum([
  'water', 'roads', 'sanitation', 'lighting',
  'education', 'healthcare_access', 'other'
]);
export type Category = z.infer<typeof CategoryEnum>;

export const LanguageEnum = z.enum(['hi', 'en', 'mixed', 'unknown']);
export type Language = z.infer<typeof LanguageEnum>;

export const UrgencyEnum = z.enum(['routine', 'elevated', 'urgent']);
export type Urgency = z.infer<typeof UrgencyEnum>;

export const DraftStatusEnum = z.enum(['pending', 'review', 'failed', 'confirmed']);
export type DraftStatus = z.infer<typeof DraftStatusEnum>;

export const PlanStatusEnum = z.enum(['proposed', 'funded', 'in_progress', 'completed']);
export type PlanStatus = z.infer<typeof PlanStatusEnum>;

export const ProviderModeEnum = z.enum(['live', 'fixture']);
export type ProviderMode = z.infer<typeof ProviderModeEnum>;

export const SourceKindEnum = z.enum(['synthetic', 'public']);
export type SourceKind = z.infer<typeof SourceKindEnum>;

// === Extraction Schema ===
export const ExtractionSchema = z.object({
  category: CategoryEnum,
  summary_en: z.string().min(1).max(400),
  language: LanguageEnum,
  urgency: UrgencyEnum,
  evidence_quote: z.string().min(1).max(500),
  needs_review: z.boolean(),
  review_reasons: z.array(z.string().min(1).max(200)).max(5),
});
export type Extraction = z.infer<typeof ExtractionSchema>;

// === Brief Schema ===
export const BriefRationaleSchema = z.object({
  claim: z.string().min(1).max(500),
  source_ids: z.array(z.string().min(1)).min(1),
});

export const BriefSchema = z.object({
  title: z.string().min(1).max(140),
  rationale: z.array(BriefRationaleSchema).min(1).max(5),
  next_steps: z.array(z.string().min(1).max(300)).min(1).max(5),
  caveats: z.array(z.string().min(1).max(300)).min(1).max(6),
});
export type Brief = z.infer<typeof BriefSchema>;

// === API Request/Response Types ===
export const CreateDraftSchema = z.object({
  text: z.string().min(10).max(2000),
  localityId: z.string().min(1),
  languageHint: LanguageEnum.optional(),
});

export const ConfirmDraftSchema = z.object({
  category: CategoryEnum,
  localityId: z.string().min(1),
  acknowledged: z.literal(true),
});

// === Domain Types ===
export interface Locality {
  id: string;
  district_id: string;
  district_name: string;
  state_code: string;
  state_name: string;
  name: string;
  synthetic: boolean;
}

export interface Indicator {
  id: string;
  locality_id: string;
  category: Category;
  population: number | null;
  gap_pct: number | null;
  source_id: string;
  as_of: string;
}

export interface Plan {
  id: string;
  locality_id: string;
  category: Category;
  status: PlanStatus;
  description: string;
  source_id: string;
  as_of: string;
}

export interface Source {
  id: string;
  kind: SourceKind;
  title: string;
  url: string | null;
  licence: string | null;
  as_of: string;
  caveat: string;
}

export interface Draft {
  id: string;
  workspace_id: string;
  redacted_text: string;
  input_language: Language;
  locality_id: string;
  extraction_json: Extraction | null;
  provider_mode: ProviderMode;
  model_id: string | null;
  prompt_version: string;
  status: DraftStatus;
  error_code: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  workspace_id: string;
  draft_id: string;
  locality_id: string;
  category: Category;
  summary_en: string;
  language: Language;
  redacted_text: string;
  urgency: Urgency;
  evidence_quote: string;
  provider_mode: ProviderMode;
  created_at: string;
}

export interface Group {
  id: string;
  workspace_id: string;
  locality_id: string;
  category: Category;
}

export interface ScoreComponents {
  gap: number | null;
  population_component: number | null;
  urgency_component: number;
  demand_component: number;
  funding_penalty: number;
  score: number | null;
  formula_version: string;
  insufficient_data: boolean;
}

export interface GroupDetail extends Group {
  reports: Report[];
  indicators: Indicator[];
  plans: Plan[];
  sources: Source[];
  score: ScoreComponents;
  report_count: number;
}

export interface BriefRecord {
  id: string;
  workspace_id: string;
  group_id: string;
  evidence_hash: string;
  prompt_version: string;
  model_id: string;
  provider_mode: ProviderMode;
  body_json: Brief;
  created_at: string;
}

// === API Response Types ===
export interface HealthResponse {
  status: 'ok';
  version: string;
}

export interface SessionResponse {
  workspaceExpiresAt: string;
  synthetic: true;
  providerMode: ProviderMode;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
  requestId: string;
}

export interface DraftResponse {
  draftId: string;
  status: DraftStatus;
  extraction: Extraction | null;
  providerMode: ProviderMode;
  redactedText: string;
  localityId: string;
  reviewReasons?: string[];
  errorCode?: string | null;
}

export interface ConfirmResponse {
  reportId: string;
  groupId: string | null;
  status: 'confirmed';
}

export interface GroupListItem {
  id: string;
  locality_id: string;
  category: Category;
  report_count: number;
  score: number | null;
  insufficient_data: boolean;
  locality_name: string;
  state_code: string;
  district_name: string;
}

export interface GroupListResponse {
  items: GroupListItem[];
  insufficientData: GroupListItem[];
  formulaVersion: 'v1';
}

// === Export Schema ===
export interface ExportPacket {
  schema_version: '1.0';
  synthetic: boolean;
  provider_mode: ProviderMode;
  group_id: string;
  locality_id: string;
  category: Category;
  report_ids: string[];
  indicator_ids: string[];
  plan_ids: string[];
  source_ids: string[];
  score: number | null;
  formula_version: 'v1';
  exported_at: string;
  evidence_packet: {
    locality: {
      id: string;
      name: string;
      state_code: string;
      district_id: string;
      synthetic: boolean;
    };
    indicators: Array<{
      id: string;
      locality_id: string;
      category: Category;
      population: number | null;
      gap_pct: number | null;
      source_id: string;
      as_of: string;
    }>;
    plans: Array<{
      id: string;
      locality_id: string;
      category: Category;
      status: PlanStatus;
      source_id: string;
      as_of: string;
    }>;
    reports: Array<{
      id: string;
      redacted_text: string;
      provider_mode: ProviderMode;
    }>;
    sources: Array<{
      id: string;
      kind: SourceKind;
      title: string;
      as_of: string;
      caveat: string;
    }>;
  };
}
