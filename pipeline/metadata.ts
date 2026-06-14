import { domainFromUrl } from "@/lib/utils";
import type { MetadataResult } from "./types";

/**
 * Step 4 — Metadata extraction. REAL implementation: fetches the page HTML and parses
 * title, meta description, favicon, Open Graph image, plus a best-effort tech guess.
 * No browser required, so this runs anywhere (including serverless).
 */
export async function extractMetadata(url: string): Promise<MetadataResult> {
  const domain = domainFromUrl(url);
  const result: MetadataResult = { domain, techStack: [] };

  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "BestSitesBot/1.0 (+https://bestsites.io)" },
      redirect: "follow",
    });
    result.hosting = inferHosting(res.headers);
    html = await res.text();
  } catch {
    // Site unreachable — return what we have (domain); the admin can fill the rest.
    return result;
  }

  result.title = matchTag(html, /<title[^>]*>([^<]*)<\/title>/i);
  result.description =
    meta(html, "description") ?? meta(html, "og:description", "property");
  result.ogImageUrl = absolutize(meta(html, "og:image", "property"), url);
  result.faviconUrl = findFavicon(html, url);

  const tech = inferTech(html);
  result.techStack = tech.stack;
  result.cms = tech.cms;

  return result;
}

function matchTag(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1]?.trim() || undefined;
}

function meta(html: string, name: string, attr: "name" | "property" = "name"): string | undefined {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const m = html.match(re);
  return m?.[1]?.trim() || undefined;
}

function findFavicon(html: string, base: string): string | undefined {
  const m = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i);
  const href = m?.[1];
  return href ? absolutize(href, base) : absolutize("/favicon.ico", base);
}

function absolutize(href: string | undefined, base: string): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}

function inferHosting(headers: Headers): string | undefined {
  const server = headers.get("server")?.toLowerCase() ?? "";
  if (headers.get("x-vercel-id")) return "Vercel";
  if (server.includes("cloudflare")) return "Cloudflare";
  if (headers.get("x-nf-request-id")) return "Netlify";
  if (server.includes("github")) return "GitHub Pages";
  return undefined;
}

function inferTech(html: string): { stack: string[]; cms?: string } {
  const stack = new Set<string>();
  let cms: string | undefined;
  const has = (s: string) => html.toLowerCase().includes(s);

  if (has("wp-content") || has('name="generator" content="wordpress')) {
    cms = "WordPress";
    stack.add("WordPress");
  }
  if (has("cdn.shopify") || has("shopify")) {
    cms = cms ?? "Shopify";
    stack.add("Shopify");
  }
  if (has("squarespace")) {
    cms = cms ?? "Squarespace";
    stack.add("Squarespace");
  }
  if (has("wix.com") || has("_wix")) {
    cms = cms ?? "Wix";
    stack.add("Wix");
  }
  if (has(".webflow.io") || has("webflow")) {
    cms = cms ?? "Webflow";
    stack.add("Webflow");
  }
  if (has("framerusercontent") || has("framer.com")) {
    cms = cms ?? "Framer";
    stack.add("Framer");
  }
  if (has("/_next/")) stack.add("Next.js");
  if (has("__nuxt")) stack.add("Nuxt");
  if (has("data-astro")) stack.add("Astro");

  return { stack: [...stack], cms };
}
