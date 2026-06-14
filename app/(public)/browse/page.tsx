import type { Metadata } from "next";
import { Suspense } from "react";
import { Filters } from "@/components/filters";
import { SiteGrid } from "@/components/site-card";
import { deriveFacets } from "@/lib/queries";
import { publishedWebsites } from "@/lib/data";
import type { WebsiteWithRelations } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse small business website inspiration",
  description: "Filter saved website inspiration by industry, section, style and technology.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function filterSites(
  sites: WebsiteWithRelations[],
  sp: Record<string, string | string[] | undefined>,
): WebsiteWithRelations[] {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const industry = one("industry");
  const section = one("section");
  const style = one("style");
  const tech = one("tech");
  const query = one("q")?.toLowerCase().trim();

  return sites.filter((s) => {
    if (query) {
      const haystack = [
        s.name,
        s.domain,
        s.industry,
        s.summary,
        ...s.tags.map((t) => t.label),
        ...s.tech_stack,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (industry && s.industry !== industry) return false;
    if (section && !s.tags.some((t) => t.slug === section && t.kind === "section")) return false;
    if (style && !s.tags.some((t) => t.slug === style)) return false;
    if (tech && !s.tech_stack.includes(tech)) return false;
    return true;
  });
}

export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const all = await publishedWebsites();
  const facets = deriveFacets(all);
  const sites = filterSites(all, sp);

  return (
    <div className="mx-auto max-w-[1800px] px-5 py-8 sm:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Library</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Browse inspiration</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          {sites.length} of {all.length} saved {all.length === 1 ? "site" : "sites"}
        </p>
      </header>

      <div className="mb-8">
        <Suspense fallback={null}>
          <Filters facets={facets} />
        </Suspense>
      </div>

      <SiteGrid sites={sites} />
    </div>
  );
}
