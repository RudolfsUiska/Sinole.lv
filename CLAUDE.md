You are rewriting a Webflow-exported static HTML portfolio site (sinole.lv) 
into a modern, maintainable static site with a file-based CMS so that new 
project pages can be created without touching HTML.

---

## Current State

- Tech: Static HTML exported from Webflow, hosted on GitHub Pages
- 3 root pages: index.html, about.html, contact.html
- 8 project detail pages in /work/*.html (e.g. kalte-studio.html)
- Assets: /assets/ folder with JPG/PNG images
- Styling: Webflow's CSS framework (w-container, w-row, w-col-*, w-dyn-*)
- No templating, no CMS — all content is hardcoded HTML in Latvian language

Project pages follow this structure:
  - Title (h1)
  - Hero image
  - Rich text body (paragraphs, images, headings)
  - Image gallery (multiple figures)
  - Back link to homepage

Homepage has a project card grid: each card shows title, short description, 
cover image, and a link to the project detail page.

---

## Target Stack

Use **Astro** (astro.build) with:
- Content Collections (Astro's built-in CMS layer) for project pages
- Each project as a Markdown/MDX file in src/content/projects/
- Decap CMS (decapcms.org) mounted at /admin for a browser-based editor
  that commits Markdown files to Git — no backend needed, works with GitHub Pages

Hosting: GitHub Pages (keep existing CNAME: sinole.lv, keep /assets/ folder)

---

## Deliverables

### 1. Project Structure

src/
  content/
    projects/          ← one .md file per project
      kalte-studio.md
      sinoles-nama-svetki.md
      edmsinole.md
      ... (migrate all 8 existing work/*.html pages)
  pages/
    index.astro        ← homepage with project grid
    about.astro
    contact.astro
    work/
      [slug].astro     ← dynamic project detail page
    admin/
      index.html       ← Decap CMS entry point
      config.yml       ← Decap CMS config
  layouts/
    Base.astro         ← <html>, <head>, nav, footer
    ProjectLayout.astro
  components/
    ProjectCard.astro
    Nav.astro
    Footer.astro
  styles/
    global.css         ← clean, hand-written CSS replacing Webflow bloat

public/
  assets/              ← keep existing images as-is
  CNAME

astro.config.mjs
package.json

---

### 2. Markdown Frontmatter Schema

Each project file must have this frontmatter:

---
title: "Kalte Studio"
description: "Šī gada pasākums noraus jumtu!"
date: 2025-04-01
coverImage: "/assets/kalte-2025-afisa.jpg"
images:                  # gallery images (optional)
  - "/assets/kalte-1.jpg"
  - "/assets/kalte-2.jpg"
draft: false
---

Body: Markdown content (paragraphs, headings, embedded images)

---

### 3. Decap CMS Config (public/admin/config.yml)

backend:
  name: github
  repo: RudolfsUiska/Sinole.lv
  branch: main

media_folder: public/assets
public_folder: /assets

collections:
  - name: projects
    label: Projekti
    folder: src/content/projects
    create: true
    slug: "{{slug}}"
    fields:
      - { label: Nosaukums, name: title, widget: string }
      - { label: Apraksts, name: description, widget: text }
      - { label: Datums, name: date, widget: datetime }
      - { label: Vāka bilde, name: coverImage, widget: image }
      - { label: Galerija, name: images, widget: list, field: { widget: image } }
      - { label: Melnraksts, name: draft, widget: boolean, default: false }
      - { label: Saturs, name: body, widget: markdown }

---

### 4. Layout Requirements

Replace the Webflow CSS bloat with clean, readable CSS:

- Max content width: 1100px, centered
- Navigation: horizontal links, mobile hamburger menu
- Homepage grid: 2–3 column card grid, card = cover image + title + description + link
- Project detail page: full-width hero image, centered readable body (max 720px),
  image gallery below body in a 2-column grid
- Typography: keep Google Fonts Varela Round for headings, Roboto for body
- Color palette: match existing site (derive from current styles.css)
- Fully responsive (mobile-first)
- No Webflow classes or jQuery — vanilla CSS and Astro only

---

### 5. Content Migration

Migrate all 8 existing work/*.html pages into Markdown files.
Extract:
- Title from <h1>
- Description from first <p> or meta description
- Cover image from first <figure> or hero <img>
- Body content converted from HTML rich text to Markdown
- Gallery images from remaining <figure> tags

---

### 6. GitHub Pages Deployment

Add a GitHub Actions workflow at .github/workflows/deploy.yml that:
1. Runs `npm run build` (astro build)
2. Deploys the dist/ folder to GitHub Pages

Keep CNAME file so sinole.lv continues to work.

---

## Constraints

- Keep all existing image file paths intact (/assets/*)
- Site language is Latvian — do not translate any content
- Decap CMS admin must work without a separate backend (use GitHub OAuth via 
  Decap's GitHub backend — user logs in with their GitHub account)
- No Node.js server — output must be fully static files

---

## Definition of Done

1. `npm run dev` serves the site locally
2. All 8 existing projects render correctly at /work/[slug]
3. Homepage shows all projects as cards in a grid
4. Visiting /admin shows Decap CMS login and editor
5. Creating a new .md file in src/content/projects/ automatically creates a new 
   project page and adds the card to the homepage grid
6. GitHub Actions deploys successfully to GitHub Pages on push to main
