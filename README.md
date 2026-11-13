# P&L Events — website

**Live: https://plevents.github.io/**

One-page catalog site for **P&L Events** (party rentals, New Jersey), based on the PL-Events-Catalog decks.
Plain HTML, CSS and JavaScript: no build step, no server, no database. It runs free on GitHub Pages.

## Files

| Path | What it is |
|---|---|
| `index.html` | All content: hero, collection, items, service, contact |
| `css/styles.css` | Styles. Colors and fonts follow the catalog (black, gold, Cambria-style serif) |
| `js/main.js` | Effects, photo viewer, and the quote list that sends to WhatsApp |
| `img/` | Photos (`.webp`, named by item code), `og.jpg` (link preview), `qr-whatsapp.svg` |
| `robots.txt`, `sitemap.xml` | Tell Google the page exists and may be indexed |

## How visitors ask for a quote

1. They tap **Add · Agregar** on the items they like.
2. **My list · Mi lista** opens their list. They add the event date, town and notes.
3. **Send on WhatsApp** opens WhatsApp to 862-318-3970 with the codes, date and town already written.

Nothing goes to a server. The list is kept only in the visitor's browser.

## Common changes

- **WhatsApp number**: `WA_NUMBER` in `js/main.js`, plus every `wa.me/…` link and `data-wa` value in `index.html`
  (search for `18623183970`). Make a new QR code for `https://wa.me/<number>`.
- **Add an item**: copy one `<article class="card" …>` block in the right category. Change `data-code`,
  `data-name`, `data-es`, the texts and the photo. Update the "N items · N artículos" line of that category.
- **Add or replace a photo**: save it as `.webp`, max 1200 px on the long side, about 100–200 KB
  (for example with squoosh.app). Put it in `img/` named by code, like `bd-05.webp`.
  More than one photo: `data-photos="bd-05-a bd-05-b"` on the photo button.

## Publish on GitHub Pages (free)

1. Create a public repository on GitHub, for example `pl-events`.
2. Upload the contents of this folder, with `index.html` at the top level.
3. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`, then **Save**.
4. After 1–2 minutes the site is live at `https://<github-user>.github.io/pl-events/`.
5. For the WhatsApp/Instagram link preview, set the full address in `index.html`:
   `og:image` → `https://<github-user>.github.io/pl-events/img/og.jpg` and `og:url` → the site address.

A free GitHub organization named after the business (for example `plevents-nj`) gives a cleaner address:
`https://plevents-nj.github.io/` (repository name must be `plevents-nj.github.io`).

## Get found on Google (free)

1. **Google Business Profile** (business.google.com): the most important step for a local business.
   It puts P&L Events on Google Maps and in "party rentals near me" results. Choose "service-area business",
   add New Jersey towns, both phones, the website and many photos.
2. **Google Search Console** (search.google.com/search-console): add `https://plevents.github.io/`,
   verify with the "HTML tag" method (paste the tag in the `<head>` of `index.html`), then submit `sitemap.xml`.
3. Put the website link in the Instagram bio and the WhatsApp Business profile.

## Own domain (optional, about $12 per year)

Buy a domain (for example `pleventsnj.com`), then in **Settings → Pages → Custom domain** enter it and
follow GitHub's DNS steps. HTTPS stays free. Then change every full address `https://plevents.github.io/`
in `index.html`, `robots.txt` and `sitemap.xml`.
