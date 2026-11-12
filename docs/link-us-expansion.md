# Link Us: mini website for Colonna Media

Built on the existing /links page and owner-protected CRM. This is a single-brand pilot, not a separate subscription platform.

## Current scope
- Admin sidebar: **Link Us**.
- Editable brand name, logo, cover image, eyebrow, headline, short description, contact button and destination.
- Light, Colonna blue, and midnight themes.
- Ordered compact links, image cards and full-width hero boxes. Each supports title, description, button text, destination, optional thumbnail, image shape, fit, focal point, featured badge and visibility.
- Up to 24 blocks and eight social profiles. Instagram, TikTok, YouTube, Threads, Facebook, LinkedIn, and custom labels. No fake account URLs; unused profiles remain hidden.
- URL preview retrieval: YouTube and TikTok oEmbed; Open Graph/Twitter image metadata for other public pages, including Instagram and Threads where accessible. Retrieval never executes third-party embed HTML. Login walls, rate limits or missing metadata produce a clear manual-image fallback.
- Optimized image uploads, plus direct image URLs. Public display media is separate from private CRM documents. Uploaded raster images are flattened/re-encoded in the browser; backend checks file signatures, type, size, owner identity, origin and AAL2.
- Optional click-to-load YouTube/TikTok iframe players built from validated IDs. No third-party player is loaded until the visitor clicks. Other social posts open their original URL.
- Live mobile preview, saved version protection, hidden drafts and save/error feedback.

## Preview and privacy
The /review route uses example.test leads and browser-only page edits. Its Fetch preview uses an explicitly labeled example response. The downloadable offline review embeds the site’s existing display images. It does not connect to customer records or send emails. The real /admin uses the existing owner login and two-factor verification.

## Release
The prior approved attribution release is e5f07dc9e57af46ab27be9df7f0a77ceb7ba7df7 and its additive CRM migration is applied. The Link Us expansion is reviewed separately before publishing.

For image uploads on production, apply database/crm-link-media.sql to the dedicated CRM project. This creates only the public display-media bucket; it does not modify private document storage or add public write policies. Then release the expansion branch. Existing saved page configurations are normalized with backward-compatible defaults; no content rewrite is required.

## Checks
The test suite covers legacy forms/attribution, private-network rejection and DNS-pinned preview requests, redirect revalidation, metadata parsing, provider fallback, rich-block persistence, image validation/upload, owner+AAL2 access, live editor changes, and public configuration output. No live customer or test emails are sent.

## Later possibilities
Multiple client mini-sites, templates, separate URLs or domains, deeper analytics, reusable Fireworks business-system packaging, and billing can be designed later. None are required by this pilot.
