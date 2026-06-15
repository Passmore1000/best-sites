"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterDialog } from "@/components/filter-dialog";
import { SiteGrid } from "@/components/site-card";
import { SiteModal } from "@/components/site-modal";
import { SubscribeDialog } from "@/components/subscribe-dialog";
import {
  EMPTY_FILTERS,
  applyFilters,
  countActiveFilters,
  deriveFilterCatalog,
  type FilterSelection,
} from "@/lib/filters";
import type { WebsiteWithRelations } from "@/lib/types";

type HomeExplorerProps = {
  sites: WebsiteWithRelations[];
};

export const HomeExplorer = ({ sites }: HomeExplorerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filterOpen, setFilterOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterSelection>(EMPTY_FILTERS);
  const [selectedSite, setSelectedSite] = useState<WebsiteWithRelations | null>(null);

  const catalog = useMemo(() => deriveFilterCatalog(sites), [sites]);
  const filteredSites = useMemo(
    () => applyFilters(sites, appliedFilters),
    [sites, appliedFilters],
  );
  const activeFilterCount = countActiveFilters(appliedFilters);

  const openSite = (site: WebsiteWithRelations) => {
    setSelectedSite(site);
    const params = new URLSearchParams(searchParams.toString());
    params.set("site", site.slug);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const closeSite = () => {
    setSelectedSite(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("site");
    const next = params.toString();
    router.replace(next ? `/?${next}` : "/", { scroll: false });
  };

  useEffect(() => {
    const slug = searchParams.get("site");
    if (!slug) {
      setSelectedSite(null);
      return;
    }

    const site = sites.find((item) => item.slug === slug) ?? null;
    setSelectedSite(site);
  }, [searchParams, sites]);

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
            Web design inspiration, curated.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            Beautiful websites for designers who care about craft.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              Filter{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
            </button>
            <button
              type="button"
              onClick={() => setSubscribeOpen(true)}
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-8">
        <SiteGrid sites={filteredSites} onSiteSelect={openSite} />
      </section>

      <FilterDialog
        open={filterOpen}
        catalog={catalog}
        applied={appliedFilters}
        onClose={() => setFilterOpen(false)}
        onApply={setAppliedFilters}
      />
      <SiteModal site={selectedSite} onClose={closeSite} />
      <SubscribeDialog open={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </>
  );
};
