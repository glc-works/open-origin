// Builds the static site into dist/ from the story files. No framework: plain HTML + one stylesheet.
import { mkdir, writeFile, copyFile, cp, rm, access, readFile } from "node:fs/promises";
import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { ID_CHARS, ID_SALT, isHttpUrl, QUALITY, TRACEABILITY, loadLots, validateLot, resolveLot, loadProducers, validateProducer, linkProducers, duplicateIds, ROOT, CROPS, RTL, loadStories, validateStory, validateTranslation, linkOrigins, loadKnowledge, validateKnowledge } from "./lib.mjs";
// A broken file (e.g. bad YAML) stops the run with one readable line, not a stack trace.
for (const ev of ["unhandledRejection", "uncaughtException"]) process.on(ev, (e) => { console.error(`\n✗ ${e.message}`); process.exit(1); });

const STAGE_LABEL = { farm: "On the farm", harvest: "Harvest", process: "Processing", dry: "Drying", sort: "Sorting", roast: "Roasting", brew: "In the cup", market: "To market", other: "Along the way" };
// "apis-dorsata" -> "Apis dorsata", "dried-beans" -> "Dried beans"
const pretty = (x) => { const t = String(x).replace(/-/g, " "); return t[0].toUpperCase() + t.slice(1); };
const tagFor = (s) => (s.kind === "movement"
  ? `<span class="species movement">Movement</span>`
  : `<span class="species ${esc(s.species || s.crop)}">${esc(s.species ? pretty(s.species) : CROPS[s.crop].label)}</span>`);

const DIST = path.join(ROOT, "dist");
// The stylesheet ships with the code, not the content, so a fixture folder (OPEN_ORIGIN_ROOT) builds too.
const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");

// Stories come from the public, so Markdown is rendered without raw HTML and with only safe link targets.
const safeHref = (h) => /^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(String(h).trim()) && !/^\s*(javascript|data|vbscript):/i.test(String(h));
marked.use({
  renderer: {
    html(token) { return esc(typeof token === "string" ? token : token.text ?? token.raw ?? ""); },
    link(href, title, text) {
      const h = typeof href === "object" ? href.href : href;
      const label = typeof href === "object" ? href.text : text;
      return safeHref(h) ? `<a href="${esc(h)}">${label}</a>` : label;
    },
    image(href, title, text) {
      const h = typeof href === "object" ? href.href : href;
      const alt = typeof href === "object" ? href.text : text;
      return /^https:/i.test(String(h)) ? `<img src="${esc(h)}" alt="${esc(alt)}" loading="lazy">` : esc(alt);
    },
  },
});
const REPO = "https://github.com/glc-works/open-origin";
const SUBMIT = `${REPO}/issues/new?template=story.yml`;
const countryName = new Intl.DisplayNames(["en"], { type: "region" });
const langName = new Intl.DisplayNames(["en"], { type: "language" });

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const flag = (cc) => String(cc).toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
const fmtAlt = (a) => (Array.isArray(a) ? `${a[0].toLocaleString("en")}${a[1] !== a[0] ? `–${a[1].toLocaleString("en")}` : ""} masl` : "");
const TOLD = { farmer: "the farmer", "producer-group": "the producer group", roaster: "a roaster", researcher: "a researcher", editor: "the editors", other: "a contributor" };

