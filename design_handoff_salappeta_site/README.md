# Handoff: Salåppeʼta — NMI pensions, explained

## Overview
Salåppeʼta is an independent, supplementary website that keeps the public conversation going about retirees of the Commonwealth of the Northern Mariana Islands (CNMI): the 2013 *Johnson v. Inos* settlement, the NMI Settlement Fund, bills and budgets, retiree health insurance (GHLI), and the Fund's actuarial and investment reports. It **supplements, and never replaces, nmisf.com**, which remains the official source. The audience is mostly retirees (average age 69, many on phones), plus family members, journalists and policymakers' staff.

**Target stack:** Eleventy (11ty) static site, hosted on **Netlify**, with **Netlify Forms** for the newsletter signup and feedback form.

## About the design files
The files in `design/` are **design references built in HTML**. They are prototypes that show the intended look, copy and behavior, not production code. Each `.dc.html` file opens directly in a browser (it needs the `support.js` and `image-slot.js` files next to it). Styles are inline in the prototypes. **Recreate them as Eleventy templates** (Nunjucks recommended) with a real stylesheet, using the tokens below. Do not ship the `.dc.html` files.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy and interactions are final. Recreate them closely. Copy marked as a placeholder (retiree stories, blog dates, planned episodes, the Pacific/US feeds) is not final.

---

## Recommended Eleventy structure
```
src/
  _data/
    site.json            # name, tagline, nav, footer links, copyright
    fund.json            # actuarial + investment numbers (see data/fund.json)
    timeline.json        # homepage timeline entries
    documents.json       # laws & court orders list
    bills.json           # bill tracker (title, plain, note, stage 0–4)
    myths.json           # "what you may hear"
    glossary.json        # see data/glossary.json
    feeds.json           # RSS sources: { region, name, url }
    notices.js           # fetch + cache RSS at build (@11ty/eleventy-fetch)
  _includes/
    layouts/base.njk     # <head>, header, footer, notice
    partials/header.njk  partials/footer.njk  partials/notice.njk
    partials/stay-informed.njk              # Netlify forms
  explainers/*.md        # blog posts (collection "explainers")
  episodes/*.md          # podcast episodes (collection "episodes")
  index.njk              # Home
  blog.njk  podcast.njk  fund-health.njk  glossary.njk  about.njk
  thanks.njk             # form success page
  assets/css/site.css  assets/js/site.js
eleventy.config.js
netlify.toml
```
Suggested URLs:
- `/`
- `/explainers/`
- `/explainers/<slug>/`
- `/podcast/`
- `/will-the-money-last/`
- `/glossary/`
- `/about/`
- `/about/#sources`
- `/#stay` for contact

Plugins:
- `@11ty/eleventy-plugin-rss`: the site's own feed, for explainers and episodes.
- `@11ty/eleventy-fetch`: pulls and caches outside RSS feeds at build time (duration around 1 day).
- `@11ty/eleventy-img`: image slots and portraits. Convert images to black and white with `filter: grayscale(1)` in CSS, or at build time.

Front matter for explainers:
- `title`, `dek`
- `topic`: one of `The settlement`, `The money`, `Health insurance`, `Reading reports`, `The courts`, `Your rights`
- `date`, `readMinutes`, `featured: true|false`
- `sources: [{label, href}]`

Front matter for episodes:
- `no`, `title`, `format` (`Retiree voices` | `Explainers` | `On the record` | `Roundup`), `length`, `summary`
- `spotify`, `apple`

Netlify:
- **Build:** `npx @11ty/eleventy` into `_site`.
- **Scheduled rebuild:** a daily build hook triggered by a Netlify Scheduled Function, so the RSS feeds refresh.
- **Optional CMS:** Decap CMS at `/admin` for non-technical editing of explainers, bills and notices.

---

## Design tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `--almond` | `#F3ECE0` | page background |
| `--almond-deep` | `#EADFCD` | alternate section background |
| `--almond-hover` | `#E2D5C0` | row hover on almond-deep |
| `--forest` | `#2F4A3D` | **primary text**, thick rules, dark sections, the calculator |
| `--sage` | `#3F5A4C` | secondary text, nav hover box, laws section background |
| `--sage-muted` | `#6F8A78` | dividers on dark backgrounds (avoid for text on almond: too faint) |
| `--sage-pale` | `#AFC0B3` | soft shapes, chart bars, labels on dark backgrounds |
| `--sage-mist` | `#EEF3ED` | text on sage |
| `--terracotta` | `#C4553A` | **accent**: signature bar, urgent/lost money, current bill stage, primary buttons, footer and bill tracker backgrounds |
| `--terracotta-light` | `#EA8B70` | terracotta text on forest backgrounds (calculator amounts) |
| `--white` | `#FFFFFF` | text on terracotta |

