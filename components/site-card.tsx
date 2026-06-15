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
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <div className="aspect-[4/3]">
          {shot ? (
            <img
              src={shot}
              alt={site.name}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No screenshot yet
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="truncate text-sm font-medium text-background">{site.name}</p>
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} onSelect={onSiteSelect} />
      ))}
    </div>
  );
};
