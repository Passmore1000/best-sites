import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScreenshotTabs, type Shot } from "@/components/screenshot-tabs";
import { SiteGrid } from "@/components/site-card";
import { mediaOf } from "@/lib/queries";
import { mediaUrl } from "@/lib/supabase/admin";
import { websiteBySlug } from "@/lib/data";

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const site = await websiteBySlug(slug);
  if (!site) return {};
  const title = `${site.name}${site.industry ? ` — ${site.industry} website` : ""}`;
  const og = mediaUrl(mediaOf(site, "desktop_shot")?.storage_path) ?? site.og_image_url ?? undefined;
  return {
    title,
    description: site.summary ?? site.meta_description ?? undefined,
    openGraph: { title, description: site.summary ?? undefined, images: og ? [og] : undefined },
  };
}

export default async function SiteDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const site = await websiteBySlug(slug);
  if (!site) notFound();

  const desktop = mediaUrl(mediaOf(site, "desktop_shot")?.storage_path);
  const shots: Shot[] = [];
  const pushShot = (kind: Parameters<typeof mediaOf>[1], label: string, narrow?: boolean) => {
    const url = mediaUrl(mediaOf(site, kind)?.storage_path);
    if (url) shots.push({ key: kind, label, url, narrow });
  };
  pushShot("desktop_shot", "Desktop");
  pushShot("mobile_shot", "Mobile", true);
  pushShot("fullpage_shot", "Full page");

  const desktopVideo = mediaUrl(mediaOf(site, "desktop_video")?.storage_path);
  const mobileVideo = mediaUrl(mediaOf(site, "mobile_video")?.storage_path);
  const sections = site.tags.filter((tag) => tag.kind === "section");
  const styles = site.tags.filter((tag) => tag.kind !== "section");

  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-muted">
          {desktop ? (
            <img src={desktop} alt={`${site.name} desktop screenshot`} className="h-auto w-full" />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center text-muted-foreground">
              No screenshot yet
            </div>
          )}
        </div>
        <aside className="lg:w-72 lg:shrink-0">
          <div className="flex items-center gap-3">
            {site.favicon_url && (
              <img src={site.favicon_url} alt="" className="h-8 w-8 rounded" />
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
              {site.domain && <p className="text-sm text-muted-foreground">{site.domain}</p>}
            </div>
          </div>
          {site.industry && <p className="mt-4 text-sm text-muted-foreground">{site.industry}</p>}
          {sections.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sections.map((t) => (
                <Badge key={t.slug}>{t.label}</Badge>
              ))}
            </div>
          )}
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Visit Website <ExternalLink className="h-4 w-4" />
          </a>
          {site.tech_stack.length > 0 && (
            <div className="mt-6 text-sm">
              <div className="font-medium">Built with</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {site.tech_stack.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Screenshots */}
      {shots.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Screenshots</h2>
          <ScreenshotTabs shots={shots} />
        </section>
      )}

      {/* Video walkthrough */}
      {(desktopVideo || mobileVideo) && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Video walkthrough</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {desktopVideo && <video src={desktopVideo} controls className="w-full rounded-xl border border-border" />}
            {mobileVideo && <video src={mobileVideo} controls className="mx-auto w-full max-w-[390px] rounded-xl border border-border" />}
          </div>
        </section>
      )}

      {(site.summary || sections.length > 0 || styles.length > 0) && (
        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Inspiration details</h2>
          {site.summary && <p className="text-muted-foreground">{site.summary}</p>}
          {sections.length > 0 && <TagGroup label="Sections" tags={sections} />}
          {styles.length > 0 && <TagGroup label="Styles" tags={styles} />}
        </section>
      )}

      {/* Similar */}
      {site.similar && site.similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold">Similar websites</h2>
          <SiteGrid sites={site.similar} />
        </section>
      )}

      {/* CTA */}
      <section className="mt-16 rounded-2xl border border-border bg-card p-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Keep browsing inspiration</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Explore more examples by industry, section, style, and technology.
        </p>
        <div className="mt-6">
          <ButtonLink href="/browse" size="lg">Browse all inspiration</ButtonLink>
        </div>
      </section>

      <div className="mt-10">
        <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to browse
        </Link>
      </div>
    </article>
  );
}

function TagGroup({
  label,
  tags,
}: {
  label: string;
  tags: { slug: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag.slug}>{tag.label}</Badge>
        ))}
      </div>
    </div>
  );
}