const loaded = await loadStories();
const stories = loaded.stories.filter((s) => validateStory(s).length === 0);
for (const s of stories) s.translations = s.translations.filter((t) => validateTranslation(t).length === 0);
linkOrigins(stories);
const allProducers = await loadProducers();
const allLots = await loadLots();
const dupIds = duplicateIds([...loaded.stories, ...allProducers, ...allLots]);
const producers = allProducers.filter((p) => validateProducer(p).length === 0 && !dupIds.has(p.file));
for (let i = stories.length - 1; i >= 0; i--) if (dupIds.has(stories[i].file)) stories.splice(i, 1);
linkProducers(stories, producers);
const knowledge = (await loadKnowledge()).filter((k) => validateKnowledge(k).length === 0);
const learnHref = (crop, slug) => (knowledge.some((k) => k.crop === crop && k.slug === slug) ? `learn/${crop}/${slug}/` : null);
// Wraps a term in a link to its Learn page when one exists.
const termLink = (crop, term, prefix, label = term) => {
  const h = learnHref(crop, term);
  return h ? `<a class="term" href="${prefix}${h}">${esc(label)}</a>` : esc(label);
};
// Footnotes: "[2]" in a body points to the second link in that entry's sources.
const cite = (html, n) => html.replace(/\[(\d+)\](?!\()/g, (m, i) => (i >= 1 && i <= n ? `<sup class="cite"><a href="#src-${i}">[${i}]</a></sup>` : m));
const sourceList = (urls) => (urls.length ? `<p class="eyebrow" style="margin-top:2em">Sources</p><ol class="sources">${urls.map((u, i) => `<li id="src-${i + 1}"><a href="${esc(u)}">${esc(u)}</a></li>`).join("")}</ol>` : "");
// Matches a variety name written in a story ("Ateng Super") to a Learn entry by its aliases.
const norm = (x) => String(x).toLowerCase().replace(/[^a-z0-9]+/g, "");
const varietyFor = (crop, name) => knowledge.find((k) => k.type === "variety" && k.crop === crop
  && [k.title, ...(k.aliases || [])].some((a) => norm(a) === norm(name)));
const lots = allLots.filter((l) => validateLot(l, stories, producers).length === 0 && !dupIds.has(l.file))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));
// linked: the stories a lot comes from (one, or several for a blend); owner: the producer profile it is filed under, if any.
for (const l of lots) { const r = resolveLot(l, stories, producers); l.linked = r.stories; l.owner = r.producer; }
for (const s of stories) s.lots = lots.filter((l) => l.linked.includes(s));
const lotHref = (l) => `${l.linked[0] ? href(l.linked[0]) : producerHref(l.owner)}#${l.id}`;
const TRACE_LABEL = { farm: "Traced to the farm", group: "Traced to the producer group", region: "Traced to the region", country: "Traced to the country", blend: "Blend" };
const qField = (crop, k) => (QUALITY[crop] || []).find((f) => f[0] === k);
const qText = (crop, k, v) => { const f = qField(crop, k); return f ? `${f[1]} ${v}${f[2] ? ` ${f[2]}` : ""}` : `${k} ${v}`; };
const origins = stories.filter((s) => s.kind === "origin");
const voices = stories.filter((s) => s.kind !== "origin");
const submitFor = (o) => `${SUBMIT}&crop=${encodeURIComponent(o.crop)}&country=${encodeURIComponent(o.country)}&origin=${encodeURIComponent(o.slug)}&region=${encodeURIComponent(o.region || "")}`;
const nativeName = (code) => { try { return new Intl.DisplayNames([code], { type: "language" }).of(code); } catch { return code; } };
const dirOf = (lang) => (RTL.includes(String(lang).split("-")[0]) ? "rtl" : "ltr");
const href = (s) => `stories/${s.crop}/${s.pathCountry}/${s.slug}/`;
const producerHref = (p) => `producers/${p.id}/`;
const photoSrc = (s, prefix) => (/^https?:\/\//.test(s.photo) ? s.photo : prefix + String(s.photo).replace(/^\/+/, ""));

// The mark is inline so it follows light and dark mode; site/logo.svg is the same mark for the favicon. More versions: site/brand/.
const LOGO = `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M52.1 19.2C53.0 20.6 56.2 24.2 57.4 27.2C58.7 30.2 59.8 33.8 59.8 37.2C59.8 40.5 58.9 44.4 57.4 47.4C55.8 50.4 53.1 53.2 50.4 55.2C47.7 57.1 44.3 58.4 41.2 59.3C38.0 60.2 34.7 60.4 31.6 60.3C28.4 60.3 25.2 59.8 22.2 58.9C19.3 57.9 16.2 56.5 13.7 54.6C11.2 52.7 8.8 50.1 7.2 47.4C5.6 44.7 4.4 41.4 3.9 38.2C3.3 35.0 3.3 31.5 3.9 28.3C4.4 25.1 5.5 21.7 7.1 18.8C8.8 15.9 11.1 13.0 13.7 10.9C16.4 8.9 19.8 7.3 23.0 6.6C26.2 5.9 29.9 6.1 33.1 6.8C36.2 7.5 40.5 9.9 41.9 10.6" fill="none" stroke="var(--forest)" stroke-width="4.6" stroke-linecap="round"/><path d="M49.4 22.6C49.8 23.7 51.7 26.7 52.1 28.8C52.4 30.9 52.1 33.4 51.4 35.5C50.8 37.5 49.6 39.5 48.3 41.2C47.1 42.8 45.5 44.2 43.9 45.4C42.3 46.6 40.5 47.7 38.7 48.4C36.8 49.1 34.8 49.6 32.8 49.7C30.8 49.8 28.6 49.5 26.7 48.9C24.8 48.2 23.0 47.1 21.4 45.8C19.8 44.5 18.4 42.9 17.2 41.2C16.1 39.5 15.1 37.5 14.6 35.4C14.0 33.4 13.7 31.0 14.0 28.9C14.3 26.8 15.1 24.4 16.3 22.6C17.4 20.9 19.2 19.3 21.0 18.2C22.8 17.1 25.0 16.5 27.0 16.1C28.9 15.8 30.9 15.8 32.8 15.9C34.7 15.9 37.6 16.4 38.5 16.5" fill="none" stroke="var(--leaf)" stroke-width="4.6" stroke-linecap="round"/><path d="M43.6 28.0C43.5 28.5 43.6 30.0 43.5 30.9C43.4 31.8 43.1 32.7 42.7 33.6C42.4 34.4 41.9 35.2 41.3 35.9C40.8 36.6 40.1 37.3 39.3 37.8C38.6 38.3 37.7 38.7 36.8 39.0C35.9 39.2 34.9 39.3 34.0 39.2C33.1 39.2 32.2 39.0 31.3 38.7C30.4 38.3 29.5 37.9 28.8 37.4C28.0 36.8 27.2 36.1 26.7 35.3C26.1 34.6 25.6 33.6 25.3 32.7C25.1 31.7 25.0 30.6 25.2 29.7C25.3 28.7 25.7 27.7 26.2 26.9C26.7 26.1 27.4 25.4 28.1 24.8C28.8 24.2 29.5 23.7 30.3 23.3C31.1 22.9 31.8 22.5 32.7 22.2C33.5 21.9 34.9 21.7 35.4 21.6" fill="none" stroke="var(--origin)" stroke-width="4.6" stroke-linecap="round"/><circle cx="35.6" cy="29.6" r="3.7" fill="var(--origin)"/></svg>`;
function head(title, description, prefix, extra = "") {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${prefix}style.css">
<link rel="icon" href="${prefix}logo.svg" type="image/svg+xml">
${extra}</head>
<body>
<header class="bar"><div class="wrap">
  <a class="brand" href="${prefix}">${LOGO}<b><span>open</span> origin</b></a>
  <nav><a href="${prefix}#stories">Stories</a><a href="${prefix}#learn">Learn</a><a href="${prefix}codes/">Codes</a><a href="${prefix}#contribute">Contribute</a><a href="${prefix}datapackage.json">Open data</a><a href="${REPO}">GitHub</a></nav>
</div></header>`;
}

const foot = `<footer class="site-footer"><div class="wrap">
  <p>Open Origin · stories from where it grows.</p>
  <p>Stories are CC BY 4.0, credited to the people who told them. Code is Apache-2.0. Altitude and tasting notes are typical ranges; every harvest is different.</p>
</div></footer>
</body>
</html>`;

// The newest lot's first measured number, in the crop's own order (cupping score for coffee, % well fermented for cocoa…).
function headline(s) {
  for (const l of s.lots || []) {
    const f = (QUALITY[s.crop] || []).find((x) => x[3] !== null && l.quality?.[x[0]] !== undefined);
    if (f) return `${qText(s.crop, f[0], l.quality[f[0]])} (${l.date})`;
  }
  return "";
}

// Cover art for a story without a photo: contour lines like a relief map, drawn from the story id so each
// story keeps its own pattern. Colour follows the crop.
const CROP_HUE = { coffee: "var(--cherry)", cocoa: "#7A4A2B", tea: "var(--leaf)", spice: "#A0632A", vanilla: "#6B5A2E", honey: "#B7862A", sugar: "#8A5A3C" };
function coverArt(s) {
  let h = 0; for (const c of String(s.id || s.slug)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const cx = 60 + rnd() * 180, cy = 20 + rnd() * 60;
  const rings = Array.from({ length: 9 }, (_, i) => {
    const r = 14 + i * 16, pts = 28, wob = 4 + rnd() * 6, ph = rnd() * 6.28;
    const d = Array.from({ length: pts }, (_, k) => { const a = (k / pts) * 6.283; const rr = r + Math.sin(a * 3 + ph) * wob + Math.cos(a * 2 + i) * wob * 0.6; return `${(cx + Math.cos(a) * rr * 1.6).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`; });
    return `<polygon points="${d.join(" ")}" />`;
  }).join("");
  return `<svg class="cover-art" viewBox="0 0 300 128" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="${CROP_HUE[s.crop] || "var(--cherry)"}" stroke-width="1.1" opacity=".55">${rings}</g></svg>`;
}

function card(s) {
  const cover = s.photo
    ? `<img src="${esc(photoSrc(s, ""))}" alt="" loading="lazy">`
    : `${coverArt(s)}${s.altitude_masl ? `<span class="alt">${esc(s.altitude_masl[1].toLocaleString("en"))}<small> masl</small></span>` : ""}`;
  const facts = [headline(s), s.traceability && s.traceability !== "farm" ? TRACE_LABEL[s.traceability] : "", fmtAlt(s.altitude_masl), (s.varieties || []).slice(0, 2).join(", "), (s.process || []).join(" · ")].filter(Boolean);
  return `<a class="card" href="${href(s)}" data-crop="${esc(s.crop)}" data-country="${esc(s.country)}" data-kind="${esc(s.kind)}">
  <div class="cover">${cover}${tagFor(s)}</div>
  <div class="body">
    <div class="place">${flag(s.country)} ${esc(countryName.of(s.country))}${s.region ? ` · ${esc(s.region)}` : ""}</div>
    <h3>${esc(s.title)}</h3>
    <p>${esc(s.summary)}</p>
    ${facts.length ? `<div class="facts">${facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>` : ""}
    ${s.tasting_notes?.length ? `<div class="notes">${s.tasting_notes.map((n) => `<span>${esc(n)}</span>`).join("")}</div>` : ""}
    ${s.translations.length ? `<div class="facts"><span>Also in: ${s.translations.map((t) => esc(nativeName(t.language))).join(", ")}</span></div>` : ""}
    <footer>${s.kind === "origin"
      ? `Origin profile · ${s.farms.length ? `${s.farms.length} local ${s.farms.length === 1 ? "story" : "stories"}` : "waiting for farmer stories"}`
      : `${s.originStory ? `Part of ${esc(s.originStory.title.split(",")[0])} · ` : ""}Told by ${esc(TOLD[s.told_by])} · ${esc(s.producer)}`}</footer>
  </div>
</a>`;
}

function strip() {
  // One stop per country, placed by the average longitude of its stories.
  const MIN = -120, MAX = 160;
  const pct = (lon) => ((lon - MIN) / (MAX - MIN)) * 100;
  const byCountry = new Map();
  for (const s of stories) {
    // A story without its own coordinates is placed at its origin profile's.
    const coords = s.coords || s.originStory?.coords;
    if (!coords) continue;
    const c = byCountry.get(s.country) || { lons: [], n: 0 };
    c.lons.push(coords[1]); c.n++;
    byCountry.set(s.country, c);
  }
  const ticks = [];
  for (let l = -90; l <= 150; l += 30) ticks.push(`<div class="tick" style="left:${pct(l)}%">${Math.abs(l)}°${l < 0 ? "W" : l > 0 ? "E" : ""}</div>`);
  const stops = [...byCountry].map(([cc, c]) => {
    const lon = c.lons.reduce((a, b) => a + b, 0) / c.lons.length;
    return `<a class="stop" style="left:${pct(lon).toFixed(2)}%" href="#stories" data-jump="${esc(cc)}"><span>${esc(countryName.of(cc))}</span><span class="count">${c.n} ${c.n === 1 ? "story" : "stories"}</span><span class="stem"></span><span class="dot"></span></a>`;
  });
  return `<nav class="route" aria-label="Stories by longitude"><div class="route-inner">${ticks.join("")}<div class="route-belt"></div>${stops.join("")}</div></nav>
<p class="route-note">Each dot is a country, placed by longitude. The empty stretches are waiting for your stories.</p>`;
}

function indexPage() {
  const crops = [...new Set(stories.map((s) => s.crop))];
  const countries = [...new Set(stories.map((s) => s.country))].sort();
  const btn = (key, val, label, on = false) => `<button type="button" data-${key}="${esc(val)}" aria-pressed="${on}">${esc(label)}</button>`;
  return `${head("Open Origin", "Open, community-written stories of coffee, cocoa, tea, spices, vanilla, honey and palm sugar, told from where they grow.", "")}
<main>
<section class="hero" style="border-top:0"><div class="wrap">
  <div class="eyebrow">An open collection · ${stories.length} stories · ${countries.length} ${countries.length === 1 ? "country" : "countries"}</div>
  <h1>Every cup, bar and jar starts with <em>someone's</em> harvest.</h1>
  <p class="lede">Open Origin collects the stories behind coffee, cocoa, tea, spices, vanilla, honey and palm sugar: the land, the process and the people, told in their own words. Anyone can read them, reuse them and add their own.</p>
  <div class="cta"><a class="btn primary" href="${SUBMIT}">Share a story</a><a class="btn" href="#stories">Read the stories</a></div>
  ${strip()}
</div></section>

<section id="stories"><div class="wrap">
  <div class="section-head"><div class="eyebrow">The collection</div><h2>Stories from the farms</h2>
  <p>Each origin has a profile of its land and history, and below it the stories of the farmers and movements who work there. We are starting in the Indonesian archipelago, with coffee, cocoa, tea, spices, vanilla, honey and palm sugar.</p></div>
  <div class="filters" role="group" aria-label="Filter stories">
    ${btn("country", "all", "All", true)}
    ${countries.map((c) => btn("country", c, `${flag(c)} ${countryName.of(c)}`)).join("")}
    ${crops.length > 1 ? crops.map((c) => btn("crop", c, CROPS[c].label)).join("") : ""}
  </div>
  <h3 class="group-title">Origins <span>Profiles of growing regions</span></h3>
  <div class="cards">${origins.map(card).join("\n")}</div>
  <h3 class="group-title" id="voices">Farmers &amp; movements <span>Each farm tells its origin differently</span></h3>
  ${voices.length
    ? `<div class="cards">${voices.map(card).join("\n")}</div>`
    : `<div class="empty"><p><strong>The first farmer stories are still to come.</strong> Two farms on the same hill can grow something completely different: another slope, another process, another family. That difference is what Open Origin is for. Grow coffee, cocoa, tea or spices, keep bees or tap palms, or work with people who do? Tell their story.</p><a class="btn primary" href="${SUBMIT}">Share a farmer story</a></div>`}
</div></section>

${knowledge.length ? `<section id="learn"><div class="wrap">
  <div class="section-head"><div class="eyebrow">Learn</div><h2>What the words mean</h2>
  <p>The species, processes and terms you meet in the stories, explained. Anyone can add or improve an entry.</p></div>
  ${["species", "process", "variety", "term"].filter((t) => knowledge.some((k) => k.type === t)).map((t) => `
  <h3 class="group-title">${{ species: "Species", process: "Processes", variety: "Varieties", term: "Terms" }[t]}</h3>
  <div class="learn-grid">${knowledge.filter((k) => k.type === t).map((k) => `<a class="learn-item" href="learn/${k.crop}/${k.slug}/"><h4>${esc(k.title)}</h4>${k.latin ? `<i>${esc(k.latin)}</i>` : ""}<p>${esc(k.summary)}</p></a>`).join("")}</div>`).join("")}
</div></section>` : ""}

<section id="contribute"><div class="wrap">
  <div class="section-head"><div class="eyebrow">Contribute</div><h2>Tell us where it grows</h2>
  <p>Farmers, cooperatives, roasters and researchers are all welcome. You don't need to know code: fill in a form and we turn it into a page.</p></div>
  <div class="steps">
    <div><b>Step 1</b><h3>Fill in the form</h3><p>Where it grows, who grows it, how it is processed, and the story in any language.</p></div>
    <div><b>Step 2</b><h3>Ask for consent</h3><p>Everyone named or pictured must agree. Locations are rounded so no one's home can be found.</p></div>
    <div><b>Step 3</b><h3>We review</h3><p>A maintainer checks the details with you and turns your submission into a story page.</p></div>
    <div><b>Step 4</b><h3>It goes live</h3><p>Your story is published under CC BY 4.0 with your name on it.</p></div>
  </div>
  <div class="cta"><a class="btn primary" href="${SUBMIT}">Share a story</a><a class="btn" href="${REPO}/blob/main/CONTRIBUTING.md">Contributor guide</a></div>
</div></section>
</main>
<script>
const buttons = document.querySelectorAll(".filters button");
function apply(btn) {
  buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  const country = btn.dataset.country, crop = btn.dataset.crop;
  document.querySelectorAll("#stories .card").forEach((c) => {
    c.hidden = (country && country !== "all" && c.dataset.country !== country) || (crop && c.dataset.crop !== crop);
  });
}
buttons.forEach((b) => b.addEventListener("click", () => apply(b)));
document.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", () => {
  const b = document.querySelector('.filters button[data-country="' + a.dataset.jump + '"]');
  if (b) apply(b);
}));
</script>
${foot}`;
}

function learnPage(k) {
  const prefix = "../../../";
  const related = stories.filter((s) => s.crop === k.crop && (s.species === k.slug || (s.process || []).includes(k.slug)
    || (k.type === "variety" && (s.varieties || []).some((v) => varietyFor(s.crop, v) === k))));
  const fact = (label, v) => (v ? `<div><dt>${label}</dt><dd>${esc(v)}</dd></div>` : "");
  const facts = k.type === "variety" ? `<dl class="passport">
      ${fact("Species", k.species)}${fact("Lineage", k.lineage)}${fact("Also called", (k.aliases || []).filter((a) => a !== k.title).join(", "))}
      ${fact("Stature", k.stature)}${fact("Yield", k.yield_potential)}${fact("Cup quality", k.quality_potential)}
      ${fact("Leaf rust", k.leaf_rust)}${fact("Best at", fmtAlt(k.altitude_masl))}
    </dl>` : "";
  return `${head(`${k.title} · Open Origin`, k.summary, prefix)}