Rules:
- There is no black anywhere; the darkest color is forest.
- Terracotta means "pay attention". Use it only for the signature bar, money lost, urgent items, the current stage and primary calls to action.
- Hover highlights stay forest or sage, never terracotta.

### Typography
- **Outfit** (Google Fonts), weights 100–700, for everything.
- **Courier Prime** (Google Fonts), weights 400 and 700, only for dates and short metadata labels.

| Role | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| Homepage name (header, right) | `clamp(72px, 12.5vw, 199px)` | 100 | .9 | -.045em |
| Page title (h1) | `clamp(60px, 7.5vw, 120px)` | 100 | .95 | -.04em |
| Section title (h2) | `clamp(60px, 7vw, 110px)` | 100 | .95 | -.035em |
| Big figure | 60–140px | 100–300 | .85–1 | -.03em |
| Item title (h3) | 24–36px | 600–700 | 1.2 | -.01em |
| Lede | `clamp(22px, 2.2vw, 29px)` | 400 | 1.382 | — |
| Body | 20px (never below 18px) | 400 on light, 500 on dark | 1.618 | — |
| Meta label (Courier Prime) | 18px | 700 | 1.1–1.5 | — |

Rules:
- Weight 100 is only for very large type (60px and above).
- Anything under about 80px uses weight 300 or heavier.
- On dark backgrounds, body text is weight 500.

### Grid and spacing: golden ratio
- **Main asymmetric split:** `grid-template-columns: minmax(0,38.2fr) minmax(0,61.8fr); gap: 47px;`. Metadata, labels and side notes go in the narrow left column, right-aligned. Content goes in the wide right column.
- **Spacing scale:** 6, 12, 18, 29, 47, 76, 94, 123px, in Fibonacci-like steps.
  - Sections: `padding: 94–123px clamp(20px,5vw,88px)`.
- **Radius:** 0 everywhere. Circles (`border-radius: 50%`) are used only for photos and dot markers.
- **Shadows:** none, except the optional floating dock, which uses `0 8px 30px rgba(47,74,61,.25)`.

### Recurring elements
- **Signature bar:** `height:14px; background: var(--terracotta); width: 61.8%`, placed above each page title.
- **Nav bar mark:** a 10px-wide forest vertical bar to the right of the stacked nav links.
- **Nav link:** 20px text, `min-height: 34px`, `padding: 0 10px; margin: 0 -10px`.
  - Hover: background `--sage`, text `--sage-mist`.
  - Current page: the same colors, applied permanently.
- **Name lockup:** "salåppeʼ" in forest plus "ta" in terracotta. Use U+02BC ʼ for the glottal stop.
- **Circle photo:** grayscale photo inside a circle, overlapped by a flat pale-sage or terracotta circle with `mix-blend-mode: multiply`.
- **Timeline:** 2px forest left rule. Each 16px dot has a 2px forest border, filled almond, sage or terracotta by status.
- **Notice box:** `border: 3px solid var(--terracotta); padding: 24px 29px`. It contains an 18px terracotta dot, a bold 24px "Not legal or financial advice.", and 22px copy.
- **Footer:**
  - Terracotta background with white text.
  - Left block: "an independent guide" (29px, weight 400) above "nmi pensions, explained" (29px, weight 600, no wrap). Below that, a 12px forest bar, then "salåppeʼta" set vertically (reading bottom-up, 60–96px, weight 700).
  - Right block: a stacked list of links (20px, weight 600, white, underlined on hover), a white-outlined "Not legal or financial advice" box (22px, weight 700), and a 10px forest vertical bar.
  - Full-width bottom row: `© 2026 Salåppeʼta and Alexie Zotomayor. All rights reserved.`

---

## Screens

