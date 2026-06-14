import { createAdminClient, mediaUrl } from "@/lib/supabase/admin";
import type { TagKind } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { captureWebsite } from "./capture";
import { extractMetadata } from "./metadata";
import type { GeneratedListing } from "./types";

export interface GenerateListingOptions {
  industry?: string | null;
  summary?: string | null;
  styles?: string[];
  sections?: string[];
  publish?: boolean;
}

/**
 * The "one URL → inspiration listing" engine. It captures screenshots, fetches
 * lightweight metadata, and inserts a Draft listing for admin review.
 */
export async function generateListing(
  rawUrl: string,
  options: GenerateListingOptions = {},
): Promise<GeneratedListing> {
  const url = normalizeUrl(rawUrl);
  const db = createAdminClient();

  const [capture, metadata] = await Promise.all([captureWebsite(url), extractMetadata(url)]);

  const name = metadata.title?.split(/[|\-–—]/)[0].trim() || metadata.domain;
  const slug = await uniqueSlug(db, slugify(name) || metadata.domain);
  const draft = {
    slug,
    name,
    url,
    domain: metadata.domain,
    industry: options.industry || null,
    status: options.publish ? "published" as const : "draft" as const,
    summary: options.summary || metadata.description || null,
    design_analysis: null,
    conversion_analysis: null,
    why_it_works: null,
    what_could_improve: null,
    strengths: [],
    weaknesses: [],
    meta_title: metadata.title ?? null,
    meta_description: metadata.description ?? null,
    favicon_url: metadata.faviconUrl ?? null,
    og_image_url: metadata.ogImageUrl ?? null,
    tech_stack: metadata.techStack,
    cms: metadata.cms ?? null,
    hosting: metadata.hosting ?? null,
    scores: null,
    published_at: options.publish ? new Date().toISOString() : null,
  };

  const { data: inserted, error } = await db
    .from("websites")
    .insert(draft)
    .select("id, slug, name")
    .single();
  if (error || !inserted) throw error ?? new Error("Failed to insert listing");

  const websiteId = inserted.id;

  // Media
  if (capture.media.length) {
    await db.from("media").insert(
      capture.media.map((m) => ({
        website_id: websiteId,
        kind: m.kind,
        storage_path: m.storagePath,
        width: m.width ?? null,
        height: m.height ?? null,
      })),
    );
  }

  await linkTags(db, websiteId, [
    ...toTags(options.styles ?? [], "style"),
    ...toTags(options.sections ?? [], "section"),
  ]);

  return {
    id: websiteId,
    slug: inserted.slug,
    name: inserted.name,
    status: draft.status,
    mediaCount: capture.media.length,
    previewImageUrl: mediaUrl(capture.media.find((m) => m.kind === "desktop_shot")?.storagePath) ?? undefined,
  };
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function uniqueSlug(
  db: ReturnType<typeof createAdminClient>,
  base: string,
): Promise<string> {
  const root = base || "site";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const { data } = await db.from("websites").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now()}`;
}

function toTags(labels: string[], kind: TagKind) {
  return labels
    .map((label) => ({ slug: slugify(label), label: label.trim(), kind }))
    .filter((tag) => tag.slug && tag.label);
}

async function linkTags(
  db: ReturnType<typeof createAdminClient>,
  websiteId: string,
  tags: { slug: string; label: string; kind: TagKind }[],
): Promise<void> {
  if (!tags.length) return;
  await db.from("tags").upsert(tags, { onConflict: "slug" });
  await db.from("website_tags").insert(tags.map((tag) => ({ website_id: websiteId, tag_slug: tag.slug })));
}
