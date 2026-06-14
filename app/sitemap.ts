import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/collections";
import { publishedWebsites } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sites = await publishedWebsites();

  const staticRoutes = ["", "/browse", "/contact"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const collectionRoutes = COLLECTIONS.map((c) => ({
    url: `${base}/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const siteRoutes = sites.map((s) => ({
    url: `${base}/sites/${s.slug}`,
    lastModified: s.updated_at,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...collectionRoutes, ...siteRoutes];
}
