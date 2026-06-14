import type { AnalysisResult, CaptureResult, MetadataResult } from "./types";

/**
 * Step 3 — AI analysis.  [STUB → real]
 *
 * Real implementation (build next): call `extractStructured<AnalysisResult>()` from
 * `lib/ai/client.ts` with `ANALYSIS_SYSTEM`, `analysisPrompt()` and `ANALYSIS_TOOL`
 * from `lib/ai/prompts.ts`, passing the desktop/mobile/full-page screenshot URLs from
 * the capture step as `images`. Claude vision returns the structured analysis directly.
 *
 * Until screenshots are being captured, this returns a typed placeholder derived from
 * the real metadata so the admin can review and edit a complete draft.
 */
export async function analyzeWebsite(input: {
  url: string;
  metadata: MetadataResult;
  capture: CaptureResult;
}): Promise<AnalysisResult> {
  // TODO: replace with the Claude vision call described above.
  const name = input.metadata.title?.split(/[|\-–—]/)[0].trim() || input.metadata.domain;
  return {
    name,
    industry: "Uncategorized",
    summary:
      input.metadata.description ??
      "Pending AI analysis — capture screenshots, then run the analysis step to populate this.",
    designAnalysis: "Pending AI analysis.",
    conversionAnalysis: "Pending AI analysis.",
    whyItWorks: "Pending AI analysis.",
    whatCouldImprove: "Pending AI analysis.",
    strengths: [],
    weaknesses: [],
    tags: [],
  };
}