### 1. Home (`design/Salappedia Home.dc.html`)
Sections, in order:
1. **Header / hero.**
   - Header, right-aligned: the terracotta signature bar, the large name lockup, then the stacked nav with the forest bar and the date mark "c. 20 / 26".
   - Nav items: where things stand, timeline, the money, laws & court orders, the feed, blog, podcast, contact us, plus the A+ larger-text button.
   - Hero below: a 6px forest bar next to the "salåppeʼ · money + -ta · our" label, the lede, and two links ("What changed in 2026", "Where the money comes from").
   - Hero right: a circle photo slot ("retirees, Saipan"), a sage "75% guaranteed" disc, and "Johnson v. Inos" set vertically.
2. **$427 million.**
   - The total of required Minimum Annual Payments, FY 2014–2026. FY 2015 was not posted; the actuarial report gives $27M for FY 2015, so update the total to **$454M** if you include it.
3. **Where things stand.**
   - Three numbered items, each with a source link. Item 1 has a terracotta numeral.
     - (1) The extra 25% has stopped.
     - (2) Health insurance: covered for 2026, not settled for 2027.
     - (3) Payments have been late.
4. **Check calculator** (forest background).
   - A terracotta "Check calculator" tag above the h2 "what does this mean for my check?".
   - Number input (default 1500, step 50), in terracotta-light.
   - A 75/25 bar: pale sage and terracotta.
   - Outputs: Guaranteed 75% (monthly), Stopped 25% (monthly, terracotta-light), and "Lost over a year" = 25% × 12 (terracotta-light).
   - Outlined note: "An estimate, not financial advice…"
5. **Timeline** (almond-deep background): 2009, 2012, 2013, 2018, 2025, 2026.
6. **In their words.** Three circle portrait slots at sizes 100%, 61.8% and 80%, offset vertically by 0, 123px and 47px. Placeholder copy.
7. **Where the money comes from.**
   - 12-bar chart of Minimum Annual Payments, FY 2014–2026, in $ millions. FY 2026 is sage, 2018 is sage-muted, the rest pale sage.
   - A terracotta button links to the "Will the money last?" page.
8. **What you may hear** (almond-deep background).
   - Three rows. The "heard" myth appears with a strikethrough; the "record" fact appears with its source.
   - *Accessibility note: consider replacing the strikethrough with a "Not quite" label.*
9. **Laws & court orders** (sage background).
   - Six document rows: kind and date on the left (right-aligned), title and plain summary on the right.
   - A terracotta "All settlement documents →" box, right-aligned.
   - Outlined note: independent and supplementary.
10. **Bill tracker** (terracotta background).
    - The title "bill tracker" and subtitle "where each bill stands" sit in the left column and stick while scrolling.
    - Each bill: title (29–36px, weight 600), plain summary, and five stages: Introduced, Committee, Passed House, Senate, Governor.
    - Stage dots: completed = white fill; current = forest fill with a white border; future = hollow. Connecting lines: white when completed, 45% white for future.
    - The note below is Courier Prime, 20px, bold.
    - Bills:
      - HB 24-108 (stage 2)
      - P.L. 24-20 (stage 4)
      - HB 24-75 (stage 2, later status to confirm)
11. **The feed.** Tabs: Settlement Fund (real NMISF press releases), Pacific, United States. Built from RSS at build time.
12. **Stay informed** (almond-deep background).
    - Newsletter email form and "Tell us something" feedback form. The feedback form has type chips (A question / A correction / My story) and a textarea. **Netlify Forms, see below.**
13. **Footer.**

### 2. Blog (`Salappedia Blog.dc.html`)
- Title "explainers".
- Featured explainer: a circle photo on the left, with a terracotta "Read the explainer →" button.
- "all explainers" list on almond-deep, filterable by topic chips. The left column shows topic, **date (bold)**, **time ago** and read time.
- Compute "time ago" in client JS from `datetime`, so it stays current between builds.

### 3. Article (`Salappedia Article.dc.html`)
Sample: "the 75% and the 25%".
- **Top of page:**
  - Terracotta reading-progress bar (6px, fixed at the top).
  - Terracotta notice box near the top.
  - Three-point "in short" summary on a forest block.
- **Body:**
  - Numbered sections with key-term side notes in the left column.
  - A drop cap: a 110px, weight 100 sage "I".
  - The $45M → $29M figure.
  - A notices timeline.
  - Pull quote in terracotta, weight 300.
  - A $1,500 worked example.
  - Tap-to-call contacts.
- **End of page:** sources, then "read next".

