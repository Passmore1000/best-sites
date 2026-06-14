import type { CaptureResult, ScoreResult } from "./types";

/**
 * Step 5 — Website scoring.  [STUB → real]
 *
 * Real implementation (build next): call `extractStructured<ScoreResult>()` with
 * `SCORING_SYSTEM`, `scoringPrompt()` and `SCORING_TOOL` from `lib/ai/prompts.ts`,
 * passing the screenshot URLs. Optionally fold in a real Lighthouse/PageSpeed run for
 * the performance dimension.
 *
 * Until then this returns nulls-as-zeros placeholder scores; the admin sets/edits them.
 */
export async function scoreWebsite(input: {
  url: string;
  capture: CaptureResult;
}): Promise<ScoreResult> {
  // TODO: replace with the Claude scoring call described above.
  void input;
  return { design: 0, mobile: 0, trust: 0, conversion: 0, performance: 0, overall: 0 };
}
