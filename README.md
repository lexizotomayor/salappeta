# Salåppeʼta — NMI pensions, explained

An independent, plain-language guide to the pensions of Northern Mariana retirees. It supplements, and never replaces, [nmisf.com](https://www.nmisf.com).

Built with [Eleventy](https://www.11ty.dev/) 3 (Nunjucks) and hosted on Netlify, with Netlify Forms for the newsletter and feedback forms.

## Run it

```bash
npm install
npm start          # dev server with live reload
npm run build      # production build into _site/
```

Node 20 or later is required (`.nvmrc` pins 22).

## Where things live

| Path | What |
|---|---|
| `src/_data/site.json` | Name, navigation sets, footer links, "last updated" date |
| `src/_data/fund.json` | Every number on *Will the money last?*, from the Milliman and Wilshire reports |
| `src/_data/fundView.js` | Turns `fund.json` into chart-ready values (no numbers typed into templates) |
| `src/_data/fundPage.json` | Copy for *Will the money last?* (answers, risks, GHLI timeline, contacts) |
| `src/_data/standing.json`, `timeline.json`, `documents.json`, `bills.json`, `myths.json`, `stories.json` | Home page sections |
| `src/_data/feeds.json` + `notices.js` | RSS sources for "the feed", fetched and cached for a day at build time. Each region has `fallback` items used when a feed is unset, empty or unreachable |
| `src/_data/glossary.json` | The glossary terms |
| `src/_data/about.json`, `podcast.json`, `topics.json` | About page, podcast formats and links, explainer topics |
| `src/explainers/*.{md,njk}` | Explainers (blog). `planned: true` lists an item without publishing a page |
| `src/episodes/*.md` | Podcast episodes (listed on `/podcast/`, no pages of their own) |
| `src/_includes/` | Base layout, explainer layout, header, footer, notice and forms partials |
| `src/assets/css/site.css` | The stylesheet and design tokens |
| `src/assets/js/site.js` | Larger-text toggle, calculator, filters, glossary search, time-ago, reading progress, form submit |
| `src/assets/img/` | Photos (see below) |
| `netlify/functions/daily-rebuild.mjs` | Scheduled function that triggers a daily deploy so feeds refresh |
| `design_handoff_salappeta_site/` | The original design handoff (reference only, not built) |

## Writing an explainer

Create `src/explainers/<slug>.md`:

```yaml
---
title: "how the minimum annual payment works"   # shown as the page h1
headline: "How the Minimum Annual Payment works" # optional; used in lists
dek: "One or two sentences for lists and the lede."
topic: The money   # The settlement | The money | Health insurance | Reading reports | The courts | Your rights
date: 2026-10-01
readMinutes: 6
featured: false
summary:           # optional "in short" points
  - "…"
sources:
  - { label: "Settlement Agreement, Doc 468", href: "https://www.nmisf.com/460-0-settlement-agreement/" }
---
Plain Markdown body. Headings and paragraphs sit in the wide column automatically.
```

It will appear at `/explainers/<slug>/`. For side notes, figures and pull quotes, see `src/explainers/the-75-and-the-25.njk`.

To feature a different explainer on `/explainers/`, move `featured: true` to it (and give it `photo` and `photoLabel`).

## Photos

Every image slot shows a labelled placeholder until its file exists in `src/assets/img/`. Drop in these files (any size; they are resized to AVIF/WebP/JPEG and shown in black and white by CSS):

- `hero-retirees.jpg`: home hero
- `story-1.jpg`, `story-2.jpg`, `story-3.jpg`: "in their words" (file names set in `stories.json`)
- `blog-feature.jpg`: featured explainer (set per explainer with `photo:`)
- `podcast-cover.jpg`
- `about-founder.jpg`

## Deploying on Netlify

1. Connect the GitHub repository in Netlify. The build settings come from `netlify.toml` (`npm run build`, publish `_site`).
2. **Forms:** Netlify detects the `newsletter` and `feedback` forms at deploy time. Turn on email notifications under **Forms → Form notifications**. Netlify stores submissions but does not send newsletters, so connect the `newsletter` form to Buttondown or Mailchimp (webhook or Zapier) when you're ready.
3. **Daily feed refresh:** create a build hook (**Site configuration → Build & deploy → Build hooks**), then add it as the environment variable `BUILD_HOOK_URL`. The scheduled function `daily-rebuild` calls it once a day.
4. **Domain:** add `salappeta.com` under **Domain management** and follow Netlify's DNS instructions. The site is already configured for `https://salappeta.com`.
5. **CMS login:** see below.

## Content editor (Decap CMS)

Edit explainers, podcast episodes and page content at **https://salappeta.com/admin/**. Every save is a commit to GitHub, and Netlify rebuilds the site in a minute or two.

What you can edit:

- **Explainers (blog):** write, date, feature, or mark as planned. Body is Markdown. (The sample article *the 75% and the 25%* uses a custom layout, so edit it in GitHub, `src/explainers/the-75-and-the-25.njk`.)
- **Podcast episodes**
- **Home page:** where things stand, timeline, retiree stories (with portraits), what you may hear, laws & court orders, bill tracker, the feed's sources
- **Other pages:** site settings (the "last updated" date), glossary, podcast links and formats, about page lists, *Will the money last?* text and report figures
- **Media:** photos upload to `src/assets/img/`

Section headings and fixed paragraphs live in the page templates in `src/`.

### One-time login setup

The editor signs in with GitHub. Anyone who should edit needs a GitHub account with write access to this repository.

1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**:
   - Application name: `Salåppeʼta CMS`
   - Homepage URL: `https://salappeta.com`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Copy the **Client ID**, and generate and copy a **Client secret**.
3. In Netlify: **Site configuration → Access & security → OAuth → Install provider → GitHub**, and paste both.
4. Open `/admin/` and choose **Login with GitHub**.

To add an editor, invite them as a collaborator on the GitHub repository.

### Trying the editor locally

```bash
npx decap-server        # in one terminal (port 8081)
npm start -- --port=8082  # in another
```

Then open http://localhost:8082/admin/ and choose **Login**. Changes are written to your local files, not GitHub.

## Still to confirm before launch

From the design handoff:

- The spelling "salåppeʼta", with a fluent Chamorro speaker.
- Retiree stories (collected with permission), blog dates, and the Camacho summary.
- HB 24-75 status after the House; HB 24-108 progress in the Senate (`bills.json`).
- Pacific and US RSS sources (`feeds.json`: add a `url` to each region).
- Podcast Spotify and Apple URLs (`podcast.json` and each episode).
- Founder title and bio.
- Every factual claim, checked against its linked source.

Noticed while building:

- The **Medicare** number (1-800-772-1213) is the Social Security Administration's line, which handles Medicare enrollment. Medicare's own line is 1-800-633-4227 (1-800-MEDICARE). It is listed in the article, on *Will the money last?* and in the glossary.
- nmisf.com's RSS feed (`/feed/`) currently returns no items, so the Settlement Fund tab shows the curated press releases in `feeds.json`.
- The $427 million total excludes FY 2015 ($27M per the actuarial report). Add `"2015": 27` to `requiredMinimumAnnualPaymentHistory_nmisfStatusPages` in `fund.json` to show $454M.