<main><div class="wrap">
<article class="story">
  <div>
    <a class="back" href="${prefix}#learn">← Learn</a>
    <h1 style="margin-top:18px">${esc(k.title)}</h1>
    ${k.latin ? `<div class="where"><i>${esc(k.latin)}</i></div>` : ""}
    <span class="species movement">${esc(CROPS[k.crop].label)} · ${esc(k.type)}</span>
    <p style="margin-top:20px">${esc(k.summary)}</p>
    ${facts}
  </div>
  <div class="prose">
    <div class="text">${cite(marked.parse(k.body), (k.sources || []).length)}</div>
    ${related.length ? `<h2 class="journey-title">Stories with ${esc(k.title.toLowerCase())}</h2><div class="cards">${related.map((r) => card(r).replace(`href="${href(r)}"`, `href="${prefix}${href(r)}"`)).join("")}</div>` : ""}
    ${sourceList(k.sources || [])}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc(k.file)}">Improve this entry</a></p>
  </div>
</article>
</div></main>
${foot}`;
}

// Renders a story in its original language (t = null) or in one of its translations.
// A party (processed_by, sold_by) is a name, or a producer id that links to the profile.
const party = (v, prefix) => { const p = producers.find((x) => String(x.id) === String(v)); return p ? `<a href="${prefix}${producerHref(p)}">${esc(p.name)}</a>` : esc(v); };
// here: the story whose page shows the table, so its own name is not repeated in "From".
const lotTable = (list, prefix, here = null) => `<div class="table-wrap"><table class="lots"><thead><tr><th>Lot</th><th>What it is</th><th>Quality</th><th>Tested by</th></tr></thead><tbody>
    ${list.map((l) => { const crop = l.pathCrop; const from = l.linked.filter((x) => x !== here); return `<tr id="${esc(l.id)}"><td class="lot-name"><strong>${esc(l.name || l.date)}</strong><span class="muted">${l.name ? `${esc(l.date)} · ` : ""}<code>${esc(l.id)}</code>${l.quantity_kg ? ` · ${esc(l.quantity_kg)} kg` : ""}${l.traceability ? ` · ${esc(TRACE_LABEL[l.traceability])}` : ""}</span></td>
      <td>${[l.form ? pretty(l.form) : "", (l.process || []).map(pretty).join(" · "), (l.varieties || []).map((v) => { const k = varietyFor(crop, v); return k ? `<a class="term" href="${prefix}learn/${k.crop}/${k.slug}/">${esc(v)}</a>` : esc(v); }).join(", ")].filter(Boolean).map((x) => `<div>${x.startsWith("<") ? x : esc(x)}</div>`).join("")}
        ${from.length ? `<div class="muted">${l.linked.length > 1 ? "Blend of" : "From"} ${from.map((x) => `<a href="${prefix}${href(x)}">${esc(x.producer)}</a>`).join(", ")}${here && l.linked.length > 1 ? " and this one" : ""}</div>` : ""}
        ${here && l.owner ? `<div class="muted">Filed by ${party(l.owner.id, prefix)}</div>` : ""}
        ${l.processed_by ? `<div class="muted">Processed by ${party(l.processed_by, prefix)}</div>` : ""}${l.roasted_by ? `<div class="muted">Roasted by ${party(l.roasted_by, prefix)}</div>` : ""}${l.sold_by ? `<div class="muted">Sold by ${party(l.sold_by, prefix)}</div>` : ""}</td>
      <td>${Object.entries(l.quality || {}).map(([k, v]) => `<span class="q">${esc(qText(crop, k, v))}</span>`).join("") || `<span class="muted">Not measured</span>`}</td>
      <td>${l.quality && Object.keys(l.quality).length ? esc(l.tested_by || "Self-reported") : ""}${l.certificate ? `<br><a href="${esc(l.certificate)}">Certificate</a>` : ""}${(l.sources || []).map((u, i) => `<br><a href="${esc(u)}">Source${l.sources.length > 1 ? ` ${i + 1}` : ""}</a>`).join("")}</td></tr>
      ${l.notes ? `<tr class="lot-notes"><td colspan="4">${esc(l.notes)}</td></tr>` : ""}`; }).join("")}
    </tbody></table></div>`;

function storyPage(s, t = null) {
  const prefix = t ? "../../../../../" : "../../../../";
  const v = t ? { ...s, ...Object.fromEntries(["title", "summary", "region", "tasting_notes"].filter((k) => t[k]).map((k) => [k, t[k]])), body: t.body, language: t.language } : s;
  const journeyText = (j, i) => (t?.journey ? t.journey[i] : j.text);
  const row = (k, val) => (val ? `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>` : "");
  const rowHtml = (k, html) => (html ? `<div><dt>${k}</dt><dd>${html}</dd></div>` : "");
  const sources = (Array.isArray(s.sources) ? s.sources : []).filter(isHttpUrl);
  const storyRoot = t ? "../" : "";
  const langs = [{ lang: s.language, href: storyRoot || "./" }, ...s.translations.map((x) => ({ lang: x.language, href: `${storyRoot}${x.language}/` }))];
  const switcher = langs.length > 1
    ? `<nav class="langs" aria-label="Read in another language">${langs.map((l) => l.lang === v.language
        ? `<span aria-current="page">${esc(nativeName(l.lang))}</span>`
        : `<a href="${l.href}" hreflang="${esc(l.lang)}" lang="${esc(l.lang)}">${esc(nativeName(l.lang))}</a>`).join("")}</nav>`
    : "";
  const dir = dirOf(v.language);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: v.title,
    description: v.summary,
    inLanguage: v.language,
    license: "https://creativecommons.org/licenses/by/4.0/",
    isPartOf: { "@type": "WebSite", name: "Open Origin" },
    about: { "@type": "Thing", name: CROPS[s.crop].label },
    author: { "@type": s.told_by === "farmer" ? "Person" : "Organization", name: s.producer },
    contentLocation: {
      "@type": "Place",
      name: s.region || countryName.of(s.country),
      address: { "@type": "PostalAddress", addressRegion: s.region, addressCountry: s.country },
      ...(s.coords && { geo: { "@type": "GeoCoordinates", latitude: s.coords[0], longitude: s.coords[1] } }),
    },
    ...(t && { translator: { "@type": "Person", name: t.translator }, translationOfWork: { "@type": "Article", headline: s.title, inLanguage: s.language } }),
  };
  const ldTag = `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n`;
  return `${head(`${v.title} · Open Origin`, v.summary, prefix, ldTag)}
