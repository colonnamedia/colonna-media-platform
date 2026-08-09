# Colonna Media — Website

A complete, bright, consulting-focused website for Colonna Media. Plain HTML, CSS, and
JavaScript — no build step required to run it. Just open the files or drop the folder on a host.

## Before launch (important)
Set your real domain once at the top of `build.py` (`SITE = "https://www.colonnamedia.com"`) and run
`python3 build.py`. This updates canonical URLs, social share tags, the sitemap, and structured data.
Full SEO + deploy details are in **BUILD-NOTES.md**.

## Pages
- `index.html` — Home (hero, the 3 paths, the interactive consultation journey, services, Anthony, client, work, CTA)
- `services.html` — Detailed services + how-we-work process
- `built.html` — "What we've built": work gallery + the tools you've made
- `about.html` — Meet Anthony, the column story, values
- `contact.html` — Contact form + your live Calendly scheduler
- `404.html` — Friendly not-found page

## Shared files (edit once, changes everywhere)
- `assets/styles.css` — All styling + the color system (top of the file, under `:root`)
- `assets/app.js` — Nav, mobile menu, scroll animations, the consultation journey, Calendly, contact form
- `assets/img/` — Your photos (`anthony.jpg`, `maura.jpg`, `nyc.jpg`) + `favicon.svg`

## Brand colors (change in one place)
Open `assets/styles.css` and edit the variables at the very top:
```
--blue / --yellow / --pink / --green   (plus their -soft tints)
--ink        text color
--r-lg/md/sm rounded-corner sizes
```

## Calendly
Your scheduler (`calendly.com/colonnamedia/marketing-strategy`) is already wired in:
- **contact.html** shows the full inline calendar.
- Every "Book" button opens it as a popup.
To change the link, search both `assets/app.js` and `contact.html` for `calendly.com/colonnamedia`.

## Things to update when you're ready (placeholders)
- **Maura's quote** on Home + About — currently placeholder text (marked with a yellow note).
- **Stats** — "50+ businesses", the 5-star line — swap for real numbers.
- **Work gallery** on `built.html` still pulls images from your Base44 image URLs. Fine to keep,
  or download them into `assets/img/` and update the paths.
- **Email** is set to `colonnamedia@gmail.com` throughout.

## Deploy to Vercel
Since your domain is already on Vercel, the easiest path:
1. **New project:** at vercel.com click *Add New → Project*, then drag this folder in (or push it to a
   GitHub repo and import it). Vercel serves it as a static site automatically — `404.html` is used for
   not-found pages.
2. Point your domain at the new project under *Settings → Domains* (or replace the current project's
   output with these files).

No environment variables or build command needed — set the framework preset to **"Other"** and leave
the build command empty; output directory is the folder itself.

## Regenerating shared header/footer (optional)
`build.py` generates every page from one shared header/footer so the nav stays consistent. If you edit
the nav or footer, change it in `build.py` and run `python3 build.py`. If you only tweak page content or
styles, you can edit the `.html`/`.css` directly and ignore `build.py`.
