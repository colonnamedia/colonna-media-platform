# Attribution and social links review

Prepared against Colonna Media GitHub/Vercel, without changing production data or sending email.

## Active inquiry forms

| Public route | Stored form ID | Selected services | Script |
| --- | --- | --- | --- |
| `/contact` | `contact-inquiry` | Any of the eight service choices | `assets/app.js` |
| `/start` | `start-inquiry` | Any of the eight service choices | Inline submit handler with shared capture module |
| `/web-design-ads` | `web-design-inquiry` | `website` | `assets/ad-pages.js` |
| `/google-ads-management` | `google-ads-inquiry` | `google-ads` | `assets/ad-pages.js` |
| `/photography` | `photography-inquiry` | `photography`, plus project type | `assets/ad-pages.js` |

`/photography-ads` is a permanent redirect to `/photography`. The deployed redirect was checked and preserves campaign query parameters.

`/google-meta-ads-pittsburgh` is a service guide with no direct form. Its service CTA opens `/contact?service=google-ads&service=meta-ads`. `/social-media-management-pittsburgh` also has no direct form and opens `/contact?service=social-media`.

The website design, business photography, business videography, and marketing systems guides also route to Contact. The Google Ads launch offer routes to `/start?service=google-ads&offer=google-ads-launch#quote`. Other public pages load the shared attribution capture through the existing navigation script. These guides are not relabeled as advertising landing pages.

The legacy React Contact component is also instrumented for compatibility. It is not the live HTML `/contact` entry emitted by Vite.

## What is recorded

Each inquiry has a contact ID, submission UUID, submitting page, form ID, selected service IDs, project type, landing page, available external referrer, five UTM parameters, and click IDs (`gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `ttclid`, `li_fat_id`). The visitor's message remains its own field. The database links a repeated sender to the existing contact without changing profile notes, stage, source, or archive state.

A browser session stores the latest non-direct touch for up to 24 hours. Internal navigation preserves it. A new tagged entry or external referral starts a new touch. When session storage is blocked, only attribution available on the submitting page can be captured. Referrer privacy settings can also leave it unavailable. Referrer queries and fragments are omitted. A stable submission UUID prevents a retry from creating another inquiry. A later distinct submission gets its own record.

Capture is transactional. Contact and inquiry writes commit together or roll back together. Historical submissions are linked by matching email when possible. Existing messages and notes are not rewritten and missing campaigns or outcomes are not inferred.

## Reporting controls

The new Lead reporting tab filters by received-date range in Eastern time, page, service, source, campaign, and current/archived/all. CSV exports the filtered submissions with spreadsheet-formula protection. The report counts submissions at or beyond received/contacted/qualified/proposal/won stages. It retains recorded stage history when an inquiry is moved backward. Multi-service submissions can appear in more than one service group. These are inquiry cohorts, not a count of distinct contacts or revenue.

Stages are attached to individual inquiries. Contact profile stages are independent, so marking an existing contact won does not incorrectly credit every repeat inquiry as a new win. Source and campaign appear on inquiries, the contact table, and the profile's inquiry history. No visit-to-lead percentage is shown because no reliable visit dataset is connected.

## Social links

`/links` uses page-specific metadata, the existing Colonna Media logo, six service cards, a contact button, and editable Instagram/Facebook links. The protected Social links tab edits the introduction, card labels and destinations, order, thumbnail URLs and image descriptions, visibility, featured flags, and optional YouTube IDs. Video cards open YouTube instead of loading an unsolicited third-party video embed.

Saved content is stored separately in `crm_site_content`. Public reads return only the validated links configuration. Writes retain the existing owner UUID, confirmed email, AAL2, and origin checks. Version checks prevent one open editor from overwriting newer saved content. New tables and RPC functions are unavailable to anon and authenticated Data API roles.

## Review preview

The `/review` page is emitted only in a preview build. It uses clearly labeled synthetic examples and browser-local edits. It demonstrates the same LinksPage, LinksEditor, and AttributionReport components used by the real application. It does not bypass `/admin` authentication or use customer data. The regular `/admin` entry retains all current sign-in and two-factor verification.

Production still uses the current code and database until approved. No production migration has been applied. Preview deployments and the test runner disable all lead email delivery; the production confirmation templates are unchanged.

## Verification

Run `npm test` for the existing CRM tests and the new isolated PostgreSQL checks. The five actual form scripts are exercised through `/api/send-email` handling, transactional records, the protected CRM list response, and the real report rendering. Each form is tested with a database outage, visible error, successful retry, and its existing confirmation. Repeat/concurrent contacts, idempotency, rollback, stage history, archive visibility, CSV escaping, content version conflicts, unsafe links, owner/AAL1 rejection, and cross-origin mutations are covered. Outbound network calls are blocked and asserted absent. No emails are sent.

## Release after approval

1. Apply `database/crm-attribution-links.sql` to the dedicated Colonna Media CRM project, never CUZ Cards. The script is additive and transactional.
2. Promote the reviewed source to the production branch after reconciling any intervening commits.
3. Confirm protected admin access and public form/links rendering. Keep email delivery disabled for any unapproved test submissions. Existing production sender configuration and branded confirmation HTML remain as configured.
