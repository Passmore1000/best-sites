# BestSites.io

The largest curated database of exceptional small-business websites. Visitors discover
website inspiration by industry and section. The platform is built around one principle:
**one URL creates a draft inspiration listing** — an admin pastes a URL, the system
captures screenshots, saves the live link, fetches metadata, and a Draft appears for
categorization and publishing.

This repo is the **foundation**: a working app, data model, public SEO site, and admin
shell. The capture + AI steps are wired as typed interfaces with stubs (metadata
extraction is real) so they can be filled in without re-architecting.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript), **Tailwind CSS v4**
- **Supabase** — Postgres (data), Storage (screenshots/videos), Auth (admin)
- **Playwright** for capture (runs in the worker, not on Vercel serverless)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

### 1. Configure environment (`.env.local`)

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | same page (server-only, never expose) |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `ADMIN_EMAILS` | comma-separated emails allowed into `/admin` |
| `NEXT_PUBLIC_SITE_URL` | public base URL (for sitemap/canonical) |

The site renders before Supabase is configured — pages just show empty states.

### 2. Set up the database

Apply the migration and (optionally) the sample data via the Supabase SQL editor or CLI:

```bash
# CLI (after `supabase link`):
supabase db push                              # runs supabase/migrations/*.sql
psql "$DATABASE_URL" -f supabase/seed.sql     # sample listings (or paste into SQL editor)
```

The migration creates the `websites`, `media`, `tags`, `website_tags`, `similar_sites`
tables, RLS policies (public can read only published rows), and the `website-media`
Storage bucket.

### 3. Create an admin user

In Supabase → Authentication → Users, add a user whose email is in `ADMIN_EMAILS`, then
sign in at `/admin/login`.

## How it works

### Public site
- `/` homepage, `/browse` (filter by industry/section/style/tech)
- `/sites/[slug]` detail (screenshots, metadata, live link, sections, similar sites)
- `/[industry]-websites` and `/[section]-sections` collection pages — registry in
  [`lib/collections.ts`](lib/collections.ts). Public pages use a cookieless client so
  they're statically rendered / ISR-cached.

### Admin (`/admin`, gated by [`proxy.ts`](proxy.ts) + email allowlist)
- `/admin/new` — paste a URL → job queued → worker captures → Draft created
- `/admin/[id]` — review/edit industry, sections, styles and metadata, then Publish

Run the capture worker locally (or on a container) while using the admin:

```bash
pnpm worker    # polls for queued jobs
pnpm dev       # in another terminal
```

Or capture a single URL from the CLI without the queue:

```bash
pnpm pipeline https://example.com
```

### The pipeline ([`pipeline/`](pipeline/))
`generateListing(url)` captures the site and inserts a Draft:

| Step | Module | Status |
| --- | --- | --- |
| Capture (desktop/mobile/full-page screenshots → Storage) | `capture.ts` | **real** |
| Metadata (title/desc/favicon/OG/tech) | `metadata.ts` | **real** |
| Draft assembly + persist | `index.ts` | **real** |

AI analysis, scoring and embeddings are intentionally not part of the current product
surface. The old modules remain in the repo for a later phase.

Run the full pipeline from the CLI (this is where Playwright capture will live):

```bash
pnpm pipeline https://example.com   # sync, bypasses queue
pnpm worker                         # process jobs from /admin/new
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm pipeline <url>` | Capture one URL immediately (CLI) |
| `pnpm worker` | Poll the job queue and run captures |

## Deploying

Deploy the Next.js app to **Vercel**. Set the same env vars in the project settings.
The Playwright capture step runs in the **pipeline worker** (`pnpm worker`) on a
long-running host (container, Railway, Fly, or locally) — not on Vercel serverless.
Admin `/api/generate` only enqueues jobs; the worker claims and processes them.

Apply migration `0003_pipeline_jobs.sql` before using the queue.

## Next steps

1. Add bulk URL import (enqueue many jobs at once).
2. Add richer section capture/manual crops when the library grows.
3. Surface scores/analysis on public detail pages (seed data shows the target UX).
4. Add optional AI analysis/scoring later, only if it helps curation.
