-- Background jobs for the URL → listing capture pipeline.
-- The Next.js app enqueues jobs; a long-running worker claims and runs them.

create type pipeline_job_status as enum ('pending', 'running', 'completed', 'failed');

create table pipeline_jobs (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  status        pipeline_job_status not null default 'pending',
  -- { industry, summary, styles, sections, publish }
  options       jsonb not null default '{}'::jsonb,
  -- Outcome of generateListing() when status = completed
  result        jsonb,
  error         text,
  created_by    text,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index pipeline_jobs_status_created_idx on pipeline_jobs (status, created_at);

create trigger pipeline_jobs_set_updated_at
  before update on pipeline_jobs
  for each row execute function set_updated_at();

alter table pipeline_jobs enable row level security;
-- No public policies — service role only (same pattern as writes elsewhere).
