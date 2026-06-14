"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WebsiteWithRelations } from "@/lib/types";

type Status = { kind: "idle" | "saving" | "ok" | "error"; message?: string };

const csvToArray = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function EditForm({ site }: { site: WebsiteWithRelations }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const [form, setForm] = useState({
    name: site.name,
    slug: site.slug,
    url: site.url,
    industry: site.industry ?? "",
    summary: site.summary ?? "",
    meta_title: site.meta_title ?? "",
    meta_description: site.meta_description ?? "",
    tech_stack: site.tech_stack.join(", "),
    cms: site.cms ?? "",
    hosting: site.hosting ?? "",
    styles: site.tags.filter((t) => t.kind === "style" || t.kind === "feature").map((t) => t.label).join(", "),
    sections: site.tags.filter((t) => t.kind === "section").map((t) => t.label).join(", "),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(): Promise<boolean> {
    setStatus({ kind: "saving" });
    const body = {
      name: form.name,
      slug: form.slug,
      url: form.url,
      industry: form.industry || null,
      summary: form.summary || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      tech_stack: csvToArray(form.tech_stack),
      cms: form.cms || null,
      hosting: form.hosting || null,
      styles: csvToArray(form.styles),
      sections: csvToArray(form.sections),
    };
    const res = await fetch(`/api/admin/${site.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setStatus({ kind: "ok", message: "Saved" });
      router.refresh();
      return true;
    } else {
      const d = await res.json().catch(() => ({}));
      setStatus({ kind: "error", message: d.error ?? "Save failed" });
      return false;
    }
  }

  async function action(kind: "publish" | "unpublish" | "delete") {
    if (kind === "delete" && !confirm("Delete this listing permanently?")) return;
    setStatus({ kind: "saving" });
    const res = await fetch(`/api/admin/${site.id}`, {
      method: kind === "delete" ? "DELETE" : "POST",
      headers: { "content-type": "application/json" },
      body: kind === "delete" ? undefined : JSON.stringify({ action: kind }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setStatus({ kind: "error", message: d.error ?? "Action failed" });
      return;
    }
    if (kind === "delete") router.push("/admin");
    else router.refresh();
  }

  async function saveAndPublish() {
    const saved = await save();
    if (saved) await action("publish");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <Row><Field label="Name"><Input value={form.name} onChange={set("name")} /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={set("slug")} /></Field></Row>
        <Row><Field label="URL"><Input value={form.url} onChange={set("url")} /></Field>
          <Field label="Industry"><Input value={form.industry} onChange={set("industry")} /></Field></Row>
        <Field label="Short note"><Textarea value={form.summary} onChange={set("summary")} /></Field>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Inspiration categories</h2>
        <Row>
          <Field label="Sections (comma-separated)"><Input value={form.sections} onChange={set("sections")} /></Field>
          <Field label="Styles (comma-separated)"><Input value={form.styles} onChange={set("styles")} /></Field>
        </Row>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Metadata</h2>
        <Field label="Meta title"><Input value={form.meta_title} onChange={set("meta_title")} /></Field>
        <Field label="Meta description"><Textarea value={form.meta_description} onChange={set("meta_description")} /></Field>
        <Row>
          <Field label="Tech stack (comma-separated)"><Input value={form.tech_stack} onChange={set("tech_stack")} /></Field>
          <Field label="CMS"><Input value={form.cms} onChange={set("cms")} /></Field>
        </Row>
        <Field label="Hosting"><Input value={form.hosting} onChange={set("hosting")} /></Field>
      </Card>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-border bg-background/90 py-4 backdrop-blur">
        <Button onClick={save} disabled={status.kind === "saving"}>
          {status.kind === "saving" ? "Saving…" : "Save changes"}
        </Button>
        {site.status === "published" ? (
          <Button variant="outline" onClick={() => action("unpublish")}>Unpublish</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={saveAndPublish}>Save & publish</Button>
            <Button variant="outline" onClick={() => action("publish")}>Publish only</Button>
          </>
        )}
        <Button variant="ghost" onClick={() => action("delete")} className="text-red-600">Delete</Button>
        {status.message && (
          <span className={status.kind === "error" ? "text-sm text-red-600" : "text-sm text-emerald-600"}>
            {status.message}
          </span>
        )}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium capitalize">{label}</span>
      <div className="mt-1">{children}</div>
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
      rows={3}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
