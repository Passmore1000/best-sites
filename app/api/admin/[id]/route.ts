import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TagKind, WebsiteRow } from "@/lib/types";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

// Columns the admin form is allowed to write directly.
const EDITABLE: (keyof WebsiteRow)[] = [
  "name", "slug", "url", "industry", "summary", "design_analysis", "conversion_analysis",
  "why_it_works", "what_could_improve", "strengths", "weaknesses", "meta_title",
  "meta_description", "tech_stack", "cms", "hosting", "scores",
];

type Ctx = { params: Promise<{ id: string }> };

async function guard() {
  const user = await getAdminUser();
  return user ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const db = createAdminClient();

  const body = (await request.json()) as Record<string, unknown> & {
    tags?: string[];
    styles?: string[];
    sections?: string[];
  };

  const update: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) update[key] = body[key];
  }

  const { error } = await db
    .from("websites")
    .update(update as Partial<WebsiteRow>)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync inspiration categories when provided.
  if (Array.isArray(body.styles) || Array.isArray(body.sections) || Array.isArray(body.tags)) {
    const tags = [
      ...toTags(body.styles ?? body.tags ?? [], "style"),
      ...toTags(body.sections ?? [], "section"),
    ];
    if (tags.length) await db.from("tags").upsert(tags, { onConflict: "slug" });
    await db.from("website_tags").delete().eq("website_id", id);
    if (tags.length) {
      await db.from("website_tags").insert(tags.map((t) => ({ website_id: id, tag_slug: t.slug })));
    }
  }

  return NextResponse.json({ ok: true });
}

function toTags(labels: string[], kind: TagKind) {
  return labels.map((label) => ({ slug: slugify(label), label, kind })).filter((tag) => tag.slug);
}

export async function POST(request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const { action } = (await request.json()) as { action?: string };
  const db = createAdminClient();

  if (action === "publish") {
    const { error } = await db
      .from("websites")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "unpublish") {
    const { error } = await db.from("websites").update({ status: "draft" }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const { error } = await createAdminClient().from("websites").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
