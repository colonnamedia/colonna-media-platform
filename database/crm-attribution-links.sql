-- Review migration. Apply only to the dedicated Colonna Media CRM after approval.
-- Existing messages, owner notes, contact stages, and archives remain intact.
begin;
alter table public.crm_inquiries
 add column if not exists contact_id uuid references public.crm_contacts(id),
 add column if not exists submission_key uuid unique,
 add column if not exists submission_page text not null default '',
 add column if not exists form_id text not null default '',
 add column if not exists service_ids jsonb not null default '[]',
 add column if not exists project_type text not null default '',
 add column if not exists landing_page text not null default '',
 add column if not exists referrer text not null default '',
 add column if not exists utm_source text not null default '',
 add column if not exists utm_medium text not null default '',
 add column if not exists utm_campaign text not null default '',
 add column if not exists utm_content text not null default '',
 add column if not exists utm_term text not null default '',
 add column if not exists gclid text not null default '',
 add column if not exists gbraid text not null default '',
 add column if not exists wbraid text not null default '',
 add column if not exists fbclid text not null default '',
 add column if not exists msclkid text not null default '',
 add column if not exists ttclid text not null default '',
 add column if not exists li_fat_id text not null default '',
 add column if not exists attribution_version integer not null default 0,
 add column if not exists stage text not null default 'new' check(stage in ('new','contacted','qualified','proposal','won')),
 add column if not exists stage_history jsonb not null default '[]';
-- Associate historical submissions where an existing contact matches. Do not infer campaigns or sales outcomes.
update public.crm_inquiries i set contact_id=(select c.id from public.crm_contacts c where lower(c.email)=lower(trim(i.email)) order by c.created_at,c.id limit 1) where i.contact_id is null;
update public.crm_inquiries set submission_page=page where submission_page='' and page like '/%';
create index if not exists crm_inquiries_contact on public.crm_inquiries(contact_id,created_at);
create index if not exists crm_inquiries_campaign_date on public.crm_inquiries(utm_campaign,created_at);

create or replace function public.crm_capture_inquiry(payload jsonb,selected_services jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare contact uuid; saved uuid; prior public.crm_inquiries; email_key text;
begin
 email_key:=lower(trim(payload->>'email'));
 if email_key is null or email_key='' then raise exception 'Email is required'; end if;
 -- Serialize a sender's simultaneous requests, including legacy mixed-case contact emails.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(email_key,0));
 if nullif(payload->>'submission_key','') is not null then
   select * into prior from public.crm_inquiries where submission_key=(payload->>'submission_key')::uuid;
   if prior.id is not null then
     if lower(trim(prior.email))<>email_key then raise exception 'Submission key already used'; end if;
     return jsonb_build_object('id',prior.id,'contact_id',prior.contact_id,'duplicate',true);
   end if;
 end if;
 select id into contact from public.crm_contacts where lower(email)=email_key order by created_at,id limit 1;
 if contact is null then
   insert into public.crm_contacts(name,email,business,phone,website,kind,stage,services,source,notes)
   values(payload->>'name',email_key,coalesce(payload->>'business',''),coalesce(payload->>'phone',''),coalesce(payload->>'website_url',''),'lead','new',selected_services,
     'Website inquiry '||coalesce(payload->>'submission_page',''),'') returning id into contact;
 end if;
 insert into public.crm_inquiries(name,email,business,phone,services,location,website_url,timing,followup,message,page,contact_id,submission_key,submission_page,form_id,service_ids,project_type,landing_page,referrer,utm_source,utm_medium,utm_campaign,utm_content,utm_term,gclid,gbraid,wbraid,fbclid,msclkid,ttclid,li_fat_id,attribution_version)
 select name,email,business,phone,services,location,website_url,timing,followup,message,page,contact,submission_key,submission_page,form_id,selected_services,project_type,landing_page,referrer,utm_source,utm_medium,utm_campaign,utm_content,utm_term,gclid,gbraid,wbraid,fbclid,msclkid,ttclid,li_fat_id,attribution_version
 from jsonb_populate_record(null::public.crm_inquiries,payload)
 returning id into saved;
 return jsonb_build_object('id',saved,'contact_id',contact,'duplicate',false);
end $$;
revoke all on function public.crm_capture_inquiry(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.crm_capture_inquiry(jsonb,jsonb) to service_role;

create or replace function public.crm_set_inquiry_stage(inquiry_id uuid,next_stage text,owner_id text)
returns public.crm_inquiries language plpgsql security invoker set search_path='' as $$
declare result public.crm_inquiries;
begin
 if next_stage not in ('new','contacted','qualified','proposal','won') then raise exception 'Invalid stage'; end if;
 update public.crm_inquiries set stage=next_stage,stage_history=stage_history||jsonb_build_array(jsonb_build_object('stage',next_stage,'at',now())) where id=inquiry_id returning * into result;
 if result.id is null then raise exception 'Inquiry not found'; end if;
 insert into public.crm_events(entity,entity_id,event,actor,details) values('inquiry',inquiry_id,'stage_changed',owner_id,jsonb_build_object('stage',next_stage));
 return result;
end $$;
revoke all on function public.crm_set_inquiry_stage(uuid,text,text) from public,anon,authenticated;
grant execute on function public.crm_set_inquiry_stage(uuid,text,text) to service_role;

create table if not exists public.crm_site_content (
 key text primary key, id uuid not null default gen_random_uuid(),
 config jsonb not null, version integer not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.crm_site_content enable row level security;
revoke all on public.crm_site_content from anon,authenticated;
grant all on public.crm_site_content to service_role;
create or replace function public.crm_save_links(content jsonb,expected_version integer,owner_id text)
returns public.crm_site_content language plpgsql security invoker set search_path='' as $$
declare result public.crm_site_content;
begin
 insert into public.crm_site_content(key,config) select 'links',content where expected_version=0
 on conflict(key) do nothing returning * into result;
 if result.id is null then
  update public.crm_site_content set config=content,version=version+1,updated_at=now() where key='links' and version=expected_version returning * into result;
 end if;
 if result.id is null then raise exception 'Content changed. Reload before saving.' using errcode='40001'; end if;
 insert into public.crm_events(entity,entity_id,event,actor,details) values('links',result.id,'links_updated',owner_id,jsonb_build_object('version',result.version));
 return result;
end $$;
revoke all on function public.crm_save_links(jsonb,integer,text) from public,anon,authenticated;
grant execute on function public.crm_save_links(jsonb,integer,text) to service_role;
commit;
