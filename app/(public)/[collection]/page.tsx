import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { SiteGrid } from "@/components/site-card";
import { COLLECTIONS, getCollection, type Collection } from "@/lib/collections";
import { publishedWebsites } from "@/lib/data";
import type { WebsiteWithRelations } from "@/lib/types";

type Params = Promise<{ collection: string }>;

export const revalidate = 3600;

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { collection } = await params;
  const c = getCollection(collection);
  if (!c) return {};
  return { title: c.title, description: c.description };
}

function matches(site: WebsiteWithRelations, c: Collection): boolean {
  return c.filter.type === "industry"
    ? site.industry === c.filter.value
    : site.tags.some((t) => t.slug === c.filter.value);
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { collection } = await params;
  const c = getCollection(collection);
  if (!c) notFound();

  const all = await publishedWebsites();
  const sites = all.filter((s) => matches(s, c));
  const related = COLLECTIONS.filter((x) => x.kind === c.kind && x.slug !== c.slug);

  return (
    <div className="mx-auto max-w-[1800px] px-5 py-8 sm:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{c.title}</h1>
        <p className="mt-3 text-muted-foreground">{c.description}</p>
      </header>

      <SiteGrid sites={sites} />

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-semibold">
            More {c.kind === "industry" ? "industries" : c.kind === "section" ? "sections" : "styles"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <ButtonLink key={r.slug} href={`/${r.slug}`} variant="outline" size="sm">
                {r.label}
              </ButtonLink>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 border-t border-border py-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          Save your own {c.label.toLowerCase()} inspiration
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Add a URL in admin and BestSites will capture screenshots, metadata, and the live link.
        </p>
        <div className="mt-6">
          <ButtonLink href="/browse" size="lg">Browse all inspiration</ButtonLink>
        </div>
      </section>
    </div>
  );
}
