-- Planned jobs may have no confirmed start date. Active jobs and jobs with end dates must.
alter table public.crm_jobs
  add constraint crm_jobs_active_start_required check (status <> 'active' or start_date <> ''),
  add constraint crm_jobs_end_requires_start check (end_date = '' or start_date <> '');