<main><div class="wrap">
<article class="story">
  <div>
    <a class="back" href="${prefix}#stories">← All stories</a>
    <h1 style="margin-top:18px" lang="${esc(v.language)}" dir="${dir}">${esc(v.title)}</h1>
    <div class="where">${flag(s.country)} ${esc(countryName.of(s.country))}${v.region ? ` · <span lang="${esc(v.language)}">${esc(v.region)}</span>` : ""}</div>
    ${s.kind === "movement"
      ? `<span class="species movement">${esc(CROPS[s.crop].label)} · Movement</span>`
      : `<span class="species ${esc(s.species || s.crop)}">${esc(CROPS[s.crop].label)}${s.species ? ` · ${esc(pretty(s.species))}` : ""}</span>`}
    ${switcher}
    <dl class="passport">
      ${rowHtml("Producer", s.producerProfile ? `${s.producerProfile.logo ? `<img class="org-logo small" src="${esc(photoSrc({ photo: s.producerProfile.logo }, prefix))}" alt="">` : ""}<a class="term" href="${prefix}${producerHref(s.producerProfile)}">${esc(s.producer)}</a>` : esc(s.producer))}
      ${row("Altitude", fmtAlt(s.altitude_masl))}
      ${rowHtml("Varieties", (s.varieties || []).map((v) => { const k = varietyFor(s.crop, v); return k ? `<a class="term" href="${prefix}learn/${k.crop}/${k.slug}/">${esc(v)}</a>` : esc(v); }).join(", "))}
      ${rowHtml("Species", s.species ? termLink(s.crop, s.species, prefix, pretty(s.species)) : "")}
      ${rowHtml("Process", (s.process || []).map((p) => termLink(s.crop, p, prefix)).join(", "))}
      ${row("Harvest", s.harvest)}
      ${row("Traceability", s.traceability && TRACE_LABEL[s.traceability])}
      ${row("Tastes of", (v.tasting_notes || []).join(", "))}
      ${row("Told by", TOLD[s.told_by])}
      ${rowHtml("ID", `<a href="${prefix}s/${esc(s.id)}/"><code>${esc(s.id)}</code></a>`)}
      ${row("Told in", nativeName(s.language))}
      ${t ? row("Translated by", t.translator) : ""}
      ${row("Added by", s.contributor)}
    </dl>
  </div>
  <div class="prose">
    ${s.photo ? `<figure class="cover" style="margin:0 0 24px"><img src="${esc(photoSrc(s, prefix))}" alt=""><figcaption>Photo: ${esc(s.photo_credit)}</figcaption></figure>` : ""}
    <div class="text" lang="${esc(v.language)}" dir="${dir}">${cite(marked.parse(v.body), sources.length)}</div>
    ${s.journey?.length ? `<h2 class="journey-title">${esc(CROPS[s.crop].journey)}</h2><ol class="journey" lang="${esc(v.language)}" dir="${dir}">${s.journey.map((j, i) => `<li><span class="stage">${esc(j.stage === "brew" ? CROPS[s.crop].use : STAGE_LABEL[j.stage])}</span><p>${esc(journeyText(j, i))}</p></li>`).join("")}</ol>` : ""}
    ${s.lots.length ? `<h2 class="journey-title">Lots</h2>
    <p class="part-of">A lot is one harvest, shipment or production run, the thing a buyer actually buys. Process, variety and quality belong to the lot, so each one is listed on its own. ${(([slug, label] = CROPS[s.crop].grading || []) => (slug && learnHref(s.crop, slug) ? termLink(s.crop, slug, prefix, label) : ""))()}</p>
    ${lotTable(s.lots, prefix, s)}` : ""}
    ${s.kind === "origin" ? `<h2 class="journey-title">Farmers from this origin</h2>${s.farms.length
      ? `<div class="cards">${s.farms.map((f) => card(f).replace(`href="${href(f)}"`, `href="${prefix}${href(f)}"`)).join("")}</div>`
      : `<div class="empty"><p>No farmer has told their own story from here yet. Every farm in this region grows it a little differently.</p><a class="btn primary" href="${submitFor(s)}">Tell a farm's story</a></div>`}` : ""}
    ${s.originStory ? `<p class="part-of">Part of the origin <a href="${prefix}${href(s.originStory)}">${esc(s.originStory.title)}</a></p>` : ""}
    ${sourceList(sources)}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc((t || s).file)}">Suggest an edit</a> · <a href="${REPO}/issues/new?template=translation.yml&amp;title=${encodeURIComponent(`[Translation] ${s.title}`)}">Translate this story</a></p>
  </div>
