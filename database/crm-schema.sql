-- Apply once to a NEW, dedicated Colonna Media Supabase project. Never CUZ Cards.
-- All CRM data is server-only. No anon/authenticated Data API access, including AAL1.
create extension if not exists pgcrypto with schema extensions;
create table public.crm_contacts (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),
 name text not null,email text not null,business text not null default '',phone text not null default '',website text not null default '',
 kind text not null check(kind in ('lead','client')),stage text not null,services jsonb not null default '[]',source text not null default '',notes text not null default '',follow_up text not null default '',marketing_consent boolean not null default false,archived_at timestamptz
);
create table public.crm_jobs (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),contact_id uuid not null references public.crm_contacts(id),
 title text not null,services jsonb not null,mode text not null check(mode in ('one-time','recurring')),status text not null check(status in ('planned','active','paused','completed','cancelled')),
 start_date text not null,end_date text not null default '',auto_close boolean not null default false,scope text not null default '',monthly_cents bigint not null default 0 check(monthly_cents>=0),
 check(end_date='' or end_date>=start_date),check(not auto_close or (mode='one-time' and end_date<>''))
);
create table public.crm_agreements (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),contact_id uuid not null references public.crm_contacts(id),job_id uuid not null references public.crm_jobs(id),
 title text not null,agreement_date text not null,total_cents bigint not null check(total_cents>=0),payments jsonb not null,terms text not null,terms_reviewed boolean not null default false,
 snapshot jsonb not null,snapshot_hash text not null default '',status text not null check(status in ('draft','issued','signed','revoked')),
 token_hash text unique,expires_at timestamptz,signed_at timestamptz,signer_name text,signature_png text,proof jsonb,pdf_path text
);
create table public.crm_events (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),entity text not null,entity_id uuid not null,event text not null,actor text not null,details jsonb not null default '{}'
);
create table public.crm_payments (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),contact_id uuid not null references public.crm_contacts(id),job_id uuid not null references public.crm_jobs(id),
 amount_cents bigint not null check(amount_cents>0),label text not null,reference text not null default '',paid_date text not null
);
create table public.crm_inquiries (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),name text not null,email text not null,business text not null default '',phone text not null default '',
 services text not null default '',location text not null default '',website_url text not null default '',timing text not null default '',followup text not null default '',message text not null default '',page text not null default '',archived_at timestamptz
);
create index crm_jobs_contact on public.crm_jobs(contact_id);
create index crm_agreements_contact on public.crm_agreements(contact_id);
create index crm_payments_job on public.crm_payments(job_id);
create index crm_events_entity on public.crm_events(entity_id,created_at);
create index crm_contacts_email on public.crm_contacts(email);
-- No client-side access policies: API authorizes verified owner UUID/email + AAL2.
alter table public.crm_contacts enable row level security;
alter table public.crm_jobs enable row level security;
alter table public.crm_agreements enable row level security;
alter table public.crm_events enable row level security;
alter table public.crm_payments enable row level security;
alter table public.crm_inquiries enable row level security;
revoke all on public.crm_contacts,public.crm_jobs,public.crm_agreements,public.crm_events,public.crm_payments,public.crm_inquiries from anon,authenticated;
grant all on public.crm_contacts,public.crm_jobs,public.crm_agreements,public.crm_events,public.crm_payments,public.crm_inquiries to service_role;
create function public.crm_guard_agreement() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='DELETE' then
  if old.status='signed' then raise exception 'Signed agreements cannot be deleted'; end if; return old;
 end if;
 if TG_OP='UPDATE' then
  if old.status='signed' then raise exception 'Signed agreements are immutable'; end if;
  if old.snapshot<>new.snapshot or old.terms<>new.terms or old.payments<>new.payments or old.total_cents<>new.total_cents or old.contact_id<>new.contact_id or old.job_id<>new.job_id or old.title<>new.title or old.agreement_date<>new.agreement_date then raise exception 'Create a new agreement revision'; end if;
 end if;
 new.snapshot_hash:=encode(extensions.digest(new.snapshot::text,'sha256'),'hex');return new;
end $$;
create trigger crm_agreement_guard before insert or update or delete on public.crm_agreements for each row execute function public.crm_guard_agreement();
create function public.crm_finalize_signature(agreement_id uuid,signing_token_hash text,signer_name text,signature_png text,proof jsonb,pdf text) returns void language plpgsql security invoker set search_path='' as $$
declare a public.crm_agreements;
begin
 select * into a from public.crm_agreements where id=agreement_id for update;
 if a.id is null or a.status<>'issued' or a.token_hash<>signing_token_hash or a.expires_at<=now() then raise exception 'Agreement unavailable'; end if;
 update public.crm_agreements set status='signed',signed_at=now(),signer_name=crm_finalize_signature.signer_name,signature_png=crm_finalize_signature.signature_png,proof=crm_finalize_signature.proof,pdf_path=pdf,token_hash=null where id=agreement_id;
 insert into public.crm_events(entity,entity_id,event,actor,details) values('agreement',agreement_id,'signed',signer_name,proof);
end $$;
revoke all on function public.crm_finalize_signature(uuid,text,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.crm_finalize_signature(uuid,text,text,text,jsonb,text) to service_role;
revoke all on function public.crm_guard_agreement() from public,anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('crm-agreements','crm-agreements',false,5242880,array['application/pdf']);
-- No storage policies for visitors. Server-only downloads check owner AAL2.

create table public.crm_templates (key text primary key,body text not null,updated_at timestamptz not null default now());
alter table public.crm_templates enable row level security;
revoke all on public.crm_templates from anon,authenticated;
grant all on public.crm_templates to service_role;

create function public.crm_guard_event() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Audit events are append-only'; end $$;
create trigger crm_event_guard before update or delete on public.crm_events for each row execute function public.crm_guard_event();
revoke all on function public.crm_guard_event() from public,anon,authenticated;
