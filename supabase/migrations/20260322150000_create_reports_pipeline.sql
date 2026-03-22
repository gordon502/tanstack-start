create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null check (char_length(trim(file_name)) > 0),
  status text not null default 'New' check (
    status in ('New', 'Processing', 'Done', 'FAILED')
  ),
  storage_bucket text not null default 'reports-input',
  storage_path text not null unique,
  mime_type text,
  file_size_bytes bigint check (
    file_size_bytes is null or file_size_bytes >= 0
  ),
  error_payload jsonb,
  processing_started_at timestamptz,
  processing_finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_user_created_idx
  on public.reports (user_id, created_at desc);
create index if not exists reports_status_idx
  on public.reports (status);

create table if not exists public.report_jobs (
  id bigint generated always as identity primary key,
  report_id uuid not null references public.reports (id) on delete cascade,
  job_type text not null check (job_type in ('set_processing', 'set_done')),
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'done', 'failed')
  ),
  run_at timestamptz not null default now(),
  attempt_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists report_jobs_pending_idx
  on public.report_jobs (status, run_at);
create index if not exists report_jobs_report_id_idx
  on public.report_jobs (report_id);

create or replace function public.set_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_report_jobs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row
execute function public.set_reports_updated_at();

drop trigger if exists report_jobs_set_updated_at on public.report_jobs;
create trigger report_jobs_set_updated_at
before update on public.report_jobs
for each row
execute function public.set_report_jobs_updated_at();

create or replace function public.enqueue_report_processing_job()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.report_jobs (report_id, job_type, run_at)
  values (new.id, 'set_processing', now() + interval '15 seconds');

  return new;
end;
$$;

drop trigger if exists reports_enqueue_processing_job on public.reports;
create trigger reports_enqueue_processing_job
after insert on public.reports
for each row
execute function public.enqueue_report_processing_job();

alter table public.reports enable row level security;
alter table public.report_jobs enable row level security;

drop policy if exists "Authenticated users can read own reports" on public.reports;
create policy "Authenticated users can read own reports"
on public.reports
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create own reports" on public.reports;
create policy "Authenticated users can create own reports"
on public.reports
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can update own reports" on public.reports;
create policy "Authenticated users can update own reports"
on public.reports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can delete own reports" on public.reports;
create policy "Authenticated users can delete own reports"
on public.reports
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reports-input',
  'reports-input',
  false,
  52428800,
  array[
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can upload own report files"
on storage.objects;
create policy "Authenticated users can upload own report files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'reports-input'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can read own report files"
on storage.objects;
create policy "Authenticated users can read own report files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'reports-input'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update own report files"
on storage.objects;
create policy "Authenticated users can update own report files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'reports-input'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'reports-input'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete own report files"
on storage.objects;
create policy "Authenticated users can delete own report files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'reports-input'
  and (storage.foldername(name))[1] = auth.uid()::text
);
