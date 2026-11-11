# Colonna Media Client Studio

## Implementation status

The CRM and signing pages are deployed at `/admin` and `/sign`. PR #6 was merged after Anthony approved publication to the existing public repository. The private production Supabase project is connected through server-only environment variables. The owner user exists; actual owner TOTP enrollment and a complete real signing flow still require verification. No client signing link or message was sent during development.

The dedicated Supabase project is `fkyhairzbnqiamviywis` (Colonna Media CRM), separate from CUZ Cards. Provisioning was quoted at $0/month on the organization Free plan. The seven CRM tables have RLS with no direct anonymous/authenticated policies, and agreement PDFs use a private storage bucket. The server pins the confirmed owner UUID and requires AAL2 for data operations.

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

## Operations and remaining checks

1. Public signup is disabled in Supabase Auth. Keep it disabled; the pinned owner ID and server checks independently deny other users CRM data.
2. The production Vercel variables are set. Do not use `VITE_` for secrets:
   - `CRM_SUPABASE_URL`
   - `CRM_SUPABASE_PUBLISHABLE_KEY`
   - `CRM_SUPABASE_SECRET_KEY` (secret/service-role key, server only)
   - `CRM_ADMIN_USER_ID` (verified owner UUID)
   - `CRM_PUBLIC_ORIGIN` (`https://www.colonnamedia.com` for production; exact preview origin for isolated preview testing)
3. Supabase Auth Site URL and redirect allowlist point to `https://www.colonnamedia.com/admin`; recovery links can set a new password on the deployed admin page. The older `localhost` links are obsolete.
4. Configure a separate preview environment before testing with production data. Cross-origin mutations are denied. Vercel bundles the PDF font for signing.
5. Security advisors showed no warnings/errors; direct anon/authenticated table reads failed. The signature finalization RPC was checked in a rolled-back SQL transaction for replay and signed-row mutation rejection. Owner login, TOTP enrollment, and real PDF download remain to verify.
6. Test the full flow with a clearly disposable agreement and user-approved test signature. Do not sign a binding client agreement on Anthony's behalf.
7. Review actual legal wording before client use; defaults contain deliberate prompts and cannot be issued as-is. Retain payment and delivery evidence for disputes.
8. The website thank-you HTML now mentions Instagram and Facebook. External auto-replies remain in test mode without `LEAD_AUTOREPLY_FROM`; do not enable sending without Anthony's review of full wording, recipients, and sending account.
9. Emma Gladstein is a quoted photography lead with a planned job and unconfirmed shoot date/location. The profile offers agreement creation, review, and signing-link generation. Do not issue a link until particulars and legal terms are reviewed.

## Validation completed

- Production Vite build passed.
- Seven Node tests: cent-exact payment splits; phased schedules/mismatches; one-time/recurring activity; Eastern date boundary; wrong-owner, unconfirmed-email, missing-login and AAL1 denial; origin/token checks; unconfigured API fails closed.
- API/server module syntax checks passed.
- Generated a disposable multipage test PDF; extracted accented names, totals, installments, and acceptance record; visually inspected render. No client signature or actual agreement was used.
- Browser verified the live owner login page and password-reset control. Authenticated CRM UI and a real end-to-end signature remain unverified until owner TOTP setup.

## Known bounds

- First version loads up to 5,000 records per collection; add server pagination before exceeding this.
- Auto-completion is an effective/read-time status calculation, not a scheduled destructive update.
- Incoming inquiry history is not deduplicated or deleted; repeat messages remain distinct evidence.
- No bulk email, invoices/charges, automatic receipts, signer OTP emails, automatic reminders, or payment-processor webhooks are enabled.
- This preserves agreement records and fingerprints; it is not a third-party certificate-based digital signature or independent timestamping service.
