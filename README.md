# Sarim Khan — Project Director · Portfolio

A complete, static, responsive personal portfolio for **Sarim Khan, Project Director** at
**FocusOn Interior Decorators Pvt. Ltd.** — plain HTML, CSS and a small amount of vanilla
JavaScript. No framework, no build step, no backend.

- **Theme:** refined navy · gold · white, editorial hero and responsive card-based layout
- **Fonts:** Plus Jakarta Sans (headings) and Inter (body), self-hosted in `assets/fonts/`
- **Contact:** **+91 90055 64240**; every call link, WhatsApp link and Person schema uses the same corrected number
- **Welcome:** a two-second, Apple “hello”-inspired SVG handwriting intro spelling **Sarim Khan**, shown only on the homepage (including first visits and refreshes)
- **Accessibility:** skip intro / Escape, reduced-motion bypass, keyboard-friendly mobile menu and no-JavaScript navigation
- **Speed:** no external runtime requests or dependencies, lazy-loaded images and lightweight animation

## Pages

| File | Content |
| --- | --- |
| `index.html` | Home: hero, career stats, featured engagements, about teaser, C.Q.E.T. standard, client marquee |
| `about.html` | Bio, toolkit, C.Q.E.T. operating standard, education, certifications |
| `experience.html` | Career timeline, company snapshot, turnover growth chart |
| `projects.html` | Filterable, searchable and sortable project grid (vertical, value, area) |
| `projects/<client>.html` | 26 case-study pages with narrative, scope, photography and prev/next navigation |
| `expertise.html` | 12 core competencies, technical toolkit, 7-stage delivery methodology |
| `clients.html` | Client roster by vertical with original brand logos, recognition, growth chart |
| `gallery.html` | Project photography, filterable by project, with lightbox |
| `media.html` | Official portraits (lightbox), profile links, press coverage |
| `contact.html` | Call, WhatsApp, email (click-to-copy), LinkedIn and location |
| `404.html` | Not-found page |

## Structure

```
index.html … contact.html, 404.html
projects/                 case-study pages (one per engagement)
assets/css/style.css      design system and responsive rules
assets/css/loader.css     handwritten intro styling and stroke animations
assets/js/loader.js       independent two-second intro and cleanup
assets/js/main.js         header, menu, reveal, counters, filters, lightbox, copy
assets/fonts/             self-hosted woff2 fonts
assets/images/            portraits, project photography, icons, OG image
assets/logos/             client brand logos
sitemap.xml, robots.txt   SEO
Sarim Photos/             original full-resolution source photos (not used by the site)
```

## Editing content

Each page is plain HTML. To change text, open the relevant `.html` file and edit it directly.
Project pages follow the same markup, so copy an existing file in `projects/` to add one, then
link it from `projects.html` and `index.html` (if featured) and add it to `sitemap.xml`.

## Contact and homepage intro

The current number is **+91 90055 64240**:

- Call: `tel:+919005564240`
- WhatsApp: `https://wa.me/919005564240`
- The homepage Person schema uses `+919005564240` as well.

Contact details live in the static HTML, so future number changes must include all root
pages and nested case studies. The regression checks below help catch missed links.

The welcome intro is loaded only by `index.html`; all other pages display immediately
without loading its CSS or JavaScript. On a normal homepage visit—including a first visit
or a refresh—`loader.js` runs at the start of the body. Its inline SVG draws the pen
strokes of “Sarim Khan” without downloading a handwriting font or image. The intro lasts
**2,000 ms total**, including a **260 ms fade-out**; it does not wait for `window.load`
or add another two-second delay after assets finish loading. Homepage reveals and
counters start when the intro releases the page, rather than animating behind it.

Visitors can skip with the button or Escape. Reduced-motion visitors go straight to
the content. Without JavaScript, the site and mobile navigation remain available.
The intro cleans up independently of `main.js` and on page hide, so browser history
navigation cannot restore a frozen overlay. No session-storage restriction is used:
a normal homepage load or reload shows the intro again.

## Checks

Static checks use only Python's standard library:

```bash
python3 -m unittest discover -s tests -v
node --check assets/js/loader.js
node --check assets/js/main.js
```

Optional browser checks cover real intro timing, all 36 pages, clipboard, mobile
keyboard navigation, reduced motion, script failure, filters, sorting and lightbox.
With the preview server running, install Playwright in the ignored scratch directory:

```bash
npm install --prefix .cache/browser-tools --no-audit --no-fund playwright
node .cache/browser-tools/node_modules/playwright/cli.js install chromium
NODE_PATH=.cache/browser-tools/node_modules node tests/browser.cjs
```

Set `PORTFOLIO_URL` to test a different server (default: `http://127.0.0.1:8080`).
Set `CHROMIUM_EXECUTABLE_PATH` if using an existing Chromium executable.
These test dependencies are optional; the deployed site still has no build step.

## Preview locally

The site uses relative paths, so it works from any folder.

```bash
python3 -m http.server 8080    # then open http://localhost:8080
```

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`.
3. The site is served at `https://roushan62.github.io/Sarim-Khan/`. The `.nojekyll` file makes
   GitHub Pages serve every file as-is.

No build step, server, or API key is required.

---

© 2026 Sarim Khan · Project Director, FocusOn Interior Decorators Pvt. Ltd.
