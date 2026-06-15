import type { WebsiteWithRelations } from "@/lib/types";

export type FilterDimension =
  | "types"
  | "styles"
  | "sections"
  | "tech"
  | "platforms"
  | "hosting";

export type FilterTab = FilterDimension;

export type FilterOption = {
  value: string;
  label: string;
  count: number;
};

export type FilterCatalog = Record<FilterTab, FilterOption[]>;

export type FilterSelection = {
  query: string;
  types: string[];
  styles: string[];
  sections: string[];
  tech: string[];
  platforms: string[];
  hosting: string[];
};

export const EMPTY_FILTERS: FilterSelection = {
  query: "",
  types: [],
  styles: [],
  sections: [],
  tech: [],
  platforms: [],
  hosting: [],
};

export type QuickPill = {
  id: string;
  label: string;
  dimension: FilterDimension;
  value: string;
};

const QUICK_PILL_DEFS: QuickPill[] = [
  { id: "minimal", label: "Minimal", dimension: "styles", value: "minimal" },
  { id: "luxury", label: "Luxury", dimension: "styles", value: "luxury" },
  { id: "bold", label: "Bold", dimension: "styles", value: "bold" },
  { id: "premium", label: "Premium", dimension: "styles", value: "premium" },
  { id: "editorial", label: "Editorial", dimension: "styles", value: "editorial" },
  { id: "hero", label: "Hero", dimension: "sections", value: "hero" },
  { id: "gallery", label: "Gallery", dimension: "sections", value: "gallery" },
  { id: "booking", label: "Booking", dimension: "sections", value: "booking" },
  { id: "restaurant", label: "Food & Drink", dimension: "types", value: "Restaurant" },
  { id: "gym", label: "Sports", dimension: "types", value: "Gym" },
  { id: "builder", label: "Construction", dimension: "types", value: "Builder" },
  { id: "dentist", label: "Health", dimension: "types", value: "Dentist" },
];

export const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "types", label: "Types" },
  { id: "styles", label: "Styles" },
  { id: "sections", label: "Sections" },
  { id: "tech", label: "Tech" },
  { id: "platforms", label: "Platforms" },
  { id: "hosting", label: "Hosting" },
];

const bump = (map: Map<string, { label: string; count: number }>, value: string, label = value) => {
  const current = map.get(value);
  if (current) {
    current.count += 1;
    return;
  }
  map.set(value, { label, count: 1 });
};

export const deriveFilterCatalog = (sites: WebsiteWithRelations[]): FilterCatalog => {
  const types = new Map<string, { label: string; count: number }>();
  const styles = new Map<string, { label: string; count: number }>();
  const sections = new Map<string, { label: string; count: number }>();
  const tech = new Map<string, { label: string; count: number }>();
  const platforms = new Map<string, { label: string; count: number }>();
  const hosting = new Map<string, { label: string; count: number }>();

  for (const site of sites) {
    if (site.industry) bump(types, site.industry);

    for (const tag of site.tags) {
      if (tag.kind === "style") bump(styles, tag.slug, tag.label);
      if (tag.kind === "section") bump(sections, tag.slug, tag.label);
    }

    for (const item of site.tech_stack) bump(tech, item);
    if (site.cms) bump(platforms, site.cms);
    if (site.hosting) bump(hosting, site.hosting);
  }

  const toOptions = (map: Map<string, { label: string; count: number }>) =>
    [...map.entries()]
      .map(([value, { label, count }]) => ({ value, label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    types: toOptions(types),
    styles: toOptions(styles),
    sections: toOptions(sections),
    tech: toOptions(tech),
    platforms: toOptions(platforms),
    hosting: toOptions(hosting),
  };
};

export const deriveQuickPills = (catalog: FilterCatalog): QuickPill[] =>
  QUICK_PILL_DEFS.filter((pill) => {
    const options = catalog[pill.dimension];
    return options.some((option) => option.value === pill.value && option.count > 0);
  });

type FilterArrayKey = Exclude<keyof FilterSelection, "query">;

const dimensionKey = (dimension: FilterDimension): FilterArrayKey => dimension;

export const isFilterValueActive = (
  selection: FilterSelection,
  dimension: FilterDimension,
  value: string,
) => selection[dimensionKey(dimension)].includes(value);

export const toggleFilterValue = (
  selection: FilterSelection,
  dimension: FilterDimension,
  value: string,
): FilterSelection => {
  const key = dimensionKey(dimension);
  const current = selection[key];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return { ...selection, [key]: next };
};

export const isQuickPillActive = (selection: FilterSelection, pill: QuickPill) =>
  isFilterValueActive(selection, pill.dimension, pill.value);

export const toggleQuickPill = (selection: FilterSelection, pill: QuickPill) =>
  toggleFilterValue(selection, pill.dimension, pill.value);

export const countActiveFilters = (selection: FilterSelection) => {
  const groups =
    selection.types.length +
    selection.styles.length +
    selection.sections.length +
    selection.tech.length +
    selection.platforms.length +
    selection.hosting.length;

  return groups + (selection.query.trim() ? 1 : 0);
};

const matchesQuery = (site: WebsiteWithRelations, query: string) => {
  if (!query) return true;

  const haystack = [
    site.name,
    site.domain,
    site.industry,
    site.summary,
    site.cms,
    site.hosting,
    ...site.tags.map((tag) => tag.label),
    ...site.tech_stack,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
};

const matchesDimension = (values: string[], matches: boolean) =>
  values.length === 0 || matches;

export const applyFilters = (
  sites: WebsiteWithRelations[],
  selection: FilterSelection,
): WebsiteWithRelations[] => {
  const query = selection.query.trim().toLowerCase();

  return sites.filter((site) => {
    if (!matchesQuery(site, query)) return false;

    if (
      !matchesDimension(
        selection.types,
        !!site.industry && selection.types.includes(site.industry),
      )
    ) {
      return false;
    }

    if (
      !matchesDimension(
        selection.styles,
        site.tags.some((tag) => tag.kind === "style" && selection.styles.includes(tag.slug)),
      )
    ) {
      return false;
    }

    if (
      !matchesDimension(
        selection.sections,
        site.tags.some((tag) => tag.kind === "section" && selection.sections.includes(tag.slug)),
      )
    ) {
      return false;
    }

    if (
      !matchesDimension(
        selection.tech,
        site.tech_stack.some((item) => selection.tech.includes(item)),
      )
    ) {
      return false;
    }

    if (
      !matchesDimension(selection.platforms, !!site.cms && selection.platforms.includes(site.cms))
    ) {
      return false;
    }

    if (
      !matchesDimension(
        selection.hosting,
        !!site.hosting && selection.hosting.includes(site.hosting),
      )
    ) {
      return false;
    }

    return true;
  });
};
