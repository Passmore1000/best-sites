"use client";

import { mediaOf } from "@/lib/queries";
import { mediaUrl } from "@/lib/supabase/admin";
import type { WebsiteWithRelations } from "@/lib/types";

type SiteCardProps = {
  site: WebsiteWithRelations;
  onSelect: (site: WebsiteWithRelations) => void;
};

export const SiteCard = ({ site, onSelect }: SiteCardProps) => {
  const shot = mediaUrl(mediaOf(site, "desktop_shot")?.storage_path);
  const subtitle = site.summary ?? site.domain ?? site.industry ?? "Website inspiration";

  const handleClick = () => onSelect(site);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(site);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group block w-full cursor-pointer text-left"
      aria-label={`View ${site.name}`}
    >
      <div className="flex aspect-[4/3] items-center justify-center rounded-[1.35rem] bg-[#efefef] p-5 transition-colors group-hover:bg-[#e9e9e9]">
        {shot ? (
          <img
            src={shot}
            alt={site.name}
            className="max-h-full max-w-full rounded-[0.65rem] border border-black/[0.08] object-contain shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform duration-500 group-hover:scale-[1.01]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[0.65rem] border border-dashed border-black/10 bg-white/60 text-sm text-muted-foreground">
            No screenshot yet
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-center gap-3 px-0.5">
        {site.favicon_url ? (
          <img
            src={site.favicon_url}
            alt=""
            className="h-9 w-9 shrink-0 rounded-[0.65rem] border border-black/[0.06] bg-white object-cover"
          />
        ) : (
          <div className="h-9 w-9 shrink-0 rounded-[0.65rem] border border-black/[0.06] bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight">{site.name}</p>
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </button>
  );
};

type SiteGridProps = {
  sites: WebsiteWithRelations[];
  onSiteSelect: (site: WebsiteWithRelations) => void;
};

export const SiteGrid = ({ sites, onSiteSelect }: SiteGridProps) => {
  if (sites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-8 py-24 text-center text-muted-foreground">
        No sites match this filter yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} onSelect={onSiteSelect} />
      ))}
    </div>
  );
};
