import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createPipelineJob } from "@/lib/jobs";
import type { PipelineJobOptions } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "A url is required" }, { status: 400 });
  }

  const options: PipelineJobOptions = {
    industry: text(body.industry),
    summary: text(body.summary),
    styles: strings(body.styles),
    sections: strings(body.sections),
    publish: body.publish === true,
  };

  try {
    const job = await createPipelineJob(url, options, user.email);
    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      url: job.url,
    });
  } catch (e) {
    console.error("[api/generate] enqueue failed:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}