</article>
</div></main>
${foot}`;
}

const PTYPE = { farmer: "Farmer", group: "Producer group", estate: "Estate", processor: "Processing facility", roaster: "Roaster" };
function producerPage(p) {
  const prefix = "../../";
  const row = (k, val) => (val ? `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>` : "");
  const rowHtml = (k, html) => (html ? `<div><dt>${k}</dt><dd>${html}</dd></div>` : "");
  const crops = [...new Set([...(p.crops || []), ...p.stories.map((s) => s.crop)])];
  const grown = [...new Map(p.stories.flatMap((s) => (s.varieties || []).map((v) => [`${s.crop}:${v.toLowerCase()}`, { crop: s.crop, name: v }]))).values()];
  const lotsOf = p.stories.filter((s) => s.lots.length);
  // Lots this producer processed or sold for someone else's story.
  const handled = lots.filter((l) => !l.linked.some((x) => p.stories.includes(x)) && (l.owner === p || [l.processed_by, l.roasted_by, l.sold_by].some((v) => String(v) === String(p.id))));
  return `${head(`${p.name} · Open Origin`, p.body ? p.body.slice(0, 160) : `${p.name}, ${countryName.of(p.pathCountry.toUpperCase())}`, prefix)}
<main><div class="wrap">
<article class="story">
  <div class="meta">
    <p class="eyebrow"><a href="${prefix}">Open Origin</a> · ${esc(PTYPE[p.type] || "Producer")}</p>
    ${p.logo ? `<img class="org-logo" src="${esc(photoSrc({ photo: p.logo }, prefix))}" alt="${esc(p.name)} logo">` : ""}
    <h1>${esc(p.name)}</h1>
    <div class="where">${flag(p.pathCountry)} ${esc(countryName.of(p.pathCountry.toUpperCase()))}${p.region ? ` · ${esc(p.region)}` : ""}${p.village ? ` · ${esc(p.village)}` : ""}</div>
    <dl class="passport">
      ${row("Type", PTYPE[p.type])}
      ${row(["roaster", "processor"].includes(p.type) ? "Works with" : "Grows", crops.map((c) => CROPS[c]?.label || c).join(", "))}
      ${rowHtml("Varieties", grown.map((g) => { const k = varietyFor(g.crop, g.name); return k ? `<a class="term" href="${prefix}learn/${k.crop}/${k.slug}/">${esc(g.name)}</a>` : esc(g.name); }).join(", "))}
      ${row("Growing since", p.since)}
      ${row("Farm size", p.farm_size_ha ? `${p.farm_size_ha} ha` : "")}
      ${row("Members", p.members ? `${p.members.toLocaleString("en")} farmers` : "")}
      ${rowHtml("ID", `<code>${esc(p.id)}</code>`)}
      ${rowHtml("Website", p.website ? `<a href="${esc(p.website)}">${esc(String(p.website).replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>` : "")}
    </dl>
  </div>
  <div class="prose">
    ${p.photo ? `<figure class="cover" style="margin:0 0 24px"><img src="${esc(photoSrc(p, prefix))}" alt=""><figcaption>Photo: ${esc(p.photo_credit)}</figcaption></figure>` : ""}
    ${p.body ? `<div class="text">${cite(marked.parse(p.body), (p.sources || []).length)}</div>` : ""}
    <h2 class="journey-title">Stories</h2>
    ${p.stories.length ? `<div class="cards">${p.stories.map((r) => card(r).replace(`href="${href(r)}"`, `href="${prefix}${href(r)}"`)).join("")}</div>`
      : `<div class="empty"><p>No stories linked to this profile yet.</p></div>`}
    ${lotsOf.map((s) => `<h2 class="journey-title">Lots · ${esc(s.title)}</h2>${lotTable(s.lots, prefix, s)}`).join("")}
    ${handled.length ? `<h2 class="journey-title">${p.stories.length ? "Other lots" : "Lots"}</h2><p class="part-of">Lots ${esc(p.name)} grew, processed, roasted or sold.</p>${lotTable(handled, prefix)}` : ""}
    ${p.consent === "public" ? `<p class="part-of">This profile was put together only from what has already been published about ${esc(p.name)}; see the sources below. If this is you, you can correct, complete or remove it.</p>` : ""}
    ${sourceList(p.sources || [])}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc(p.file)}">Improve this profile</a></p>
  </div>
