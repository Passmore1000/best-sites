/**
 * SEO collection registry.
 *
 * Each collection backs a route like `/restaurant-websites` or `/luxury-websites`.
 * `filter` tells the page how to query: industry collections match `websites.industry`,
 * style/section collections match a tag slug in `website_tags`.
 */
export type CollectionKind = "industry" | "style" | "section";

export interface Collection {
  /** Route segment, always ends in `-websites`, e.g. "restaurant-websites". */
  slug: string;
  kind: CollectionKind;
  /** Short label, e.g. "Restaurant". */
  label: string;
  /** H1 / <title>, e.g. "Best Restaurant Websites". */
  title: string;
  description: string;
  filter: { type: "industry"; value: string } | { type: "tag"; value: string };
}

const industry = (label: string, value: string): Collection => ({
  slug: `${label.toLowerCase().replace(/\s+/g, "-")}-websites`,
  kind: "industry",
  label,
  title: `Best ${label} Websites`,
  description: `Hand-picked, high-converting ${label.toLowerCase()} websites — see what great looks like and what makes them work.`,
  filter: { type: "industry", value },
});

const style = (label: string, value: string): Collection => ({
  slug: `${value}-websites`,
  kind: "style",
  label,
  title: `Best ${label} Websites`,
  description: `A curated gallery of ${label.toLowerCase()} small-business websites and the design decisions behind them.`,
  filter: { type: "tag", value },
});

const section = (label: string, value: string): Collection => ({
  slug: `${value}-sections`,
  kind: "section",
  label,
  title: `Best ${label} Sections`,
  description: `Website inspiration for ${label.toLowerCase()} sections across small-business websites.`,
  filter: { type: "tag", value },
});

export const COLLECTIONS: Collection[] = [
  // Industries
  industry("Builder", "Builder"),
  industry("Plumber", "Plumber"),
  industry("Dentist", "Dentist"),
  industry("Gym", "Gym"),
  industry("Restaurant", "Restaurant"),
  // Styles
  style("Minimal", "minimal"),
  style("Luxury", "luxury"),
  style("Premium", "premium"),
  // Sections
  section("Hero", "hero"),
  section("Services", "services"),
  section("Pricing", "pricing"),
  section("Gallery", "gallery"),
  section("Testimonials", "testimonials"),
  section("Booking", "booking"),
  section("Contact", "contact"),
  section("Menu", "menu"),
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function isCollectionSlug(slug: string): boolean {
  return (slug.endsWith("-websites") || slug.endsWith("-sections")) && getCollection(slug) !== undefined;
}
