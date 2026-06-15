"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COLLECTIONS } from "@/lib/collections";
import { cn } from "@/lib/utils";

const INDUSTRIES = COLLECTIONS.filter((c) => c.kind === "industry").map((c) => c.label);
const SECTIONS = COLLECTIONS.filter((c) => c.kind === "section").map((c) => c.label);
const STYLES = COLLECTIONS.filter((c) => c.kind === "style").map((c) => c.label);

type JobStatus = "pending" | "running" | "completed" | "failed";

type Result = {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "published";
  mediaCount: number;
  previewImageUrl?: string;
};

type ActiveJob = {
  id: string;
  status: JobStatus;
  error?: string | null;
  result?: Result | null;
};

const POLL_MS = 2_000;

export default function NewListingPage() {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [summary, setSummary] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (jobId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to check job status");

        const job: ActiveJob = {
          id: data.id,
          status: data.status,
          error: data.error,
          result: data.result,
        };
        setActiveJob(job);

        if (job.status === "completed" && job.result) {
          stopPolling();
          setLoading(false);
          setResult(job.result);
          setUrl("");
          setSummary("");
        } else if (job.status === "failed") {
          stopPolling();
          setLoading(false);
          setError(job.error ?? "Capture failed");
        }
      } catch (err) {
        stopPolling();
        setLoading(false);
        setError((err as Error).message);
      }
    }, POLL_MS);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveJob(null);
    stopPolling();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url,
          industry,
          summary,
          sections,
          styles,
          publish,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to capture site");

      if (data.status === "completed" && data.result) {
        setLoading(false);
        setActiveJob({ id: data.jobId, status: "completed", result: data.result });
        setResult(data.result);
        setUrl("");
        setSummary("");
        return;
      }

      setActiveJob({ id: data.jobId, status: data.status });
      startPolling(data.jobId);
    } catch (err) {
      setLoading(false);
      setError((err as Error).message);
    }
  }

  const jobLabel = activeJob
    ? activeJob.status === "pending"
      ? "Queued…"
      : activeJob.status === "running"
        ? "Capturing preview…"
        : activeJob.status === "completed"
          ? "Capture complete"
          : "Capture failed"
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add inspiration</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Paste a URL and we&apos;ll capture a real viewport screenshot of the hero,
          pull metadata, and create a draft listing.
        </p>

        <Card className="mt-6 p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <Field label="Website URL">
              <Input
                required
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Industry">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Choose industry</option>
                  {INDUSTRIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Publish state">
                <label className="flex h-10 items-center gap-3 rounded-lg border border-border bg-background px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={publish}
                    onChange={(e) => setPublish(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Publish immediately
                </label>
              </Field>
            </div>

            <Field label="Sections">
              <ChipPicker options={SECTIONS} value={sections} onChange={setSections} />
            </Field>

            <Field label="Styles">
              <ChipPicker options={STYLES} value={styles} onChange={setStyles} />
            </Field>

            <Field label="Short note">
              <Textarea
                placeholder="Optional note for why this reference is useful."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {jobLabel && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                {loading && activeJob?.status !== "failed" && (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
                )}
                <span>{jobLabel}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading || !url.trim()}>
                {loading
                  ? jobLabel ?? "Processing…"
                  : publish
                    ? "Queue & publish"
                    : "Queue capture"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Desktop, mobile, and full-page screenshots.
              </p>
            </div>
          </form>
        </Card>
      </div>

      <aside className="lg:pt-20">
        <Card className="overflow-hidden">
          {result?.previewImageUrl ? (
            <div className="bg-muted p-4">
              <img
                src={result.previewImageUrl}
                alt={`${result.name} screenshot preview`}
                className="rounded-lg border border-border bg-card"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-muted p-6 text-center text-sm text-muted-foreground">
              {loading
                ? "Capture in progress — preview appears when finished."
                : "Captured preview will appear here after submission."}
            </div>
          )}
          <div className="space-y-4 p-5">
            {result ? (
              <>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <h2 className="font-semibold">{result.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {result.mediaCount} screenshot{result.mediaCount === 1 ? "" : "s"} captured · {result.status}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/${result.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Review
                  </Link>
                  {result.status === "published" && (
                    <Link
                      href={`/sites/${result.slug}`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                    >
                      View public <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-semibold">Ready for curation</h2>
                <p className="text-sm text-muted-foreground">
                  Add industry and section tags before capture so the new reference lands in the
                  right places immediately.
                </p>
              </>
            )}
          </div>
        </Card>
      </aside>
    </div>
  );
}

function ChipPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() =>
              onChange(active ? value.filter((item) => item !== option) : [...value, option])
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={4}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
