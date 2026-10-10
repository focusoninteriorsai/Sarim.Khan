# Sarim Khan — Project Director · Portfolio

A complete, static, responsive personal portfolio for **Sarim Khan, Project Director** at
**FocusOn Interior Decorators Pvt. Ltd.** — plain HTML, CSS and a small amount of vanilla
JavaScript. No framework, no build step, no backend.

- **Theme:** blue · mid-yellow · white, Astra-inspired card-based layout
- **Fonts:** Plus Jakarta Sans (headings) and Inter (body), self-hosted in `assets/fonts/`
- **Speed:** no external requests, lazy-loaded images, transform/opacity-only animation,
  reduced-motion support

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
