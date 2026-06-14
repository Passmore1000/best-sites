-- BestSites.io initial schema
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- ---------- enums ----------
create type website_status as enum ('draft', 'published');
create type media_kind as enum (
  'desktop_shot', 'mobile_shot', 'fullpage_shot', 'desktop_video', 'mobile_video'
);
create type tag_kind as enum ('style', 'feature');

-- ---------- websites ----------
create table websites (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  url                 text not null,
  domain              text,
  industry            text,
  status              website_status not null default 'draft',
  summary             text,
  design_analysis     text,
  conversion_analysis text,
  why_it_works        text,
  what_could_improve  text,
  strengths           text[] not null default '{}',
  weaknesses          text[] not null default '{}',
  meta_title          text,
  meta_description    text,
  favicon_url         text,
  og_image_url        text,
  tech_stack          jsonb not null default '[]'::jsonb,
  cms                 text,
  hosting             text,
  -- { design, mobile, trust, conversion, performance, overall } : int 0-100
  scores              jsonb,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index websites_status_published_idx on websites (status, published_at desc);
create index websites_industry_idx on websites (industry);

-- ---------- media ----------
create table media (
  id           uuid primary key default gen_random_uuid(),
  website_id   uuid not null references websites (id) on delete cascade,
  kind         media_kind not null,
  storage_path text not null,
  width        int,
  height       int,
  created_at   timestamptz not null default now(),
  unique (website_id, kind)
);
create index media_website_idx on media (website_id);

-- ---------- tags ----------
create table tags (
  slug  text primary key,
  label text not null,
  kind  tag_kind not null default 'style'
);

create table website_tags (
  website_id uuid references websites (id) on delete cascade,
  tag_slug   text references tags (slug) on delete cascade,
  primary key (website_id, tag_slug)
);
create index website_tags_tag_idx on website_tags (tag_slug);

-- ---------- similar sites ----------
create table similar_sites (
  website_id uuid references websites (id) on delete cascade,
  related_id uuid references websites (id) on delete cascade,
  relevance  real not null default 0,
  primary key (website_id, related_id),
  check (website_id <> related_id)
);

-- ---------- updated_at trigger ----------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger websites_set_updated_at
  before update on websites
  for each row execute function set_updated_at();

-- ---------- row level security ----------
-- Anonymous/auth users may only read *published* content. All writes go through the
-- service-role key (which bypasses RLS), used by the pipeline and admin server code.
alter table websites      enable row level security;
alter table media         enable row level security;
alter table tags          enable row level security;
alter table website_tags  enable row level security;
alter table similar_sites enable row level security;

create policy "published websites are public"
  on websites for select using (status = 'published');

create policy "media of published websites is public"
  on media for select using (
    exists (select 1 from websites w where w.id = media.website_id and w.status = 'published')
  );

create policy "tags are public"
  on tags for select using (true);

create policy "website_tags of published websites are public"
  on website_tags for select using (
    exists (select 1 from websites w where w.id = website_tags.website_id and w.status = 'published')
  );

create policy "similar_sites of published websites are public"
  on similar_sites for select using (
    exists (select 1 from websites w where w.id = similar_sites.website_id and w.status = 'published')
  );

-- ---------- storage ----------
insert into storage.buckets (id, name, public)
values ('website-media', 'website-media', true)
on conflict (id) do nothing;
