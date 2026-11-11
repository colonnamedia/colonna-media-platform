-- Apply to the dedicated Colonna Media CRM before deploying automatic lead capture.
-- Existing contact emails are already normalized by the CRM API.
create unique index if not exists crm_contacts_email_unique on public.crm_contacts (email);
