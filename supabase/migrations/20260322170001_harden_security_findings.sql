-- Explicitly pin search_path for trigger functions to avoid role-mutable search_path.
alter function public.set_ai_instructions_updated_at()
set search_path = public;

alter function public.set_reports_updated_at()
set search_path = public;

alter function public.set_report_jobs_updated_at()
set search_path = public;

-- Replace permissive UPDATE policy with an explicit authenticated predicate.
drop policy if exists "Authenticated users can update ai instructions"
on public.ai_instructions;

create policy "Authenticated users can update ai instructions"
on public.ai_instructions
for update
to authenticated
using (
  auth.uid() is not null
  and id = 1
)
with check (
  auth.uid() is not null
  and id = 1
);
