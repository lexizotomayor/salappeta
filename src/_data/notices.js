// Pulls each outside RSS feed at build time (cached for a day) and falls back
// to the curated items in feeds.json when a feed is unset, empty or unreachable.
import Fetch from "@11ty/eleventy-fetch";
import { XMLParser } from "fast-xml-parser";
import feeds from "./feeds.json" with { type: "json" };

const parser = new XMLParser({ ignoreAttributes: false });
const MAX_ITEMS = 5;

const asArray = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const text = (x) => (typeof x === "object" && x !== null ? x["#text"] ?? "" : x ?? "").toString().trim();

function parseFeed(xml, source) {
  const doc = parser.parse(xml);
  // RSS 2.0
  const rssItems = asArray(doc?.rss?.channel?.item).map((it) => ({
    source,
    date: it.pubDate ? new Date(text(it.pubDate)).toISOString() : "",
    title: text(it.title),
    href: text(it.link),
  }));
  // Atom
  const atomItems = asArray(doc?.feed?.entry).map((it) => ({
    source,
    date: text(it.updated || it.published),
    title: text(it.title),
    href: asArray(it.link).map((l) => l["@_href"]).find(Boolean) || "",
  }));
  return [...rssItems, ...atomItems].filter((i) => i.title);
}

export default async function () {
  const out = [];
  for (const feed of feeds) {
    let items = [];
    if (feed.url) {
      try {
        const xml = await Fetch(feed.url, { duration: "1d", type: "text" });
        items = parseFeed(xml, feed.name).slice(0, MAX_ITEMS);
      } catch (err) {
        console.warn(`[notices] ${feed.url}: ${err.message} — using fallback items`);
      }
    }
    const live = items.length > 0;
    out.push({
      region: feed.region,
      label: feed.label,
      note: feed.note,
      live,
      items: live ? items : feed.fallback,
    });
  }
  return out;
}
