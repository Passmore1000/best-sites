import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { jobStatusLabel, listRecentPipelineJobs } from "@/lib/jobs";
import { getAllWebsitesAdmin } from "@/lib/queries";
import type { PipelineJobRow, WebsiteWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  let sites: WebsiteWithRelations[] = [];
  let jobs: PipelineJobRow[] = [];
  let loadError: string | null = null;
  let jobsError: string | null = null;

  try {
    sites = await getAllWebsitesAdmin(createAdminClient());
  } catch (e) {
    loadError = (e as Error).message;
  }

  try {
    jobs = await listRecentPipelineJobs(8);
  } catch (e) {
    jobsError = (e as Error).message;
  }

  const drafts = sites.filter((s) => s.status === "draft");
  const published = sites.filter((s) => s.status === "published");
  const activeJobs = jobs.filter((job) => job.status === "pending" || job.status === "running");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
          <p className="text-sm text-muted-foreground">
            {drafts.length} draft{drafts.length === 1 ? "" : "s"} · {published.length} published
          </p>
        </div>
        <ButtonLink href="/admin/new">Add inspiration</ButtonLink>
      </div>

      {loadError && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load listings: {loadError}. Check your Supabase env vars and that the migration ran.
        </p>
      )}

      {jobsError && (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Capture queue unavailable: {jobsError}. Apply migration{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5">0003_pipeline_jobs.sql</code>.
        </p>
      )}

      {activeJobs.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Capture queue</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {activeJobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="truncate font-medium">{job.url}</div>
                  <div className="text-sm text-muted-foreground">{jobStatusLabel(job.status)}</div>
                </div>
                <Badge>{job.status}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            Captures now run immediately when you submit a URL.
          </p>
        </section>
      )}

      <Section title="Drafts" sites={drafts} empty="No drafts. Add a URL to get started." />
      <Section title="Published" sites={published} empty="Nothing published yet." />
    </div>
  );
}

function Section({
  title,
  sites,
  empty,
}: {
  title: string;
  sites: WebsiteWithRelations[];
  empty: string;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>
      {sites.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {sites.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/${s.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-muted">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{s.name}</span>
                    <Badge>{s.industry ?? "—"}</Badge>
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{s.url}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{s.status}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
