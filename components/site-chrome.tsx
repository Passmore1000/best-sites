"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { COLLECTIONS } from "@/lib/collections";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const industries = COLLECTIONS.filter((c) => c.kind === "industry");
  const sections = COLLECTIONS.filter((c) => c.kind === "section");
  const styles = COLLECTIONS.filter((c) => c.kind === "style");

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get("q") ?? "").trim();
    submitSearch(query);
  }

  function submitSearch(query: string) {
    router.push(query ? `/browse?q=${encodeURIComponent(query)}` : "/browse");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <Link href="/" className="text-lg font-black tracking-tight">
            BestSites
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
            <Link href="/" className="rounded-full px-3 py-2 hover:bg-muted">Latest</Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Categories
            </button>
          </nav>
        </div>

        <form onSubmit={onSearch} className="hidden w-full max-w-xl items-center gap-2 rounded-full bg-muted px-4 sm:flex">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            name="q"
            type="search"
            placeholder="Search websites, industries, sections..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitSearch(event.currentTarget.value.trim());
              }
            }}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="sr-only">Search</button>
        </form>

        <div className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Filter
          </button>
        </div>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-border bg-background shadow-sm">
          <div className="mx-auto max-w-[1800px] px-5 py-8 sm:px-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <form onSubmit={onSearch} className="flex h-12 w-full max-w-2xl items-center gap-3 rounded-full bg-muted px-5">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  name="q"
                  autoFocus
                  type="search"
                  placeholder="Search inspiration..."
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitSearch(event.currentTarget.value.trim());
                    }
                  }}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="sr-only">Search</button>
              </form>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Close categories"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <CategoryColumn title="Industries" items={industries} onSelect={() => setOpen(false)} />
              <CategoryColumn title="Sections" items={sections} onSelect={() => setOpen(false)} />
              <CategoryColumn title="Styles" items={styles} onSelect={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <span className="font-semibold text-foreground">BestSites</span> · Small-business website inspiration
        </div>
        <div className="flex gap-4">
          <Link href="/browse" className="hover:text-foreground">Browse</Link>
          <Link href="/hero-sections" className="hover:text-foreground">Sections</Link>
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
        </div>
      </div>
    </footer>
  );
}

function CategoryColumn({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: { slug: string; label: string }[];
  onSelect: () => void;
}) {
  return (
    <div>
      <div className="mb-3 text-sm font-medium text-muted-foreground">{title}</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${item.slug}`}
              onClick={onSelect}
              className="block rounded-md py-1 text-2xl font-semibold tracking-tight hover:text-muted-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