### 4. Podcast: *The Breadfruit Dispatch* (`Salappedia Podcast.dc.html`)
- Title "the breadfruit / dispatch" (weight 100), a cover-art circle, a terracotta "Listen on Spotify" button and an outlined "Apple Podcasts" button.
- Four format cards (01–04).
- Episodes list on forest, filterable by format. Each episode shows the number, format, length, title and a summary (**summary only, no transcripts**), with Spotify and Apple links.
- "Want to be on the show?" prompt.

### 5. Will the money last? (`Salappedia Fund Health.dc.html`)
The plain-language explainer of the actuarial and investment reports. All figures are in `data/fund.json`.
1. **Title and short answer:** "yes, for the 75% — if the Government keeps paying and the investments keep earning."
2. **Three answer cards:** Is the 75% safe? Is the 100% covered? (terracotta) Biggest risk?
3. **One year, in and out.** Horizontal bars: +$29.0M Government, +$8.4M investments, −$36.5M pensions (terracotta), −$1.7M expenses. $148.5M → $148.4M.
4. **The plan: spend it down.** 25 bars for the projected balance, FY 2026–2050. 2047 and later in terracotta. Milestones: $148M (2026), $90M (2034), $29M (2040), $0 (~2048).
5. **What the Government must pay** (forest background). Bars from FY 2025 ($30M, paid) through $10.6M for 2034–2047, plus an "FY 2026 paid in full" callout.
6. **And your health insurance** (anchor `#health`).
   - Status cards: 2026 Covered (forest), 2027 Not settled (terracotta), $6.9M (almond with a forest outline).
   - A five-step timeline.
   - "Being discussed": Medicare for retirees 65 and older; Guam's model.
   - Contacts.
7. **Investments.** Returns (1, 3, 5, 10 years and since 2013) against a dashed terracotta 5.8% goal line. Bars at or above 5.8% are sage; below are terracotta.
8. **Where it is invested.** Stacked bar plus legend.
9. **Who is covered.** Four big figures.
10. **What could go wrong.** Five risks.
11. **Words used.**
12. **Sources** (forest background).

### 6. Glossary (`Salappedia Glossary.dc.html`)
- 32 terms, grouped A–Z with big terracotta letters in the left column.
- A search box filters by term and definition.
- 48px letter buttons jump to each group.
- Empty state: "No match…" with a link to the contact form.

### 7. About (`Salappedia About.dc.html`)
1. The name meaning.
2. Why the site exists, with a founder portrait slot and "Alexie Zotomayor, Founder and editor". **Confirm the title with the client.**
3. **"A supplement, not a replacement"**, crediting the Settlement Fund and the Trustee's office, with a button to nmisf.com.
4. **"nmisf.com already has the documents. Why another site?"**: five side-by-side rows comparing nmisf.com and salåppeʼta.
5. How we work: four principles.
6. Sources (anchor `#sources`).
7. Corrections, and the name.
8. The notice box.

---

## Interactions and behavior (vanilla JS, `assets/js/site.js`)
- **Larger text:**
  - Toggles `html { font-size }` or a `.large` class (the prototype uses zoom 1.18).
  - **Persist it in `localStorage`** and apply it on every page.
  - Label: "A+ larger text" / "A− smaller text".
- **Calculator:** `guaranteed = b*.75`, `stopped = b*.25`, `yearly = b*.25*12`. Format as `en-US` currency with no cents. Clamp to 0 or above.
- **Filters** (blog topics, podcast formats, feed tabs): client-side show and hide.
  - The selected chip is filled forest with almond text, or almond on forest in dark sections.
- **Glossary search:** case-insensitive substring match on the term and definition. Hide empty letter groups.
- **Time ago:**
  - Wording: "today" / "yesterday" / "n days ago" / "n weeks ago" / "n months ago" / "n years ago".
  - Render the date server-side in `<time datetime>`.
- **Reading progress (article):** width = `scrollTop / (scrollHeight - clientHeight)`.
- **Sticky bill tracker title:** `position: sticky; top: 29px` on the left column.
- **Links:** tap-to-call `tel:` links for every phone number. External links get a ↗ mark.
- **Transitions:** only `background .15s` and `color .15s` on nav hover, plus `filter: brightness(.9)` on terracotta button hover. Respect `prefers-reduced-motion`.
- **Responsive:**
  - All two-column grids collapse to one column below about 700px (use `repeat(auto-fit, minmax(min(100%, 340px), 1fr))` where the prototype does).
  - The vertical footer name stays; the nav stacks.
  - Tap targets are at least 44–48px.

