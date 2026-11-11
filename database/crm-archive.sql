-- Apply to an existing Colonna Media CRM project. Archiving preserves history.
alter table public.crm_contacts add column if not exists archived_at timestamptz;
alter table public.crm_inquiries add column if not exists archived_at timestamptz;
create index if not exists crm_contacts_archive on public.crm_contacts(archived_at);
create index if not exists crm_inquiries_archive on public.crm_inquiries(archived_at);