</article>
</div></main>
${foot}`;
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await copyFile(path.join(SITE, "style.css"), path.join(DIST, "style.css"));
await copyFile(path.join(SITE, "logo.svg"), path.join(DIST, "logo.svg"));
await cp(path.join(SITE, "brand"), path.join(DIST, "brand"), { recursive: true });
try { await access(path.join(ROOT, "photos")); await cp(path.join(ROOT, "photos"), path.join(DIST, "photos"), { recursive: true }); } catch {}
await writeFile(path.join(DIST, "index.html"), indexPage());
for (const s of stories) {
  const dir = path.join(DIST, href(s));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), storyPage(s));
  for (const t of s.translations) {
    await mkdir(path.join(dir, t.language), { recursive: true });
    await writeFile(path.join(dir, t.language, "index.html"), storyPage(s, t));
  }
}
for (const k of knowledge) {
  const dir = path.join(DIST, "learn", k.crop, k.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), learnPage(k));
}
for (const p of producers) {
  const dir = path.join(DIST, producerHref(p));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), producerPage(p));
}
// Permalinks: /s/<id>/ always leads to the story, producer or lot, even after its file is renamed. The same page is
// also written for the ways people type a code (small letters, no "-"), so l-kpbjf525-d and LKPBJF525D work too.
const redirect = (title, to) => `<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><link rel="canonical" href="${to}"><meta http-equiv="refresh" content="0; url=${to}"><a href="${to}">${esc(title)}</a>`;
for (const [pid, title, to] of [...stories.map((s) => [s.id, s.title, `../../${href(s)}`]), ...producers.map((p) => [p.id, p.name, `../../${producerHref(p)}`]),
  ...lots.map((l) => [l.id, l.name || `Lot ${l.id}, ${l.date}`, `../../${lotHref(l)}`])]) {
  const bare = String(pid).replace(/-/g, "");
  for (const spelling of new Set([pid, pid.toLowerCase(), bare, bare.toLowerCase()])) {
    const dir = path.join(DIST, "s", spelling);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), redirect(title, to));
  }
}
await writeFile(path.join(DIST, "s", "index.html"), redirect("Look up a code", "../codes/"));

// "How to read a code", with a box that checks a code and opens it. pages/ ships with the code, like site/.
const LOOKUP_TEXT = {
  en: { shape: "A code is a letter (O, S, P or L), 8 characters and a check character, e.g. L-KPBJF525-D.", typo: ": the check character does not match, so this code was probably mistyped.",
    none: (id, k) => `${id} is a valid ${k} code, but no ${k} with this code is published yet.`, kind: { O: "origin", S: "story", P: "producer", L: "lot" } },
  id: { shape: "Kode terdiri dari satu huruf (O, S, P atau L), 8 karakter dan satu karakter cek, misalnya L-KPBJF525-D.", typo: ": karakter ceknya tidak cocok, jadi kode ini kemungkinan salah ketik.",
    none: (id, k) => `${id} adalah kode ${k} yang sah, tapi belum ada ${k} dengan kode ini yang diterbitkan.`, kind: { O: "origin", S: "cerita", P: "produsen", L: "lot" } },
};
const lookupJs = (lang) => `<script>
(() => {
  const C = ${JSON.stringify(ID_CHARS)}, SALT = ${JSON.stringify(ID_SALT)}, T = ${JSON.stringify({ ...LOOKUP_TEXT[lang], none: undefined })}, none = ${LOOKUP_TEXT[lang].none.toString()};
  const check = (p, b) => { let t = SALT[p]; for (let i = 0; i < 8; i++) t += (i + 1) * C.indexOf(b[i]); return C[(31 - (t % 31)) % 31]; };
  const form = document.getElementById("lookup"), out = document.getElementById("lookup-out"), base = form.dataset.base;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const raw = form.code.value.toUpperCase().replace(/[\\s._-]/g, "");
    const m = raw.match(new RegExp("^([OSPL])([" + C + "]{8})([" + C + "])$"));
    if (!m) { out.textContent = T.shape; return; }
    const id = m[1] + "-" + m[2] + "-" + m[3];
    if (check(m[1], m[2]) !== m[3]) { out.textContent = id + T.typo; return; }
    const res = await fetch(base + "s/" + id + "/", { method: "HEAD" }).catch(() => null);
    if (res && res.ok) location.href = base + "s/" + id + "/";
    else out.textContent = none(id, T.kind[m[1]]);
  });
})();
</script>`;
const PAGES = path.join(path.dirname(SITE), "pages");
for (const [file, sub, lang, label, button] of [["codes.md", "codes", "en", "Look up a code", "Open"], ["codes.id.md", "codes/id", "id", "Cari kode", "Buka"]]) {
  const { data, content } = matter(await readFile(path.join(PAGES, file), "utf8"));
  const prefix = "../".repeat(sub.split("/").length);
  const other = lang === "en" ? `<a href="id/">Bahasa Indonesia</a>` : `<a href="../">English</a>`;
  const dir = path.join(DIST, sub);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), `${head(`${data.title} · Open Origin`, data.summary, prefix)}