## Netlify Forms
Use two static HTML forms. Netlify detects them at deploy time, so they must be in the built HTML.
```html
<form name="newsletter" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thanks/">
  <input type="hidden" name="form-name" value="newsletter">
  <p hidden><label>Leave empty <input name="bot-field"></label></p>
  <label for="em">Email address</label>
  <input id="em" name="email" type="email" required autocomplete="email">
  <button type="submit">Send me updates</button>
</form>

<form name="feedback" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thanks/">
  <input type="hidden" name="form-name" value="feedback">
  <p hidden><label>Leave empty <input name="bot-field"></label></p>
  <fieldset><legend>What is it about?</legend>
    <label><input type="radio" name="type" value="question" checked> A question</label>
    <label><input type="radio" name="type" value="correction"> A correction</label>
    <label><input type="radio" name="type" value="story"> My story</label>
  </fieldset>
  <label for="msg">Message</label>
  <textarea id="msg" name="message" rows="5" required></textarea>
  <label for="fe">Email (optional, if you'd like a reply)</label>
  <input id="fe" name="email" type="email">
  <button type="submit">Send</button>
</form>
```
- **Type chips:** style the radio buttons as the chip buttons in the design, visually but keeping native inputs.
- **Success:** use a `/thanks/` page or an AJAX submit (POST url-encoded to `/`). Success copy: "Thank you — check your inbox to confirm." for the newsletter, and "Received. Thank you." for feedback.
- **Notifications:** turn on email notifications in Netlify → Forms.
- **Mailing list:** Netlify Forms only stores submissions and doesn't send newsletters. Connect the newsletter form to Buttondown or Mailchimp through a Netlify webhook or Zapier, or embed that provider's form instead.
- **Spam:** keep the honeypot. Add reCAPTCHA (`data-netlify-recaptcha`) if spam appears.

## Data
- `data/fund.json`: every number on "Will the money last?", with its source report and page.
- `data/glossary.json`: all 32 glossary terms.
- **Timeline, documents, bills and myths:** the data arrays are in the logic class at the bottom of each `.dc.html`, inside the `<script data-dc-script>` block. Move them into `_data/*.json`.

## Content still to confirm before launch
- The spelling "salåppeʼta", with a fluent Chamorro speaker.
- Retiree stories, collected with permission; blog dates; the Camacho summary.
- HB 24-75 status after the House; HB 24-108 progress in the Senate.
- Pacific and US RSS sources.
- Podcast Spotify and Apple URLs.
- Founder title and bio.
- Every factual claim, checked against its linked source. Primary sources are the NMISF site and the attached Milliman and Wilshire reports.

## Assets
- There are no image files. Every image is a placeholder slot:
  - hero (retirees, Saipan)
  - three retiree portraits
  - blog featured photo
  - podcast cover
  - founder portrait
- Use grayscale photos in circles.
- Fonts: Outfit and Courier Prime from Google Fonts. Self-host them for speed.
- No icons. Arrows are the text characters → and ↗, and markers are CSS circles and squares.

## Files
- `design/Salappedia Home.dc.html`: Home
- `design/Salappedia Blog.dc.html`: Blog / explainers
- `design/Salappedia Article.dc.html`: sample explainer article
- `design/Salappedia Podcast.dc.html`: *The Breadfruit Dispatch*
- `design/Salappedia Fund Health.dc.html`: Will the money last?
- `design/Salappedia Glossary.dc.html`: Glossary
- `design/Salappedia About.dc.html`: About
- `design/support.js`, `design/image-slot.js`: needed only to open the prototypes locally
- `data/fund.json`, `data/glossary.json`
- `source-reports/`: the 2025 Milliman actuarial valuation, the July 2026 Wilshire investment summary, and the FY 2026 payment schedule
- `screenshots/`: reference captures of each page, by page name (`01-home.jpg`…`05-home.jpg`, `01-fund-health.jpg`…, `01-article.jpg`, `01-blog.jpg`, `01-podcast.jpg`, `glossary.jpg`, `01-about.jpg`…). They were taken at desktop width; the prototypes remain the source of truth.

Homepage-only prototype extras: Tweaks for `accent` (Terracotta / Hibiscus coral / Latte-stone gold), `navStyle` and `footerStyle`. The chosen production values are **Terracotta**, **Elementare** nav and **Elementare** footer. Drop the alternatives.
