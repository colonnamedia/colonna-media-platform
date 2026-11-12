-- Apply before deploying the corresponding website code. Existing inquiries remain valid.
alter table public.crm_inquiries
  add column if not exists attribution jsonb not null default '{}'::jsonb;

create index if not exists crm_inquiries_attribution_campaign
  on public.crm_inquiries ((attribution->>'utm_campaign'));

-- crm_inquiries already has RLS enabled and is accessed only through the
-- server's service-role client after owner authentication.
