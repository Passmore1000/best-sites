import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  MediaKind,
  WebsiteRow,
  WebsiteWithRelations,
} from "@/lib/types";

export type Client = SupabaseClient<Database>;

const RELATIONS = "*, media(*), website_tags(tag:tags(*))";

// Supabase returns the nested join as `website_tags: [{ tag: {...} }]`; flatten to `tags`.
type RawWebsite = WebsiteRow & {
  media?: WebsiteWithRelations["media"];
  website_tags?: { tag: WebsiteWithRelations["tags"][number] | null }[];
};

function flatten(raw: RawWebsite): WebsiteWithRelations {
  const { website_tags, ...rest } = raw;
  return {
    ...rest,
    media: raw.media ?? [],
    tags: (website_tags ?? []).map((wt) => wt.tag).filter((t): t is NonNullable<typeof t> => !!t),
  };
}

export function mediaOf(site: WebsiteWithRelations, kind: MediaKind) {
  return site.media.find((m) => m.kind === kind) ?? null;
}

/** All published websites, newest first, with media + tags. The browse page filters
 *  these in memory — fine at foundation scale; push filters into SQL when the catalog grows. */
export async function getPublishedWebsites(client: Client): Promise<WebsiteWithRelations[]> {
  const { data, error } = await client
    .from("websites")
    .select(RELATIONS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as RawWebsite[]).map(flatten);
}

export async function getWebsiteBySlug(
  client: Client,
  slug: string,
): Promise<WebsiteWithRelations | null> {
  const { data, error } = await client
    .from("websites")
    .select(RELATIONS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const site = flatten(data as unknown as RawWebsite);

  const { data: links } = await client
    .from("similar_sites")
    .select("related_id, relevance")
    .eq("website_id", site.id)
    .order("relevance", { ascending: false });

  const relatedIds = (links ?? []).map((l) => l.related_id);
  if (relatedIds.length) {
    const { data: related } = await client
      .from("websites")
      .select(RELATIONS)
      .in("id", relatedIds)
      .eq("status", "published");
    const byId = new Map(
      (related as unknown as RawWebsite[] | null ?? []).map((r) => [r.id, flatten(r)]),
    );
    site.similar = relatedIds.map((id) => byId.get(id)).filter((s): s is WebsiteWithRelations => !!s);
  } else {
    site.similar = [];
  }
  return site;
}

/** Distinct filter facets derived from published content. */
export interface FilterFacets {
  industries: string[];
  styles: { slug: string; label: string }[];
  sections: { slug: string; label: string }[];
  tech: string[];
}

export function deriveFacets(sites: WebsiteWithRelations[]): FilterFacets {
  const industries = new Set<string>();
  const styles = new Map<string, string>();
  const sections = new Map<string, string>();
  const tech = new Set<string>();
  for (const s of sites) {
    if (s.industry) industries.add(s.industry);
    for (const t of s.tags) {
      if (t.kind === "section") sections.set(t.slug, t.label);
      else styles.set(t.slug, t.label);
    }
    for (const tStack of s.tech_stack) tech.add(tStack);
  }
  const sorted = (m: Map<string, string>) =>
    [...m.entries()].map(([slug, label]) => ({ slug, label })).sort((a, b) => a.label.localeCompare(b.label));
  return {
    industries: [...industries].sort(),
    styles: sorted(styles),
    sections: sorted(sections),
    tech: [...tech].sort(),
  };
}

// ---------- admin (service-role client; sees drafts) ----------

export async function getAllWebsitesAdmin(client: Client): Promise<WebsiteWithRelations[]> {
  const { data, error } = await client
    .from("websites")
    .select(RELATIONS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as RawWebsite[]).map(flatten);
}

export async function getWebsiteByIdAdmin(
  client: Client,
  id: string,
): Promise<WebsiteWithRelations | null> {
  const { data, error } = await client
    .from("websites")
    .select(RELATIONS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? flatten(data as unknown as RawWebsite) : null;
}
