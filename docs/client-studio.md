# Colonna Media Client Studio

## Implementation status

Code is implemented on `feat/client-crm-agreements`; production is not connected yet. Source publication to the existing public GitHub repository was blocked by automatic approval review; no remote branch/PR was created. Owner approval is required before publishing this code publicly. Existing public website stays unchanged except an additional optional CRM write in the existing inquiry endpoint. Existing email and Sheet workflows are preserved. No client messages were sent during development.

The current Vercel project has only Sheet and Resend settings, with no CRM database. The connected Supabase organization (`colonnamedia's Org`, Free plan) contains CUZ Cards only. Provision a **separate Colonna Media project** after confirming organization and provisioning cost with Anthony. Do not reuse CUZ Cards.

## User requirements covered

- `/admin` private login, no navigation/footer link, excluded from indexing.
- Owner identity: **colonnamedia@gmail.com** (two n's), confirmed email plus pinned Supabase user UUID.
- Password login and mandatory Google Authenticator TOTP; first login enrolls the authenticator. Database requests require server-verified AAL2. Browser sessions are in memory, not persisted in local storage.
- Dashboard: active clients, active jobs, unsigned agreements, follow-ups due.
- Contacts: leads and clients, business/contact details, source, pipeline stage, services, notes, follow-up date, recorded marketing consent.
- Search/filter by name/business/email/notes, lead/client type, service, stage, active/inactive, follow-ups due. Export the filtered contacts to CSV with spreadsheet formula injection protection.
- Client profile with multiple jobs/services, agreements and recorded payments.
- Jobs: one-time/recurring, service/platform/account details in scope, start/end dates, planned/active/paused/completed/cancelled, monthly management fee.
- Clients stay active while at least one job is active and its start date has arrived. One-time auto-complete is optional and requires an end date; the displayed effective status becomes completed the following day in America/New_York. The underlying job record is preserved. Recurring jobs do not automatically close. Paused/completed/cancelled jobs do not make clients active. Signing alone never starts work or charges a card.
- Agreements: master terms plus selected service sections (website, social media, Google Ads, Meta Ads, photography, videography, consulting, automations), customizable per project. Reusable templates are editable in the admin.
- Client/job details, dates, scope, one-time total, monthly fee, payment phases, and explicit due milestones/service periods.
- Default 50% down before work / 50% balance on delivery. Editable percent and unlimited practical custom schedule up to 20 installments. Integer cents, exact sum validation. Recurring-only agreements may have $0 setup and no setup installments, provided monthly fee is positive. Recurring billing terms must be stated in wording.
- Preview complete agreement; save draft; explicit terms-reviewed checkbox and unresolved-placeholder gate before issuing a 30-day signing link.
- Unique high-entropy private signing link, token stored as SHA-256 hash, token in URL fragment rather than URL query. No analytics on signing/admin pages. Do not share private links publicly.
- Drawn finger/mouse signature, legal name, consent, server acceptance time, intended email, IP/browser metadata, agreement text fingerprint. Link possession is not independent email identity verification; no OTP email is sent.
- Final PDF stored in a private bucket; the same bytes are returned for client download. SHA-256 of the PDF is retained in proof. Signed rows cannot be updated/deleted; events are append-only. Atomic row-lock finalization prevents double signing. Token invalidated after signature; revoke unsigned requests.
- Agreement snapshot never follows future template/contact/job edits. Corrections require a new draft. Drafts are deliberately immutable too to keep revisions explicit.
- Agreement activity events, private owner-only PDF download, manual payment references. No cards stored or charged; no implied recurring card authorization.
- Existing website inquiries are also captured in the CRM after configuration. Original inquiries remain preserved; convert to a contact with duplicate-email detection. Historical Google Sheet leads are not auto-imported.
- Future email marketing supported by contact/consent fields and export. Sending is not enabled; Anthony must review full draft, recipients, and sending account and approve each specific message.

## Connection steps remaining

1. Confirm the Supabase organization with Anthony and check/confirm the new project cost. Organization Free plan is verified; a new project's quota/cost has not been confirmed. No new subscription has been purchased.
2. Create the dedicated project. Apply `database/crm-schema.sql` once through Supabase SQL/migration tooling. It creates contacts, jobs, agreements, events, payments, inquiries, and templates, plus a private PDF bucket. RLS enabled, no anon/authenticated table grants or policies; only the server secret has data access.
3. Disable public signup. Create the verified owner user without sending an email unless specifically approved. Anthony sets their own password through an approved secure account setup flow; don't paste credentials into chat, code, logs, or version control. Configure the pinned UUID only after verifying the account.
4. Set these **server-side Vercel environment variables** for Production and the intended Preview environment. Do not use VITE_ for secrets:
   - `CRM_SUPABASE_URL`
   - `CRM_SUPABASE_PUBLISHABLE_KEY`
   - `CRM_SUPABASE_SECRET_KEY` (secret/service-role key, server only)
   - `CRM_ADMIN_USER_ID` (verified owner UUID)
   - `CRM_PUBLIC_ORIGIN` (`https://www.colonnamedia.com` for production; exact preview origin for isolated preview testing)
5. Configure a development/preview origin explicitly; cross-origin mutations are denied. Vercel traces the bundled PDF font through `functions.api/sign.js.includeFiles`.
6. Run Supabase security advisors. Verify anon/AAL1 cannot read any CRM table or private PDF. Verify wrong user with AAL2 is denied.
7. Owner signs in and enrolls Google Authenticator. Verify a valid code is mandatory before any records load. Confirm authenticator backup/recovery with owner; no custom MFA bypass exists.
8. In an isolated environment, test the complete flow with disposable records: inquiry → contact → two jobs (one recurring) → custom agreement with phases → review → issue link → draw/sign → download → compare stored PDF hash → verify re-sign is rejected → check client status and recorded payment.
9. Review actual reusable legal wording before client use; supplied default wording contains deliberate prompts and cannot be issued as-is. Signature records do not guarantee dispute outcomes. For a dispute, retain payment authorization and service-delivery evidence as well.
10. Merge/deploy only after database provisioning, owner setup, and end-to-end verification. Until then keep PR draft. Setup state is fail-closed; no real CRM is available yet.

## Validation completed

- Production Vite build passed.
- Seven Node tests: cent-exact payment splits; phased schedules/mismatches; one-time/recurring activity; Eastern date boundary; wrong-owner, unconfirmed-email, missing-login and AAL1 denial; origin/token checks; unconfigured API fails closed.
- API/server module syntax checks passed.
- Generated a disposable multipage test PDF; extracted accented names, totals, installments, and acceptance record; visually inspected render. No client signature or actual agreement was used.
- Browser verified the admin setup page renders. Authenticated CRM UI and real database/signing flow remain unverified until database/account connection.

## Known bounds

- First version loads up to 5,000 records per collection; add server pagination before exceeding this.
- Auto-completion is an effective/read-time status calculation, not a scheduled destructive update.
- Incoming inquiry history is not deduplicated or deleted; repeat messages remain distinct evidence.
- No bulk email, invoices/charges, automatic receipts, signer OTP emails, automatic reminders, or payment-processor webhooks are enabled.
- This preserves agreement records and fingerprints; it is not a third-party certificate-based digital signature or independent timestamping service.
