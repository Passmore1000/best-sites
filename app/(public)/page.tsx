import Link from "next/link";
import { SiteGrid } from "@/components/site-card";
import { COLLECTIONS } from "@/lib/collections";
import { publishedWebsites } from "@/lib/data";

export const revalidate = 3600;

export default async function HomePage() {
  const sites = await publishedWebsites();
  const featured = sites.slice(0, 6);

  const industries = COLLECTIONS.filter((c) => c.kind === "industry");
  const sections = COLLECTIONS.filter((c) => c.kind === "section");

  return (
    <div className="mx-auto max-w-[1800px] px-5 py-8 sm:px-8">
      <section className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.75fr)]">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Latest inspiration</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Small-business website references, organized for fast browsing.
          </h1>
        </div>
        <div className="grid content-end gap-5 sm:grid-cols-2">
          <CollectionList title="Industries" items={industries.slice(0, 5)} />
          <CollectionList title="Sections" items={sections.slice(0, 6)} />
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="border-b-2 border-foreground pb-3">Latest</Link>
          <Link href="/hero-sections" className="pb-3 text-muted-foreground hover:text-foreground">Sections</Link>
          <Link href="/restaurant-websites" className="pb-3 text-muted-foreground hover:text-foreground">Industries</Link>
        </div>
        <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>

      <SiteGrid sites={featured} />
    </div>
  );
}

function CollectionList({
  title,
  items,
}: {
  title: string;
  items: { slug: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium hover:bg-border"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
