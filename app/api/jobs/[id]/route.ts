import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getPipelineJob } from "@/lib/jobs";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const job = await getPipelineJob(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (e) {
    console.error("[api/jobs] failed:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
