import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublishedWebsites, getWebsiteBySlug } from "@/lib/queries";
import type { WebsiteWithRelations } from "@/lib/types";

/**
 * Public-page data fetchers. They use the cookieless anon client so pages stay
 * statically renderable / ISR-cacheable, and they swallow configuration/connection
 * errors (returning empty results) so the site still renders before Supabase env vars
 * are set and degrades gracefully on a transient DB hiccup.
 */

export async function publishedWebsites(): Promise<WebsiteWithRelations[]> {
  try {
    return await getPublishedWebsites(createPublicClient());
  } catch (e) {
    console.error("[data] publishedWebsites failed:", (e as Error).message);
    return [];
  }
}

export async function websiteBySlug(slug: string): Promise<WebsiteWithRelations | null> {
  try {
    return await getWebsiteBySlug(createPublicClient(), slug);
  } catch (e) {
    console.error("[data] websiteBySlug failed:", (e as Error).message);
    return null;
  }
}