<main><div class="wrap">
<article class="story" lang="${lang}">
  <div>
    <a class="back" href="${prefix}">← Open Origin</a>
    <h1 style="margin-top:18px">${esc(data.title)}</h1>
    <p style="margin-top:20px">${esc(data.summary)}</p>
    <form id="lookup" class="lookup" data-base="${prefix}"><label for="code">${label}</label>
      <div><input id="code" name="code" placeholder="L-KPBJF525-D" autocomplete="off" spellcheck="false" autocapitalize="characters"><button>${button}</button></div>
      <p id="lookup-out" role="status"></p></form>
    <p class="eyebrow">${other}</p>
  </div>
  <div class="prose codes"><div class="text">${marked.parse(content).replace("<p>[[code-anatomy]]</p>", `<div class="code-anatomy" aria-label="L-KPBJF525-D"><span class="p">L</span>-<span class="b">KPBJF525</span>-<span class="c">D</span></div>`)}</div></div>
</article>
</div></main>
${lookupJs(lang)}
${foot}`);
}
await writeFile(path.join(DIST, ".nojekyll"), "");
await exportData();

// Open data export: a Frictionless Data Package (https://datapackage.org) with CSV + JSON, regenerated on every build.
async function exportData() {
  const lotJson = (l) => ({ id: l.id, name: l.name ?? null, date: String(l.date), form: l.form ?? null, process: l.process ?? null, varieties: l.varieties ?? null,
    quantity_kg: l.quantity_kg ?? null, traceability: l.traceability ?? null, processed_by: l.processed_by ?? null, roasted_by: l.roasted_by ?? null, sold_by: l.sold_by ?? null,
    quality: l.quality ?? null, tested_by: l.tested_by ?? null, certificate: l.certificate ?? null, sources: l.sources || [], notes: l.notes || null, stories: l.linked.map((x) => x.id), producer: l.owner?.id ?? null, url: lotHref(l) });
  const FIELDS = [
    ["id", "string", "permanent story id, e.g. S-K7M2XQ9P-V"], ["path", "string", "crop/country/slug of the story file"], ["kind", "string", "origin, farm or movement"], ["origin", "string", "id of the origin profile a farm or movement belongs to"],
    ["crop", "string", "coffee, cocoa, tea, spice, vanilla, honey or sugar"], ["country", "string", "ISO 3166-1 alpha-2"], ["region", "string", ""],
    ["producer", "string", ""], ["species", "string", ""], ["altitude_min_masl", "integer", ""], ["altitude_max_masl", "integer", ""],
    ["varieties", "string", "separated by ; "], ["process", "string", "separated by ; "], ["harvest", "string", ""],
    ["tasting_notes", "string", "separated by ; "], ["latitude", "number", "rounded to 2 decimals"], ["longitude", "number", "rounded to 2 decimals"],
    ["traceability", "string", "farm, group, region, country or blend"], ["lots", "integer", "number of lots"],
    ["title", "string", ""], ["summary", "string", ""], ["language", "string", "BCP 47 code of the original story"],
    ["translations", "string", "available translation languages, separated by ; "], ["told_by", "string", ""], ["contributor", "string", ""],
    ["url", "string", "path of the story page, relative to the site root"],
  ];
  const id = (s) => s.id;
  const pathOf = (s) => `${s.crop}/${s.pathCountry}/${s.slug}`;
  const rows = stories.map((s) => ({
    id: id(s), path: pathOf(s), kind: s.kind, origin: s.originStory ? id(s.originStory) : "", crop: s.crop, country: s.country, region: s.region || "",
    producer: s.producer, species: s.species || "", altitude_min_masl: s.altitude_masl?.[0] ?? "", altitude_max_masl: s.altitude_masl?.[1] ?? "",
    varieties: (s.varieties || []).join("; "), process: (s.process || []).join("; "), harvest: s.harvest || "",
    tasting_notes: (s.tasting_notes || []).join("; "), latitude: s.coords?.[0] ?? "", longitude: s.coords?.[1] ?? "",
    traceability: s.traceability || "", lots: s.lots.length,
    title: s.title, summary: s.summary, language: s.language, translations: s.translations.map((t) => t.language).join("; "),
    told_by: s.told_by, contributor: s.contributor, url: href(s),
  }));
  const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const csv = [FIELDS.map((f) => f[0]).join(","), ...rows.map((r) => FIELDS.map((f) => cell(r[f[0]])).join(","))].join("\n") + "\n";
  const full = stories.map((s) => ({
    id: id(s), path: pathOf(s), kind: s.kind, origin: s.originStory ? id(s.originStory) : null,
    ...Object.fromEntries(["crop", "country", "region", "producer", "species", "altitude_masl", "varieties", "process", "harvest", "tasting_notes", "coords", "title", "summary", "language", "told_by", "contributor", "journey", "sources", "traceability", "profile"].filter((k) => s[k] !== undefined).map((k) => [k, s[k]])),
    story: s.body, url: href(s),
    lots: s.lots.map(lotJson),
    translations: s.translations.map((t) => ({ language: t.language, title: t.title, summary: t.summary, translator: t.translator, story: t.body, ...(t.journey && { journey: t.journey }) })),
  }));
  await mkdir(path.join(DIST, "data"), { recursive: true });
  await writeFile(path.join(DIST, "data", "stories.csv"), csv);
  await writeFile(path.join(DIST, "data", "stories.json"), JSON.stringify(full, null, 2));
  // Lots: one row per lot, plus quality in long format (one row per measured value) so every crop fits one table.
  const LFIELDS = [["id", "string", "permanent lot id, e.g. L-K7M2XQ9P-P"], ["story_ids", "string", "stories the lot comes from, separated by ; (several for a blend)"], ["producer", "string", "producer profile the lot is filed under"], ["crop", "string", ""], ["name", "string", ""],
    ["date", "string", "YYYY, YYYY-MM or YYYY-MM-DD"], ["form", "string", "state the lot is sold in; the options depend on the crop"], ["process", "string", "separated by ; "], ["varieties", "string", "separated by ; "],
    ["quantity_kg", "number", ""], ["traceability", "string", ""], ["processed_by", "string", "name or producer id"], ["roasted_by", "string", "name or producer id"], ["sold_by", "string", "name or producer id"],
    ["tested_by", "string", ""], ["certificate", "string", ""]];
  const lrows = lots.map((l) => ({ id: l.id, story_ids: l.linked.map(id).join("; "), producer: l.owner?.id || "", crop: l.pathCrop, name: l.name || "", date: String(l.date), form: l.form || "",
    process: (l.process || []).join("; "), varieties: (l.varieties || []).join("; "), quantity_kg: l.quantity_kg ?? "", traceability: l.traceability || "",
    processed_by: l.processed_by || "", roasted_by: l.roasted_by || "", sold_by: l.sold_by || "", tested_by: l.tested_by || "", certificate: l.certificate || "" }));
  await writeFile(path.join(DIST, "data", "lots.csv"), [LFIELDS.map((f) => f[0]).join(","), ...lrows.map((r) => LFIELDS.map((f) => cell(r[f[0]])).join(","))].join("\n") + "\n");
  const QFIELDS = [["lot_id", "string", "permanent lot id"], ["crop", "string", ""], ["date", "string", "YYYY, YYYY-MM or YYYY-MM-DD"],
    ["field", "string", "quality field, see the crop's list in CONTRIBUTING.md"], ["value", "string", ""], ["unit", "string", ""], ["tested_by", "string", ""]];
  const qrows = lots.flatMap((l) => Object.entries(l.quality || {}).map(([k, v]) => ({
    lot_id: l.id, crop: l.pathCrop, date: String(l.date), field: k, value: v, unit: qField(l.pathCrop, k)?.[2] || "", tested_by: l.tested_by || "",
  })));
  await writeFile(path.join(DIST, "data", "lot-quality.csv"), [QFIELDS.map((f) => f[0]).join(","), ...qrows.map((r) => QFIELDS.map((f) => cell(r[f[0]])).join(","))].join("\n") + "\n");
  const varieties = knowledge.filter((k) => k.type === "variety").map((k) => ({
    id: `${k.crop}/${k.slug}`, name: k.title, crop: k.crop, species: k.species, lineage: k.lineage ?? null, aliases: k.aliases || [],
    stature: k.stature ?? null, yield_potential: k.yield_potential ?? null, quality_potential: k.quality_potential ?? null,
    leaf_rust: k.leaf_rust ?? null, altitude_masl: k.altitude_masl ?? null, summary: k.summary, sources: k.sources || [],
  }));
  await writeFile(path.join(DIST, "data", "varieties.json"), JSON.stringify(varieties, null, 2));
  const prods = producers.map((p) => ({
    id: String(p.id), file: p.file, name: p.name, country: p.pathCountry.toUpperCase(), type: p.type ?? null, region: p.region ?? null, village: p.village ?? null,
    since: p.since ?? null, farm_size_ha: p.farm_size_ha ?? null, members: p.members ?? null, website: p.website ?? null, consent: p.consent, sources: p.sources || [], about: p.body || null,
    stories: p.stories.map((s) => id(s)), url: producerHref(p),
  }));
  await writeFile(path.join(DIST, "data", "producers.json"), JSON.stringify(prods, null, 2));
  const pkg = {
    name: "open-origin-stories",
    title: "Open Origin stories",
    description: "Community-written stories of coffee, cocoa, tea, spices, vanilla, honey and palm sugar, told from where they grow.",
    homepage: REPO,
    version: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    licenses: [{ name: "CC-BY-4.0", path: "https://creativecommons.org/licenses/by/4.0/", title: "Creative Commons Attribution 4.0" }],
    resources: [
      { name: "stories", path: "data/stories.csv", format: "csv", mediatype: "text/csv", encoding: "utf-8",
        schema: { fields: FIELDS.map(([name, type, description]) => ({ name, type, ...(description && { description }) })), primaryKey: "id" } },
      { name: "stories-full", path: "data/stories.json", format: "json", mediatype: "application/json",
        description: "Every story with its full text, farm-to-cup journey and translations." },
      { name: "lots", path: "data/lots.csv", format: "csv", mediatype: "text/csv", encoding: "utf-8",
        description: "Lots: one harvest, shipment or production run each, with process, form and who processed or sold it.",
        schema: { fields: LFIELDS.map(([name, type, description]) => ({ name, type, ...(description && { description }) })), primaryKey: "id" } },
      { name: "lot-quality", path: "data/lot-quality.csv", format: "csv", mediatype: "text/csv", encoding: "utf-8",
        description: "Quality measurements per lot, one row per value.",
        schema: { fields: QFIELDS.map(([name, type, description]) => ({ name, type, ...(description && { description }) })) } },
      { name: "producers", path: "data/producers.json", format: "json", mediatype: "application/json",
        description: "Profiles of farmers, producer groups, estates, processing facilities and roasters, and the stories linked to them." },
      { name: "varieties", path: "data/varieties.json", format: "json", mediatype: "application/json",
        description: "Plant varieties with species, lineage, local names and agronomic traits." },
    ],
  };
  await writeFile(path.join(DIST, "datapackage.json"), JSON.stringify(pkg, null, 2));
}
const nT = stories.reduce((n, s) => n + s.translations.length, 0);
console.log(`✓ Built ${stories.length} stories and ${nT} translations into dist/`);
