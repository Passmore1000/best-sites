import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EditForm } from "@/components/admin/edit-form";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient, mediaUrl } from "@/lib/supabase/admin";
import { getWebsiteByIdAdmin } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ReviewPage({ params }: { params: Params }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const site = await getWebsiteByIdAdmin(createAdminClient(), id);
  if (!site) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Listings</Link>
          <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
          <Badge>{site.status}</Badge>
        </div>
        {site.status === "published" && (
          <Link href={`/sites/${site.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
            View public page ↗
          </Link>
        )}
      </div>

      {site.media.length > 0 && (
        <div className="mb-6 flex gap-3 overflow-x-auto">
          {site.media.map((m) => {
            const url = mediaUrl(m.storage_path);
            return url ? (
              <div key={m.id} className="shrink-0">
                <img src={url} alt={m.kind} className="h-32 w-auto rounded-lg border border-border" />
                <div className="mt-1 text-center text-xs text-muted-foreground">{m.kind}</div>
              </div>
            ) : null;
          })}
        </div>
      )}

      <EditForm site={site} />
    </div>
  );
}
