import fs from "node:fs";
import path from "node:path";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import Image from "@11ty/eleventy-img";

const IMG_DIR = "src/assets/img";
const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const fmtDate = (d, opts) =>
  new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });

export default function (eleventyConfig) {
  // ---- Static assets -------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2": "assets/fonts/outfit-latin-wght-normal.woff2",
    "node_modules/@fontsource-variable/outfit/files/outfit-latin-ext-wght-normal.woff2": "assets/fonts/outfit-latin-ext-wght-normal.woff2",
    "node_modules/@fontsource/courier-prime/files/courier-prime-latin-400-normal.woff2": "assets/fonts/courier-prime-latin-400-normal.woff2",
    "node_modules/@fontsource/courier-prime/files/courier-prime-latin-700-normal.woff2": "assets/fonts/courier-prime-latin-700-normal.woff2",
  });
  eleventyConfig.addWatchTarget("src/assets/");

  // ---- Collections ---------------------------------------------------------
  eleventyConfig.addCollection("explainers", (api) =>
    api.getFilteredByGlob("src/explainers/*.{md,njk}").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("episodes", (api) =>
    api.getFilteredByGlob("src/episodes/*.md").sort((a, b) => b.data.no - a.data.no)
  );
  // Only finished pieces go in the site feed.
  eleventyConfig.addCollection("published", (api) =>
    api
      .getFilteredByGlob(["src/explainers/*.{md,njk}", "src/episodes/*.md"])
      .filter((item) => !item.data.planned)
      .sort((a, b) => b.date - a.date)
  );

  // ---- Site feed (explainers + episodes) -----------------------------------
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "published", limit: 20 },
    metadata: {
      language: "en",
      title: "Salåppeʼta — NMI pensions, explained",
      subtitle: "Explainers and podcast episodes about the pensions of Northern Mariana retirees.",
      base: "https://salappeta.com/",
      author: { name: "Salåppeʼta" },
    },
  });

  // ---- Filters -------------------------------------------------------------
  // "26 Sep 2026"
  eleventyConfig.addFilter("dateShort", (d) => fmtDate(d, { day: "numeric", month: "short", year: "numeric" }));
  // "27.09.2026"
  eleventyConfig.addFilter("dateDots", (d) => {
    const x = new Date(d);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(x.getUTCDate())}.${p(x.getUTCMonth() + 1)}.${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  // 148540144 -> "$148.5M"
  eleventyConfig.addFilter("millions", (n, digits = 1) => "$" + (n / 1e6).toFixed(digits) + "M");
  // 2417 -> "2,417"
  eleventyConfig.addFilter("num", (n) => Number(n).toLocaleString("en-US"));
  // Round half-up without float surprises (18.15 -> 18.2).
  eleventyConfig.addFilter("round1", (n) => (Math.round(n * 10 + 1e-9) / 10).toFixed(1));
  // Bar length as a CSS percentage: scale(29, 45, 88) -> "56.71%"
  eleventyConfig.addFilter("scale", (value, max, range = 100) => ((Math.max(0, value) / max) * range).toFixed(2) + "%");
  eleventyConfig.addFilter("sum", (obj) => Object.values(obj).reduce((a, b) => a + b, 0));
  eleventyConfig.addFilter("yy", (y) => "ʼ" + String(y).slice(2));
  eleventyConfig.addFilter("where", (arr, key, value) => arr.filter((x) => x.data?.[key] === value || x[key] === value));
  eleventyConfig.addFilter("whereNot", (arr, key, value) => arr.filter((x) => (x.data?.[key] ?? x[key]) !== value));
  eleventyConfig.addFilter("exclude", (arr, url) => arr.filter((x) => x.url !== url));
  eleventyConfig.addFilter("take", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));
  // Group glossary terms by first letter ("#" for numbers).
  eleventyConfig.addFilter("glossaryGroups", (terms) => {
    const groups = [];
    for (const t of terms) {
      const ch = /^[0-9]/.test(t.term) ? "#" : t.term[0].toUpperCase();
      let g = groups.find((x) => x.ch === ch);
      if (!g) groups.push((g = { ch, id: "l-" + (ch === "#" ? "num" : ch.toLowerCase()), items: [] }));
      g.items.push(t);
    }
    return groups;
  });

  // ---- Photo slots ---------------------------------------------------------
  // {% photo "hero-retirees.jpg", "Alt text", "Placeholder label" %}
  // Renders an optimized grayscale image if the file exists in src/assets/img,
  // otherwise a labelled placeholder so the layout holds until the photo arrives.
  eleventyConfig.addShortcode("photo", async (file, alt = "", placeholder = "Photo to come") => {
    // The CMS stores "/assets/img/name.jpg"; templates may pass just "name.jpg".
    file = String(file || "").replace(/^\/?assets\/img\//, "");
    const src = path.join(IMG_DIR, file || "");
    if (!file || !fs.existsSync(src)) {
      const label = escapeAttr(placeholder);
      return `<div class="photo-slot" role="img" aria-label="${label}"><span>${label}</span></div>`;
    }
    const meta = await Image(src, {
      widths: [320, 640, 960],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "_site/assets/img/",
      urlPath: "/assets/img/",
    });
    return Image.generateHTML(meta, {
      alt,
      sizes: "(min-width: 700px) 50vw, 100vw",
      loading: "lazy",
      decoding: "async",
    });
  });

  eleventyConfig.ignores.add("src/admin/**");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
