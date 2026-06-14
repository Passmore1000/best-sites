import type { MediaKind, Scores } from "@/lib/types";

/** A captured asset, already uploaded to Storage (storagePath) or a remote URL. */
export interface CapturedMedia {
  kind: MediaKind;
  storagePath: string;
  width?: number;
  height?: number;
}

export interface CaptureResult {
  media: CapturedMedia[];
}

export interface MetadataResult {
  domain: string;
  title?: string;
  description?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  techStack: string[];
  cms?: string;
  hosting?: string;
}

export interface AnalysisResult {
  name: string;
  industry: string;
  summary: string;
  designAnalysis: string;
  conversionAnalysis: string;
  whyItWorks: string;
  whatCouldImprove: string;
  strengths: string[];
  weaknesses: string[];
  /** Tag labels, e.g. "Luxury", "Lead Generation". */
  tags: string[];
}

export type ScoreResult = Scores;

export interface SimilarResult {
  related: { id: string; relevance: number }[];
}

/** Outcome of generateListing. */
export interface GeneratedListing {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "published";
  mediaCount: number;
  previewImageUrl?: string;
}
