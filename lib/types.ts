/**
 * Domain types for BestSites.io.
 *
 * `Database` mirrors the SQL in `supabase/migrations/0001_init.sql` and is handed to
 * the typed Supabase client. When the schema changes, regenerate or update both in
 * lockstep (`supabase gen types typescript` once a project is linked).
 */

export const SCORE_KEYS = [
  "design",
  "mobile",
  "trust",
  "conversion",
  "performance",
  "overall",
] as const;
export type ScoreKey = (typeof SCORE_KEYS)[number];
export type Scores = Record<ScoreKey, number>;

export type WebsiteStatus = "draft" | "published";

export type MediaKind =
  | "desktop_shot"
  | "mobile_shot"
  | "fullpage_shot"
  | "desktop_video"
  | "mobile_video";

export type TagKind = "style" | "feature" | "section";

export type PipelineJobStatus = "pending" | "running" | "completed" | "failed";

export type PipelineJobOptions = {
  industry?: string | null;
  summary?: string | null;
  styles?: string[];
  sections?: string[];
  publish?: boolean;
};

export type PipelineJobResult = {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "published";
  mediaCount: number;
  previewImageUrl?: string;
};

export type PipelineJobRow = {
  id: string;
  url: string;
  status: PipelineJobStatus;
  options: PipelineJobOptions;
  result: PipelineJobResult | null;
  error: string | null;
  created_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

// Declared as `type` (not `interface`) so they satisfy postgrest's
// `Record<string, unknown>` table constraint — interfaces lack an index signature.
export type WebsiteRow = {
  id: string;
  slug: string;
  name: string;
  url: string;
  domain: string | null;
  industry: string | null;
  status: WebsiteStatus;
  summary: string | null;
  design_analysis: string | null;
  conversion_analysis: string | null;
  why_it_works: string | null;
  what_could_improve: string | null;
  strengths: string[];
  weaknesses: string[];
  meta_title: string | null;
  meta_description: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  tech_stack: string[];
  cms: string | null;
  hosting: string | null;
  scores: Scores | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MediaRow = {
  id: string;
  website_id: string;
  kind: MediaKind;
  storage_path: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

export type TagRow = {
  slug: string;
  label: string;
  kind: TagKind;
};

/** A website joined with its media, tags and similar sites — what the UI consumes. */
export interface WebsiteWithRelations extends WebsiteRow {
  media: MediaRow[];
  tags: TagRow[];
  similar?: WebsiteWithRelations[];
}

/** Minimal shape for a typed supabase-js client. Hand-maintained alongside the migration.
 *  Each table carries `Relationships: []` so the type satisfies postgrest's GenericSchema
 *  (without it, supabase-js infers `never` for every query builder). */
export interface Database {
  public: {
    Tables: {
      websites: {
        Row: WebsiteRow;
        Insert: Partial<WebsiteRow> & Pick<WebsiteRow, "slug" | "name" | "url">;
        Update: Partial<WebsiteRow>;
        Relationships: [];
      };
      media: {
        Row: MediaRow;
        Insert: Omit<MediaRow, "id" | "created_at"> & Partial<Pick<MediaRow, "id" | "created_at">>;
        Update: Partial<MediaRow>;
        Relationships: [];
      };
      tags: {
        Row: TagRow;
        Insert: TagRow;
        Update: Partial<TagRow>;
        Relationships: [];
      };
      website_tags: {
        Row: { website_id: string; tag_slug: string };
        Insert: { website_id: string; tag_slug: string };
        Update: Partial<{ website_id: string; tag_slug: string }>;
        Relationships: [];
      };
      similar_sites: {
        Row: { website_id: string; related_id: string; relevance: number };
        Insert: { website_id: string; related_id: string; relevance?: number };
        Update: Partial<{ website_id: string; related_id: string; relevance: number }>;
        Relationships: [];
      };
      pipeline_jobs: {
        Row: PipelineJobRow;
        Insert: Partial<PipelineJobRow> & Pick<PipelineJobRow, "url">;
        Update: Partial<PipelineJobRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      website_status: WebsiteStatus;
      media_kind: MediaKind;
      tag_kind: TagKind;
      pipeline_job_status: PipelineJobStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
