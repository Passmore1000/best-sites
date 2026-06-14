import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mediaOf } from "@/lib/queries";
import { mediaUrl } from "@/lib/supabase/admin";
import type { WebsiteWithRelations } from "@/lib/types";

export function SiteCard({ site }: { site: WebsiteWithRelations }) {
  const shot = mediaUrl(mediaOf(site, "desktop_shot")?.storage_path);
  const sections = site.tags.filter((tag) => tag.kind === "section");

  return (
    <Link
      href={`/sites/${site.slug}`}
      className="group block"
    >
      <div className="relative flex aspect-[1.08] items-center justify-center overflow-hidden rounded-[1.5rem] bg-muted p-6 transition-colors group-hover:bg-border/70">
        {shot ? (
          <img
            src={shot}
            alt={`${site.name} desktop screenshot`}
            className="max-h-full w-full rounded-lg border border-border bg-card object-contain shadow-sm transition-transform duration-300 group-hover:scale-[1.015]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">
            No screenshot yet
          </div>
        )}
      </div>
      <div className="flex gap-3 px-1 py-4">
        {site.favicon_url ? (
          <img src={site.favicon_url} alt="" className="mt-0.5 h-8 w-8 rounded-lg border border-border bg-card" />
        ) : (
          <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold">{site.name}</h3>
            {site.industry && (
              <span className="shrink-0 text-xs font-medium text-muted-foreground">{site.industry}</span>
            )}
          </div>
          {site.summary && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{site.summary}</p>
          )}
          {sections.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sections.slice(0, 3).map((tag) => (
                <Badge key={tag.slug}>{tag.label}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SiteGrid({ sites }: { sites: WebsiteWithRelations[] }) {
  if (sites.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        No websites match yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  );
}
