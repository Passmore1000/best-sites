"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { FilterFacets } from "@/lib/queries";

export function Filters({ facets }: { facets: FilterFacets }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const get = (key: string) => params.get(key) ?? "";
  const hasAny = ["industry", "section", "style", "tech"].some((k) => get(k));

  return (
    <div className="space-y-4 rounded-2xl bg-muted/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          label="Industry"
          value={get("industry")}
          onChange={(v) => setParam("industry", v)}
          options={[{ label: "All industries", value: "" }, ...facets.industries.map((i) => ({ label: i, value: i }))]}
        />
        <Select
          label="Technology"
          value={get("tech")}
          onChange={(v) => setParam("tech", v)}
          options={[{ label: "Any tech", value: "" }, ...facets.tech.map((t) => ({ label: t, value: t }))]}
        />
        {hasAny && (
          <button
            onClick={() => router.push(pathname, { scroll: false })}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-background hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {facets.styles.length > 0 && (
        <ChipRow
          options={facets.styles}
          active={get("style")}
          onToggle={(slug) => setParam("style", get("style") === slug ? null : slug)}
        />
      )}
      {facets.sections.length > 0 && (
        <ChipRow
          label="Sections"
          options={facets.sections}
          active={get("section")}
          onToggle={(slug) => setParam("section", get("section") === slug ? null : slug)}
        />
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full bg-background px-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 bg-transparent text-sm font-medium focus-visible:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChipRow({
  label,
  options,
  active,
  onToggle,
}: {
  label?: string;
  options: { slug: string; label: string }[];
  active: string;
  onToggle: (slug: string) => void;
}) {
  return (
    <div>
      {label && <div className="mb-2 px-1 text-sm font-medium text-muted-foreground">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.slug}
            onClick={() => onToggle(o.slug)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active === o.slug
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
