-- Dedicated public display assets only. CRM documents retain their private bucket.
-- No anonymous or signed-in write policies are added. Uploads go through owner+AAL2 API.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('crm-link-media','crm-link-media',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
commit;
