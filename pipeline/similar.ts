import type { Client } from "@/lib/queries";
import type { AnalysisResult, SimilarResult } from "./types";

/**
 * Step 6 — Similar-site discovery.  [STUB → real]
 *
 * Real implementation (build next): embed this site's summary + tags (e.g. Voyage/
 * OpenAI embeddings stored in a pgvector column) and rank existing published sites by
 * cosine similarity, optionally boosting same-industry matches. Return the top N ids.
 *
 * Until then this returns a simple same-industry match using existing rows so internal
 * linking is exercised end-to-end.
 */
export async function findSimilar(input: {
  client: Client;
  websiteId: string;
  analysis: AnalysisResult;
}): Promise<SimilarResult> {
  // TODO: replace with embedding-based ranking (pgvector).
  const { data } = await input.client
    .from("websites")
    .select("id")
    .eq("status", "published")
    .eq("industry", input.analysis.industry)
    .neq("id", input.websiteId)
    .limit(4);

  return { related: (data ?? []).map((r) => ({ id: r.id, relevance: 0.5 })) };
}
