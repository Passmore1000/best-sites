import type Anthropic from "@anthropic-ai/sdk";

/**
 * Prompt + JSON schema definitions for the analysis and scoring steps. These are the
 * contracts the pipeline fills in: `analyze.ts` / `score.ts` pass these to
 * `extractStructured()` from `lib/ai/client.ts` once screenshot capture is live.
 */

export const ANALYSIS_SYSTEM = `You are a senior web designer and conversion-rate strategist who evaluates small-business websites for BestSites.io. You are precise, specific, and avoid generic praise. Base every observation on what is actually visible in the screenshots and page content.`;

export function analysisPrompt(input: { url: string; title?: string; pageText?: string }): string {
  return [
    `Analyse this small-business website for a curated inspiration gallery.`,
    `URL: ${input.url}`,
    input.title ? `Page title: ${input.title}` : "",
    input.pageText ? `Visible page text (truncated):\n${input.pageText.slice(0, 6000)}` : "",
    `Use the desktop, mobile and full-page screenshots provided. Identify the business name and industry, summarise the site, and explain its design and conversion approach with concrete, specific observations.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const ANALYSIS_TOOL: {
  name: string;
  description: string;
  input_schema: Anthropic.Tool.InputSchema;
} = {
  name: "record_website_analysis",
  description: "Record the structured analysis of the website.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "The business name." },
      industry: {
        type: "string",
        description: "Primary industry, e.g. Restaurant, Dentist, Plumber, Gym, Builder.",
      },
      summary: { type: "string", description: "2-3 sentence overview of the site." },
      designAnalysis: { type: "string", description: "Specific observations about the visual design." },
      conversionAnalysis: { type: "string", description: "How the site drives conversion." },
      whyItWorks: { type: "string", description: "What makes this site effective overall." },
      whatCouldImprove: { type: "string", description: "The biggest opportunity to improve." },
      strengths: { type: "array", items: { type: "string" }, description: "3-5 concrete strengths." },
      weaknesses: { type: "array", items: { type: "string" }, description: "1-3 concrete weaknesses." },
      tags: {
        type: "array",
        items: { type: "string" },
        description:
          "Style/feature tags from: Luxury, Minimal, Editorial, Premium, Bold, Playful, Lead Generation, Booking Focused.",
      },
    },
    required: [
      "name",
      "industry",
      "summary",
      "designAnalysis",
      "conversionAnalysis",
      "strengths",
      "weaknesses",
      "tags",
    ],
  },
};

export const SCORING_SYSTEM = `You are an expert website evaluator. Score the website on a 0-100 scale across six dimensions, calibrated so that 70 is competent, 85 is excellent, and 95+ is best-in-class. Be discerning — most sites are not 90s.`;

export function scoringPrompt(input: { url: string }): string {
  return `Score this website using the provided screenshots. URL: ${input.url}. Provide integer scores 0-100 for design, mobile, trust, conversion and performance, plus a weighted overall.`;
}

export const SCORING_TOOL: {
  name: string;
  description: string;
  input_schema: Anthropic.Tool.InputSchema;
} = {
  name: "record_scores",
  description: "Record the website scores.",
  input_schema: {
    type: "object",
    properties: {
      design: { type: "integer", minimum: 0, maximum: 100 },
      mobile: { type: "integer", minimum: 0, maximum: 100 },
      trust: { type: "integer", minimum: 0, maximum: 100 },
      conversion: { type: "integer", minimum: 0, maximum: 100 },
      performance: { type: "integer", minimum: 0, maximum: 100 },
      overall: { type: "integer", minimum: 0, maximum: 100 },
    },
    required: ["design", "mobile", "trust", "conversion", "performance", "overall"],
  },
};
