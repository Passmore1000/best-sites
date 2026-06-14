import Anthropic from "@anthropic-ai/sdk";

/** Default model for analysis/scoring. */
export const ANALYSIS_MODEL = "claude-opus-4-8";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/**
 * Call Claude and get back a JSON object matching `tool.input_schema`, using a
 * single forced tool call (the reliable way to get structured output). `images`
 * are base64 data URLs or remote URLs of the captured screenshots.
 */
export async function extractStructured<T>(opts: {
  system: string;
  prompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Anthropic.Tool.InputSchema;
  images?: string[];
  model?: string;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getAnthropic();

  const imageBlocks: Anthropic.ImageBlockParam[] = (opts.images ?? []).map((src) => ({
    type: "image",
    source: { type: "url", url: src },
  }));

  const message = await anthropic.messages.create({
    model: opts.model ?? ANALYSIS_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    tools: [
      {
        name: opts.toolName,
        description: opts.toolDescription,
        input_schema: opts.inputSchema,
      },
    ],
    tool_choice: { type: "tool", name: opts.toolName },
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: opts.prompt }, ...imageBlocks],
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) throw new Error("Model did not return a tool call");
  return toolUse.input as T;
}
