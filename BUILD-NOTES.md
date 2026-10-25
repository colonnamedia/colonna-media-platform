# Current site maintenance — October 25, 2026

The root static HTML pages, assets/styles.css, and assets/app.js are the active website. The src/ React pages and build.py are legacy material; do not run build.py to regenerate the active pages.

## Build
Run npm run build. The first step regenerates the client collection from assets/clients.json; Vite then builds all public pages, including /clients and /contact.

## Services and inquiries
- Homepage and /services: app-style service icons link to /contact?service=ID.
- /contact supports multiple services. IDs and labels are defined in assets/app.js form markup and api/send-email.js.
- Contact form submits to /api/send-email, which uses the existing RESEND_API_KEY configuration.
- Keep website as the hidden honeypot; website_url is the visitor's real website.
- Never put visitor names, email addresses, or messages in analytics events.
- Calendly has been removed from the active HTML and scripts.

## Clients
Edit assets/clients.json. Each record has name, image, and optional logo (null until an approved logo is provided).
Use HTTPS images or local assets/ paths. Do not invent logos, testimonials, or results.
Run npm run build (or node scripts/render-clients.mjs) to update the crawlable client page.
The eight initial entries come from the pre-existing client list. Add new client entries and approved logos as supplied by Anthony.

## SEO
Keep page-specific titles, descriptions, canonical URLs, visible local copy, and sitemap.xml/public/sitemap.xml aligned.
On-site service is approximately 50 miles around Pittsburgh. No rankings or indexing are guaranteed.
