// Builds the static site into dist/ from the story files. No framework: plain HTML + one stylesheet.
import { mkdir, writeFile, copyFile, cp, rm, access, readFile } from "node:fs/promises";
import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { LANGS, DEFAULT_LANG, strings } from "./i18n.ts";
import { buildApi } from "./api.ts";
import { SCENES, sceneSvg } from "./scenes.ts";
import { ID_CHARS, ID_SALT, areaOf, plusCode, h3Cell, H3_RES, isHttpUrl, licenseUrl, QUALITY, TRACEABILITY, loadLots, validateLot, resolveLot, loadProducers, validateProducer, linkProducers, duplicateIds, ROOT, CROPS, RTL, loadStories, validateStory, validateTranslation, linkOrigins, loadKnowledge, validateKnowledge } from "./lib.ts";
// A broken file (e.g. bad YAML) stops the run with one readable line, not a stack trace.
for (const ev of ["unhandledRejection", "uncaughtException"]) process.on(ev, (e) => { console.error(`\n✗ ${e.message}`); process.exit(1); });

// The site is built once per interface language (scripts/i18n.ts): English at the root, the others under /<lang>/.
// setLang() switches the words every template below uses. UP leads from the language's root back to the site root,
// where the shared files live (style.css, brand/, photos/, s/, data/, codes.json).
let LANG = DEFAULT_LANG, T = strings(LANG), UP = "";
let countryName = new Intl.DisplayNames(["en"], { type: "region" });
function setLang(lang) {
  LANG = lang; T = strings(lang); UP = lang === DEFAULT_LANG ? "" : "../";
  countryName = new Intl.DisplayNames([T.locale], { type: "region" });
}
const num = (n) => Number(n).toLocaleString(T.locale);
// "apis-dorsata" -> "Apis dorsata", "dried-beans" -> "Dried beans"
const pretty = (x) => { const t = String(x).replace(/-/g, " "); return t[0].toUpperCase() + t.slice(1); };
// A value written as a slug in the data (washed, dried-beans), in the page's language.
const term = (crop, slug, fallback = pretty(slug)) => T.terms[`${crop}:${slug}`] ?? T.terms[slug] ?? fallback;
const cropLabel = (c) => T.crops[c]?.label ?? CROPS[c]?.label ?? c;
const cropWord = (c, k) => T.crops[c]?.[k] ?? CROPS[c]?.[k];
const tagFor = (s) => (s.kind === "movement"
  ? `<span class="species movement">${T.movement}</span>`
  : `<span class="species ${esc(s.species || s.crop)}">${esc(s.species ? term(s.crop, s.species) : cropLabel(s.crop))}</span>`);

const DIST = path.join(ROOT, "dist");
// The stylesheet ships with the code, not the content, so a fixture folder (OPEN_ORIGIN_ROOT) builds too.
const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site");

// Stories come from the public, so Markdown is rendered without raw HTML and with only safe link targets.
const safeHref = (h) => /^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(String(h).trim()) && !/^\s*(javascript|data|vbscript):/i.test(String(h));
marked.use({
  renderer: {
    html(token: any) { return esc(typeof token === "string" ? token : token.text ?? token.raw ?? ""); },
    link(href: any, title, text) {
      const h = typeof href === "object" ? href.href : href;
      const label = typeof href === "object" ? href.text : text;
      return safeHref(h) ? `<a href="${esc(h)}">${label}</a>` : label;
    },
    image(href: any, title, text) {
      const h = typeof href === "object" ? href.href : href;
      const alt = typeof href === "object" ? href.text : text;
      return /^https:/i.test(String(h)) ? `<img src="${esc(h)}" alt="${esc(alt)}" loading="lazy">` : esc(alt);
    },
  },
});
const REPO = "https://github.com/glc-works/open-origin";
// Where the site is published; absolute links in the API and feeds start here.
const SITE_URL = (process.env.OPEN_ORIGIN_SITE_URL || "https://glc-works.github.io/open-origin/").replace(/\/?$/, "/");
const SUBMIT = `${REPO}/issues/new?template=story.yml`;

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const flag = (cc) => String(cc).toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
const fmtAlt = (a) => (Array.isArray(a) ? `${num(a[0])}${a[1] !== a[0] ? `–${num(a[1])}` : ""} ${T.masl}` : "");

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
const sourceList = (urls) => (urls.length ? `<p class="eyebrow" style="margin-top:2em">${T.sources}</p><ol class="sources">${urls.map((u, i) => `<li id="src-${i + 1}"><a href="${esc(u)}">${esc(u)}</a></li>`).join("")}</ol>` : "");
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
const qField = (crop, k) => (QUALITY[crop] || []).find((f) => f[0] === k);
const qText = (crop, k, v) => { const f = qField(crop, k); return f ? `${T.qfields[k] ?? f[1]} ${v}${f[2] ? ` ${f[2]}` : ""}` : `${k} ${v}`; };
const origins = stories.filter((s) => s.kind === "origin");
const voices = stories.filter((s) => s.kind !== "origin");
const submitFor = (o) => `${SUBMIT}&crop=${encodeURIComponent(o.crop)}&country=${encodeURIComponent(o.country)}&origin=${encodeURIComponent(o.slug)}&region=${encodeURIComponent(o.region || "")}`;
const nativeName = (code) => { try { return new Intl.DisplayNames([code], { type: "language" }).of(code); } catch { return code; } };
// A language's name in the page's language ("Inggris" on an Indonesian page), for labels rather than switchers.
const langLabel = (code) => { try { return new Intl.DisplayNames([T.locale], { type: "language" }).of(code); } catch { return code; } };
const dirOf = (lang) => (RTL.includes(String(lang).split("-")[0]) ? "rtl" : "ltr");
const href = (s) => `stories/${s.crop}/${s.pathCountry}/${s.slug}/`;
// The version of a story or Learn entry in the page's language, when someone has translated it.
const inLang = (x) => (LANG !== DEFAULT_LANG && x.language !== LANG ? (x.translations || []).find((t) => t.language === LANG) : undefined);
// On a page in another language, a card leads straight to the story's translation into it.
const readHref = (s) => (inLang(s) ? `${href(s)}${LANG}/` : href(s));
const producerHref = (p) => `producers/${p.id}/`;
const photoSrc = (s, prefix) => (/^https?:\/\//.test(s.photo) ? s.photo : prefix + UP + String(s.photo).replace(/^\/+/, ""));
// Credit line for a photo: who took it, and for a photo from elsewhere its licence and the page it came from.
const photoSourceName = (u) => { try { const h = new URL(u).hostname; return h === "wikimedia.org" || h.endsWith(".wikimedia.org") ? "Wikimedia Commons" : h.replace(/^www\./, ""); } catch { return T.source.toLowerCase(); } };
// A copy kept in photos/ of a photo from elsewhere is resized for the web; CC 4.0 asks for changes to be marked.
const photoResized = (x) => x.photo_source && !/^https?:\/\//.test(x.photo) ? T.resized : "";
const photoCreditText = (x) => [`${T.photo}: ${x.photo_credit}`, photoResized(x), x.photo_license, x.photo_source && photoSourceName(x.photo_source)].filter(Boolean).join(" · ");
function photoCreditHtml(x) {
  const lic = x.photo_license && (licenseUrl(x.photo_license) ? `<a href="${esc(licenseUrl(x.photo_license))}" rel="license">${esc(x.photo_license)}</a>` : esc(x.photo_license));
  const src = x.photo_source && `<a href="${esc(x.photo_source)}">${esc(photoSourceName(x.photo_source))}</a>`;
  return [`${T.photo}: ${esc(x.photo_credit)}`, photoResized(x), lic, src].filter(Boolean).join(" · ");
}
const photoFigure = (x, prefix) => `<figure class="cover" style="margin:0 0 24px"><img src="${esc(photoSrc(x, prefix))}" alt=""><figcaption>${photoCreditHtml(x)}</figcaption></figure>`;
const photoLd = (x, prefix) => x.photo && { image: { "@type": "ImageObject", contentUrl: photoSrc(x, prefix), creditText: x.photo_credit,
  ...(x.photo_license && licenseUrl(x.photo_license) && { license: licenseUrl(x.photo_license) }), ...(x.photo_source && { acquireLicensePage: x.photo_source }) } };

// The mark is inline so it follows light and dark mode; site/logo.svg is the same mark for the favicon. More versions: site/brand/.
const LOGO = `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M52.1 19.2C53.0 20.6 56.2 24.2 57.4 27.2C58.7 30.2 59.8 33.8 59.8 37.2C59.8 40.5 58.9 44.4 57.4 47.4C55.8 50.4 53.1 53.2 50.4 55.2C47.7 57.1 44.3 58.4 41.2 59.3C38.0 60.2 34.7 60.4 31.6 60.3C28.4 60.3 25.2 59.8 22.2 58.9C19.3 57.9 16.2 56.5 13.7 54.6C11.2 52.7 8.8 50.1 7.2 47.4C5.6 44.7 4.4 41.4 3.9 38.2C3.3 35.0 3.3 31.5 3.9 28.3C4.4 25.1 5.5 21.7 7.1 18.8C8.8 15.9 11.1 13.0 13.7 10.9C16.4 8.9 19.8 7.3 23.0 6.6C26.2 5.9 29.9 6.1 33.1 6.8C36.2 7.5 40.5 9.9 41.9 10.6" fill="none" stroke="var(--forest)" stroke-width="4.6" stroke-linecap="round"/><path d="M49.4 22.6C49.8 23.7 51.7 26.7 52.1 28.8C52.4 30.9 52.1 33.4 51.4 35.5C50.8 37.5 49.6 39.5 48.3 41.2C47.1 42.8 45.5 44.2 43.9 45.4C42.3 46.6 40.5 47.7 38.7 48.4C36.8 49.1 34.8 49.6 32.8 49.7C30.8 49.8 28.6 49.5 26.7 48.9C24.8 48.2 23.0 47.1 21.4 45.8C19.8 44.5 18.4 42.9 17.2 41.2C16.1 39.5 15.1 37.5 14.6 35.4C14.0 33.4 13.7 31.0 14.0 28.9C14.3 26.8 15.1 24.4 16.3 22.6C17.4 20.9 19.2 19.3 21.0 18.2C22.8 17.1 25.0 16.5 27.0 16.1C28.9 15.8 30.9 15.8 32.8 15.9C34.7 15.9 37.6 16.4 38.5 16.5" fill="none" stroke="var(--leaf)" stroke-width="4.6" stroke-linecap="round"/><path d="M43.6 28.0C43.5 28.5 43.6 30.0 43.5 30.9C43.4 31.8 43.1 32.7 42.7 33.6C42.4 34.4 41.9 35.2 41.3 35.9C40.8 36.6 40.1 37.3 39.3 37.8C38.6 38.3 37.7 38.7 36.8 39.0C35.9 39.2 34.9 39.3 34.0 39.2C33.1 39.2 32.2 39.0 31.3 38.7C30.4 38.3 29.5 37.9 28.8 37.4C28.0 36.8 27.2 36.1 26.7 35.3C26.1 34.6 25.6 33.6 25.3 32.7C25.1 31.7 25.0 30.6 25.2 29.7C25.3 28.7 25.7 27.7 26.2 26.9C26.7 26.1 27.4 25.4 28.1 24.8C28.8 24.2 29.5 23.7 30.3 23.3C31.1 22.9 31.8 22.5 32.7 22.2C33.5 21.9 34.9 21.7 35.4 21.6" fill="none" stroke="var(--origin)" stroke-width="4.6" stroke-linecap="round"/><circle cx="35.6" cy="29.6" r="3.7" fill="var(--origin)"/></svg>`;
// here: the page's path from its language root, so the header can link to the same page in the other languages.
function head(title, description, prefix, extra = "", here = "") {
  const other = LANGS.filter((l) => l !== LANG).map((l) => {
    const to = `${prefix}${UP}${l === DEFAULT_LANG ? "" : `${l}/`}${here}`;
    return { l, to, name: strings(l).name };
  });
  return `<!doctype html>
<html lang="${LANG}">
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
<link rel="stylesheet" href="${prefix}${UP}style.css">
<link rel="icon" href="${prefix}${UP}logo.svg" type="image/svg+xml">
${other.map((o) => `<link rel="alternate" hreflang="${o.l}" href="${o.to}">\n`).join("")}<link rel="alternate" type="application/atom+xml" title="Open Origin: what is new" href="${prefix}${UP}feed.xml">
<link rel="alternate" type="application/feed+json" title="Open Origin: what is new" href="${prefix}${UP}feed.json">
${extra}</head>
<body>
<header class="bar"><div class="wrap">
  <a class="brand" href="${prefix}">${LOGO}<b><span>open</span> origin</b></a>
  <nav><a href="${prefix}#stories">${T.nav.stories}</a><a href="${prefix}#learn">${T.nav.learn}</a><a href="${prefix}codes/">${T.nav.codes}</a><a href="${prefix}#contribute">${T.nav.share}</a><a href="${prefix}api/">${T.nav.data}</a><a href="${REPO}">${T.nav.github}</a>${other.map((o) => `<a class="lang-switch" href="${o.to}" hreflang="${o.l}" lang="${o.l}" title="${esc(`${strings(o.l).switchTo} ${o.name}`)}">${o.l.toUpperCase()}</a>`).join("")}</nav>
</div></header>`;
}

const footer = () => `<footer class="site-footer"><div class="wrap">
  <p>${T.footTagline}</p>
  <p>${T.footLicence}</p>
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
const CROP_HUE = { coffee: "#A8261B", cocoa: "#7A4A2B", tea: "var(--leaf)", spice: "#A0632A", vanilla: "#6B5A2E", honey: "#B7862A", sugar: "#8A5A3C" };
function coverArt(s) {
  let h = 0; for (const c of String(s.id || s.slug)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const cx = 60 + rnd() * 180, cy = 20 + rnd() * 60;
  const rings = Array.from({ length: 9 }, (_, i) => {
    const r = 14 + i * 16, pts = 28, wob = 4 + rnd() * 6, ph = rnd() * 6.28;
    const d = Array.from({ length: pts }, (_, k) => { const a = (k / pts) * 6.283; const rr = r + Math.sin(a * 3 + ph) * wob + Math.cos(a * 2 + i) * wob * 0.6; return `${(cx + Math.cos(a) * rr * 1.6).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`; });
    return `<polygon points="${d.join(" ")}" />`;
  }).join("");
  return `<svg class="cover-art" viewBox="0 0 300 128" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="${CROP_HUE[s.crop] || "var(--accent)"}" stroke-width="1.1" opacity=".55">${rings}</g></svg>`;
}

// prefix: from the page the card sits on to its language root.
function card(s, prefix = "") {
  const tr = inLang(s);
  const v = tr ? { ...s, title: tr.title, summary: tr.summary, region: tr.region || s.region, tasting_notes: tr.tasting_notes || s.tasting_notes } : s;
  const cover = s.photo
    ? `<img src="${esc(photoSrc(s, prefix))}" alt="" title="${esc(photoCreditText(s))}" loading="lazy">`
    : `${coverArt(s)}${s.altitude_masl ? `<span class="alt">${esc(num(s.altitude_masl[1]))}<small> ${T.masl}</small></span>` : ""}`;
  const facts = [headline(s), s.traceability && s.traceability !== "farm" ? T.trace[s.traceability] : "", fmtAlt(s.altitude_masl), (s.varieties || []).slice(0, 2).join(", "), (s.process || []).map((p) => term(s.crop, p, p)).join(" · ")].filter(Boolean);
  return `<a class="card" href="${prefix}${readHref(s)}" data-crop="${esc(s.crop)}" data-country="${esc(s.country)}" data-kind="${esc(s.kind)}">
  <div class="cover">${cover}${tagFor(s)}</div>
  <div class="body">
    <div class="place">${flag(s.country)} ${esc(countryName.of(s.country))}${v.region ? ` · ${esc(v.region)}` : ""}</div>
    <h3${tr ? ` lang="${LANG}"` : ""}>${esc(v.title)}</h3>
    <p${tr ? ` lang="${LANG}"` : ""}>${esc(v.summary)}</p>
    ${facts.length ? `<div class="facts">${facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>` : ""}
    ${v.tasting_notes?.length ? `<div class="notes">${v.tasting_notes.map((n) => `<span>${esc(n)}</span>`).join("")}</div>` : ""}
    ${tr ? `<div class="facts"><span>${T.inYourLanguage}</span></div>`
      : s.translations.length ? `<div class="facts"><span>${T.alsoIn}: ${s.translations.map((t) => esc(nativeName(t.language))).join(", ")}</span></div>` : ""}
    <footer>${s.kind === "origin"
      ? `${T.originProfile} · ${s.farms.length ? T.localStories(s.farms.length) : T.waitingStories}`
      : `${s.originStory ? `${T.partOf} ${esc((inLang(s.originStory)?.title || s.originStory.title).split(",")[0])} · ` : ""}${T.toldBy} ${esc(T.told[s.told_by])} · ${esc(s.producer)}`}</footer>
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
  for (let l = -90; l <= 150; l += 30) ticks.push(`<div class="tick" style="left:${pct(l)}%">${Math.abs(l)}°${l < 0 ? T.west : l > 0 ? T.east : ""}</div>`);
  const stops = [...byCountry].map(([cc, c]) => {
    const lon = c.lons.reduce((a, b) => a + b, 0) / c.lons.length;
    return `<a class="stop" style="left:${pct(lon).toFixed(2)}%" href="#stories" data-jump="${esc(cc)}"><span>${esc(countryName.of(cc))}</span><span class="count">${T.nStories(c.n)}</span><span class="stem"></span><span class="dot"></span></a>`;
  });
  return `<nav class="route" aria-label="${T.routeLabel}"><div class="route-inner">${ticks.join("")}<div class="route-belt"></div>${stops.join("")}</div></nav>
<p class="route-note">${T.routeNote}</p>`;
}

function indexPage() {
  const crops = [...new Set(stories.map((s) => s.crop))];
  const countries = [...new Set(stories.map((s) => s.country))].sort();
  const btn = (key, val, label, on = false) => `<button type="button" data-${key}="${esc(val)}" aria-pressed="${on}">${esc(label)}</button>`;
  return `${head("Open Origin", T.siteDescription, "")}
<main>
<section class="hero" style="border-top:0"><div class="wrap">
  <div class="eyebrow">${T.eyebrowCount(stories.length, countries.length)}</div>
  <h1>${T.heroTitle}</h1>
  <p class="lede">${T.heroLede}</p>
  <div class="cta"><a class="btn primary" href="${SUBMIT}">${T.shareStory}</a><a class="btn" href="#stories">${T.readStories}</a></div>
  ${strip()}
</div></section>

<section id="stories"><div class="wrap">
  <div class="section-head"><div class="eyebrow">${T.collection}</div><h2>${T.storiesTitle}</h2>
  <p>${T.storiesLede}</p></div>
  <div class="filters" role="group" aria-label="${T.filterLabel}">
    ${btn("country", "all", T.all, true)}
    ${countries.map((c) => btn("country", c, `${flag(c)} ${countryName.of(c)}`)).join("")}
    ${crops.length > 1 ? crops.map((c) => btn("crop", c, cropLabel(c))).join("") : ""}
  </div>
  <h3 class="group-title">${T.originsTitle} <span>${T.originsSub}</span></h3>
  <div class="cards">${origins.map((s) => card(s)).join("\n")}</div>
  <h3 class="group-title" id="voices">${T.voicesTitle} <span>${T.voicesSub}</span></h3>
  ${voices.length
    ? `<div class="cards">${voices.map((s) => card(s)).join("\n")}</div>`
    : `<div class="empty"><p>${T.noVoices}</p><a class="btn primary" href="${SUBMIT}">${T.shareFarmerStory}</a></div>`}
</div></section>

${knowledge.length ? `<section id="learn"><div class="wrap">
  <div class="section-head"><div class="eyebrow">${T.nav.learn}</div><h2>${T.learnTitle}</h2>
  <p>${T.learnLede}</p></div>
  ${["species", "process", "variety", "term"].filter((t) => knowledge.some((k) => k.type === t)).map((t) => `
  <h3 class="group-title">${T.learnTypes[t]}</h3>
  <div class="learn-grid">${knowledge.filter((k) => k.type === t).map((k) => { const v = inLang(k) || k; return `<a class="learn-item" href="learn/${k.crop}/${k.slug}/"${v !== k ? ` lang="${LANG}"` : ""}><h4>${esc(v.title)}</h4>${k.latin ? `<i>${esc(k.latin)}</i>` : ""}<p>${esc(v.summary)}</p></a>`; }).join("")}</div>`).join("")}
</div></section>` : ""}

<section id="contribute"><div class="wrap">
  <div class="section-head"><div class="eyebrow">${T.nav.contribute}</div><h2>${T.contributeTitle}</h2>
  <p>${T.contributeLede}</p></div>
  <div class="steps">
    ${T.steps.map(([h, p], i) => `<div><b>${T.step(i + 1)}</b><h3>${h}</h3><p>${p}</p></div>`).join("\n    ")}
  </div>
  <div class="cta"><a class="btn primary" href="${SUBMIT}">${T.shareStory}</a><a class="btn" href="${REPO}/blob/main/CONTRIBUTING.md">${T.contributorGuide}</a></div>
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
${footer()}`;
}

function learnPage(k) {
  const prefix = "../../../";
  const related = stories.filter((s) => s.crop === k.crop && (s.species === k.slug || (s.process || []).includes(k.slug)
    || (k.type === "variety" && (s.varieties || []).some((v) => varietyFor(s.crop, v) === k))));
  const fact = (label, v) => (v ? `<div><dt>${label}</dt><dd>${esc(v)}</dd></div>` : "");
  const trait = (v) => (v ? term(k.crop, v, v) : "");
  const F = T.fields;
  const facts = k.type === "variety" ? `<dl class="passport">
      ${fact(F.species, k.species)}${fact(F.lineage, k.lineage)}${fact(F.alsoCalled, (k.aliases || []).filter((a) => a !== k.title).join(", "))}
      ${fact(F.stature, trait(k.stature))}${fact(F.yield, trait(k.yield_potential))}${fact(F.cupQuality, trait(k.quality_potential))}
      ${fact(F.leafRust, trait(k.leaf_rust))}${fact(F.bestAt, fmtAlt(k.altitude_masl))}
    </dl>` : "";
  // The entry in the page's language when it has been translated; otherwise the English entry with a note.
  const tr = inLang(k);
  const v = tr || k;
  const lang = tr ? LANG : DEFAULT_LANG;
  return `${head(`${v.title} · Open Origin`, v.summary, prefix, "", `learn/${k.crop}/${k.slug}/`)}
<main><div class="wrap">
<article class="story">
  <div lang="${lang}">
    <a class="back" href="${prefix}#learn">${T.learnBack}</a>
    <h1 style="margin-top:18px">${esc(v.title)}</h1>
    ${k.latin ? `<div class="where"><i>${esc(k.latin)}</i></div>` : ""}
    <span class="species movement" lang="${LANG}">${esc(cropLabel(k.crop))} · ${esc(T.learnType[k.type] || k.type)}</span>
    <p style="margin-top:20px">${esc(v.summary)}</p>
    ${facts}
  </div>
  <div class="prose">
    ${LANG !== DEFAULT_LANG && !tr ? `<p class="part-of">${T.translatedFrom}</p>` : ""}
    <div class="text" lang="${lang}">${cite(marked.parse(v.body), (k.sources || []).length)}</div>
    ${related.length ? `<h2 class="journey-title">${esc(T.storiesWith(v.title))}</h2><div class="cards">${related.map((r) => card(r, prefix)).join("")}</div>` : ""}
    ${sourceList(k.sources || [])}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc(v.file)}">${T.improveEntry}</a></p>
  </div>
</article>
</div></main>
${footer()}`;
}

// Renders a story in its original language (t = null) or in one of its translations.
// A party (processed_by, sold_by) is a name, or a producer id that links to the profile.
const party = (v, prefix) => { const p = producers.find((x) => String(x.id) === String(v)); return p ? `<a href="${prefix}${producerHref(p)}">${esc(p.name)}</a>` : esc(v); };
// here: the story whose page shows the table, so its own name is not repeated in "From".
// Public codes for the story's area, linked where a public page exists.
const placeCodes = (s) => ({ ...areaOf(s), plus_code: s.coords ? plusCode(s.coords) : "", h3_cell: s.coords ? h3Cell(s.coords) : "" });
function areaHtml(s) {
  const a = placeCodes(s);
  const parts = [
    ...a.iso3166_2.map((v) => `<span title="ISO 3166-2">${esc(v)}</span>`),
    ...a.admin_codes.map((v) => `<span title="${T.nationalCode(s.country === "ID")}">${esc(v)}</span>`),
    ...a.wikidata.map((v) => `<a href="https://www.wikidata.org/wiki/${esc(v)}" title="Wikidata">${esc(v)}</a>`),
    ...a.geonames.map((v) => `<a href="https://www.geonames.org/${esc(v)}" title="GeoNames">GeoNames ${esc(v)}</a>`),
    a.plus_code && `<a href="https://plus.codes/${encodeURIComponent(a.plus_code)}" title="${T.plusTitle}">${esc(a.plus_code)}</a>`,
    a.h3_cell && `<span title="${T.h3Title(H3_RES)}">H3 ${esc(a.h3_cell)}</span>`,
  ].filter(Boolean);
  return parts.length ? `<span class="area-codes">${parts.join(" ")}</span>` : "";
}
// What a producer grows or works with: its own list, its stories and the lots filed under it.
const producerCrops = (p) => [...new Set([...(p.crops || []), ...p.stories.map((x) => x.crop), ...lots.filter((l) => l.owner === p).map((l) => l.pathCrop)])];
// A code is always shown with its crop beside it (L-KPBJF525-D · COFFEE): the code itself carries no meaning,
// so it never has to change, but a reader still sees at once what it is.
const codeTag = (id, crops) => `<code class="code">${esc(id)}</code>${[].concat(crops || []).map((c) => `<span class="crop-tag">${esc(cropLabel(c))}</span>`).join("")}`;
const andList = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} ${T.and} ${xs.at(-1)}` : xs[0] || "");
const lotTable = (list, prefix, here = null) => `<div class="table-wrap"><table class="lots"><thead><tr><th>${T.lot}</th><th>${T.specification}</th><th>${T.quality}</th><th>${T.sources}</th></tr></thead><tbody>
    ${list.map((l) => { const crop = l.pathCrop; const from = l.linked.filter((x) => x !== here); return `<tr id="${esc(l.id)}"><td class="lot-name" data-label="${T.lot}"><strong>${esc(l.name || l.date)}</strong><span class="muted">${l.name ? `${esc(l.date)} · ` : ""}${codeTag(l.id, crop)}${l.quantity_kg ? ` · ${esc(num(l.quantity_kg))} kg` : ""}${l.traceability ? ` · ${esc(T.trace[l.traceability])}` : ""}</span></td>
      <td data-label="${T.specification}">${[l.form ? term(crop, l.form) : "", (l.process || []).map((p) => term(crop, p)).join(" · "), (l.varieties || []).map((v) => { const k = varietyFor(crop, v); return k ? `<a class="term" href="${prefix}learn/${k.crop}/${k.slug}/">${esc(v)}</a>` : esc(v); }).join(", ")].filter(Boolean).map((x) => (x.startsWith("<") ? x : esc(x))).join(" · ")}
        ${from.length ? `<div class="muted">${here ? esc(T.blendedWith(cropLabel(crop).toLowerCase())) : l.linked.length > 1 ? T.blendFrom : T.from} ${andList(from.map((x) => `<a href="${prefix}${href(x)}">${esc(x.producer)}</a>`))}</div>` : ""}
        ${here && l.owner ? `<div class="muted">${T.filedBy} ${party(l.owner.id, prefix)}</div>` : ""}
        ${l.processed_by ? `<div class="muted">${T.processedBy} ${party(l.processed_by, prefix)}</div>` : ""}${l.roasted_by ? `<div class="muted">${T.roastedBy} ${party(l.roasted_by, prefix)}</div>` : ""}${l.sold_by ? `<div class="muted">${T.soldBy} ${party(l.sold_by, prefix)}</div>` : ""}</td>
      <td data-label="${T.quality}">${l.quality && Object.keys(l.quality).length
        ? `<div>${Object.entries(l.quality).map(([k, v]) => `<span class="q">${esc(qText(crop, k, v))}</span>`).join("")}</div><div class="muted">${l.tested_by ? `${T.testedBy} ${party(l.tested_by, prefix)}` : T.selfReported}</div>`
        : `<span class="muted">${T.notMeasured}</span>`}</td>
      <td data-label="${T.sources}">${[l.certificate ? `<a href="${esc(l.certificate)}">${T.certificate}</a>` : "",
        ...(l.sources || []).map((u, i) => `<a href="${esc(u)}">${T.source}${l.sources.length > 1 ? ` ${i + 1}` : ""}</a>`)].filter(Boolean).map((x) => `<div>${x}</div>`).join("")}</td></tr>
      ${l.notes ? `<tr class="lot-notes"><td colspan="4">${esc(l.notes)}</td></tr>` : ""}`; }).join("")}
    </tbody></table></div>`;

// ---- Illustrated journey and "at a glance" (story pages) ----
// A step's words in the page's language: the translation's text (a plain string, or { text, title, more, why, then, unit }).
const stepWords = (j, tj) => (tj == null ? j : typeof tj === "string" ? { ...j, text: tj } : { ...j, ...Object.fromEntries(Object.entries(tj).filter(([, v]) => v)) });
const citeLinks = (cite) => (cite || []).map((n) => `<sup class="cite"><a href="#src-${n}">[${n}]</a></sup>`).join("");
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
// "Oct–Jun" -> the twelve months, true where harvested. null when the text is not a simple month range.
function harvestMonths(h) {
  const m = String(h || "").toLowerCase().match(/^([a-z]{3})[a-z]*\s*[–-]\s*([a-z]{3})[a-z]*$/);
  if (!m) return null;
  const a = MONTHS.indexOf(m[1]), b = MONTHS.indexOf(m[2]);
  if (a < 0 || b < 0) return null;
  return MONTHS.map((_, i) => (a <= b ? i >= a && i <= b : i >= a || i <= b));
}
// Altitude, harvest calendar and process, drawn from the story's own fields. Shown only when there are at least two.
function glance(s, v, prefix) {
  const panels = [];
  if (Array.isArray(s.altitude_masl)) {
    const [lo, hi] = s.altitude_masl, top = Math.max(2500, hi + 300), y = (m) => 100 - (m / top) * 100;
    panels.push(`<figure class="g-panel"><svg viewBox="0 0 200 100" aria-hidden="true" preserveAspectRatio="none"><rect x="0" y="${y(hi)}" width="200" height="${y(lo) - y(hi)}" class="g-band"></rect><path d="M0 100 L60 ${y(hi * 0.7)} L90 ${y(hi * 0.55)} L130 ${y(hi * 1.05)} L200 100Z" class="g-hill"></path></svg>
      <figcaption><b>${esc(fmtAlt(s.altitude_masl))}</b><span>${T.aboveSea}</span></figcaption></figure>`);
  }
  const months = harvestMonths(s.harvest);
  if (months) {
    const fmt = new Intl.DateTimeFormat(T.locale, { month: "narrow" });
    panels.push(`<figure class="g-panel"><div class="g-cal" role="img" aria-label="${esc(`${T.fields.harvest}: ${s.harvest}`)}">${months.map((on, i) => `<span${on ? ' class="on"' : ""}>${esc(fmt.format(new Date(2026, i, 1)))}</span>`).join("")}</div>
      <figcaption><b>${esc(s.harvest)}</b><span>${T.fields.harvest}</span></figcaption></figure>`);
  }
  if (s.process?.length || s.species) {
    panels.push(`<figure class="g-panel g-words"><div>${[s.species ? termLink(s.crop, s.species, prefix, term(s.crop, s.species)) : "", ...(s.process || []).map((p) => termLink(s.crop, p, prefix, term(s.crop, p, p)))].filter(Boolean).join("<br>")}</div>
      <figcaption><b>${esc(cropLabel(s.crop))}</b><span>${s.varieties?.length ? esc(s.varieties.join(" · ")) : T.fields.process}</span></figcaption></figure>`);
  }
  return panels.length >= 2 ? `<section class="glance" aria-label="${T.glance}"><h2 class="eyebrow">${T.glance}</h2><div class="g-grid">${panels.join("")}</div></section>` : "";
}
// The journey as illustrated panels along one route, with a step bar. Only for stories whose steps name a scene.
function visualJourney(s, t, v, dir) {
  const steps = s.journey.map((j, i) => stepWords(j, t?.journey?.[i]));
  const label = (j) => j.title || (j.stage === "brew" ? cropWord(s.crop, "use") : T.stage[j.stage]);
  const bar = `<nav class="vj-steps" aria-label="${T.journeySteps}"><ol>${steps.map((j, i) => `<li><a href="#step-${i + 1}" data-dot="${i + 1}"><b>${i + 1}</b><span>${esc(label(j))}</span></a></li>`).join("")}</ol></nav>`;
  const stops = steps.map((j, i) => {
    const n = i + 1, art = j.scene ? sceneSvg(j.scene) : "";
    const count = j.count ? `<div class="vj-count" role="img" aria-label="${esc(`${j.count.from} → ${j.count.to} ${j.unit || j.count.unit}`)}"><span class="vj-num" data-from="${esc(j.count.from)}" data-to="${esc(j.count.to)}">${esc(num(j.count.to))}</span><span class="vj-unit">${esc(j.unit || j.count.unit)}</span><span class="vj-bar"><i style="width:${Math.round((j.count.to / Math.max(j.count.from, j.count.to)) * 100)}%"></i></span></div>` : "";
    return `<section class="vj-stop" id="step-${n}" aria-labelledby="step-${n}-h">
      <figure class="vj-panel${art ? "" : " plain"}">${art}${count}
        <figcaption class="vj-cap ${SCENES[j.scene]?.caption ?? "bl"}">
          <span class="eyebrow">${n} · ${esc(label(j))}</span>
          <h3 id="step-${n}-h">${esc(j.text)}</h3>
          ${j.more ? `<p>${esc(j.more)}${citeLinks(j.cite)}</p>` : ""}
          ${j.why ? `<details><summary>${T.why}</summary><p>${esc(j.why)}${j.more ? "" : citeLinks(j.cite)}</p></details>` : ""}
        </figcaption>
      </figure>
      ${j.then && n < steps.length ? `<div class="vj-link" aria-hidden="true"><svg viewBox="0 0 4 120" preserveAspectRatio="none"><path class="vj-route" d="M2 0 V120"></path><path class="vj-fill" pathLength="1" d="M2 0 V120"></path></svg><span>${esc(j.then)}</span></div>` : ""}
    </section>`;
  }).join("\n");
  return `<section class="vj" id="journey" aria-labelledby="journey-h" lang="${esc(v.language)}" dir="${dir}">
  ${bar}
  <header class="vj-head"><h2 id="journey-h">${esc(cropWord(s.crop, "journey"))}</h2><p>${T.journeyCue}</p></header>
  ${stops}
</section>
<script>${JOURNEY_JS}</script>`;
}
// Panels come alive as they scroll into view; the dashed route between them draws itself; the step bar follows.
// With reduced motion the page shows the finished pictures and moves nothing.
const JOURNEY_JS = `(() => {
  const stops = [...document.querySelectorAll(".vj-stop")], dots = [...document.querySelectorAll("[data-dot]")], fills = [...document.querySelectorAll(".vj-fill")];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("vj-js");
  const count = (el) => { const a = +el.dataset.from, b = +el.dataset.to, t0 = performance.now(); if (still) return;
    const f = (t) => { const k = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(a + (b - a) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add("in"); io.unobserve(e.target);
    const n = e.target.querySelector(".vj-num"); if (n) count(n); }), { threshold: 0.35 });
  stops.forEach((s) => io.observe(s));
  const onScroll = () => { const vh = innerHeight; let cur = -1;
    fills.forEach((r) => { const b = r.getBoundingClientRect(); const k = Math.max(0, Math.min(1, (vh * 0.85 - b.top) / (b.height + vh * 0.3))); r.style.strokeDashoffset = still ? 0 : 1 - k; });
    stops.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.5) cur = i; });
    dots.forEach((d, i) => { d.classList.toggle("done", i <= cur); if (i === cur) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); }); };
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();
})();`;

function storyPage(s, t = null) {
  const prefix = t ? "../../../../../" : "../../../../";
  const v = t ? { ...s, ...Object.fromEntries(["title", "summary", "region", "tasting_notes"].filter((k) => t[k]).map((k) => [k, t[k]])), body: t.body, language: t.language } : s;
  // On a page in another interface language, point to the story's translation into it when there is one.
  const own = LANG !== DEFAULT_LANG && v.language !== LANG && s.translations.some((x) => x.language === LANG) ? `${t ? "../" : ""}${LANG}/` : "";
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
    ...photoLd(s, prefix),
    author: { "@type": s.told_by === "farmer" ? "Person" : "Organization", name: s.producer },
    contentLocation: {
      "@type": "Place",
      name: s.region || countryName.of(s.country),
      address: { "@type": "PostalAddress", addressRegion: s.region, addressCountry: s.country },
      ...(s.coords && { geo: { "@type": "GeoCoordinates", latitude: s.coords[0], longitude: s.coords[1] } }),
      // One public id per source means it names this same area; several (e.g. two regencies) are places within it.
      ...(() => { const a = areaOf(s);
        const uris = [...a.wikidata.map((q) => `https://www.wikidata.org/wiki/${q}`), ...a.geonames.map((g) => `https://sws.geonames.org/${g}/`)];
        if (!uris.length) return {};
        return a.wikidata.length <= 1 && a.geonames.length <= 1 ? { sameAs: uris } : { containsPlace: uris.map((u) => ({ "@type": "Place", sameAs: u })) }; })(),
    },
    ...(t && { translator: { "@type": "Person", name: t.translator }, translationOfWork: { "@type": "Article", headline: s.title, inLanguage: s.language } }),
  };
  const ldTag = `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n`;
  const F = T.fields;
  const illustrated = s.journey?.some((j) => j.scene);
  return `${head(`${v.title} · Open Origin`, v.summary, prefix, ldTag, `${href(s)}${t ? `${t.language}/` : ""}`)}
<main><div class="wrap">
<article class="story">
  <div>
    <a class="back" href="${prefix}#stories">${T.allStories}</a>
    <h1 style="margin-top:18px" lang="${esc(v.language)}" dir="${dir}">${esc(v.title)}</h1>
    <div class="where">${flag(s.country)} ${esc(countryName.of(s.country))}${v.region ? ` · <span lang="${esc(v.language)}">${esc(v.region)}</span>` : ""}</div>
    ${s.kind === "movement"
      ? `<span class="species movement">${esc(cropLabel(s.crop))} · ${T.movement}</span>`
      : `<span class="species ${esc(s.species || s.crop)}">${esc(cropLabel(s.crop))}${s.species ? ` · ${esc(term(s.crop, s.species))}` : ""}</span>`}
    ${switcher}
    ${own ? `<p class="part-of"><a href="${own}" hreflang="${LANG}">${T.readTranslation}</a></p>` : ""}
    <dl class="passport">
      ${rowHtml(F.producer, s.producerProfile ? `${s.producerProfile.logo ? `<img class="org-logo small" src="${esc(photoSrc({ photo: s.producerProfile.logo }, prefix))}" alt="">` : ""}<a class="term" href="${prefix}${producerHref(s.producerProfile)}">${esc(s.producer)}</a>` : esc(s.producer))}
      ${row(F.altitude, fmtAlt(s.altitude_masl))}
      ${rowHtml(F.varieties, (s.varieties || []).map((v) => { const k = varietyFor(s.crop, v); return k ? `<a class="term" href="${prefix}learn/${k.crop}/${k.slug}/">${esc(v)}</a>` : esc(v); }).join(", "))}
      ${rowHtml(F.species, s.species ? termLink(s.crop, s.species, prefix, term(s.crop, s.species)) : "")}
      ${rowHtml(F.process, (s.process || []).map((p) => termLink(s.crop, p, prefix, term(s.crop, p, p))).join(", "))}
      ${row(F.harvest, s.harvest)}
      ${row(F.traceability, s.traceability && T.trace[s.traceability])}
      ${row(F.tastes, (v.tasting_notes || []).join(", "))}
      ${row(F.toldBy, T.told[s.told_by])}
      ${rowHtml(F.code, `<a href="${prefix}${UP}s/${esc(s.id)}/">${codeTag(s.id, s.crop)}</a>`)}
      ${rowHtml(F.areaCodes, areaHtml(s))}
      ${row(F.toldIn, langLabel(s.language))}
      ${t ? row(F.translatedBy, t.translator) : ""}
      ${row(F.addedBy, s.contributor === "open-origin" ? T.editorial : s.contributor)}
    </dl>
  </div>
  <div class="prose">
    ${s.photo ? photoFigure(s, prefix) : ""}
    ${glance(s, v, prefix)}
    ${illustrated ? `<p class="vj-teaser"><a href="#journey">${T.followJourney(s.journey.length)}</a></p>` : ""}
    <div class="text" lang="${esc(v.language)}" dir="${dir}">${cite(marked.parse(v.body), sources.length)}</div>
    ${illustrated ? `</div>
</article>
${visualJourney(s, t, v, dir)}
<div class="story story-after"><div></div>
  <div class="prose">` : ""}
    ${s.journey?.length && !illustrated ? `<h2 class="journey-title">${esc(cropWord(s.crop, "journey"))}</h2><ol class="journey" lang="${esc(v.language)}" dir="${dir}">${s.journey.map((j, i) => `<li><span class="stage" lang="${LANG}" dir="ltr">${esc(j.stage === "brew" ? cropWord(s.crop, "use") : T.stage[j.stage])}</span><p>${esc(journeyText(j, i))}</p></li>`).join("")}</ol>` : ""}
    ${s.lots.length ? `<h2 class="journey-title">${T.lots}</h2>
    <p class="part-of">${T.lotsIntro} ${(([slug] = CROPS[s.crop].grading || []) => (slug && learnHref(s.crop, slug) ? termLink(s.crop, slug, prefix, cropWord(s.crop, "grading") ?? CROPS[s.crop].grading[1]) : ""))()}</p>
    ${lotTable(s.lots, prefix, s)}` : ""}
    ${s.kind === "origin" ? `<h2 class="journey-title">${T.farmersFrom}</h2>${s.farms.length
      ? `<div class="cards">${s.farms.map((f) => card(f, prefix)).join("")}</div>`
      : `<div class="empty"><p>${T.noFarmers}</p><a class="btn primary" href="${submitFor(s)}">${T.tellFarm}</a></div>`}` : ""}
    ${s.originStory ? `<p class="part-of">${T.partOfOrigin} <a href="${prefix}${readHref(s.originStory)}">${esc(inLang(s.originStory)?.title || s.originStory.title)}</a></p>` : ""}
    ${sourceList(sources)}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc((t || s).file)}">${T.suggestEdit}</a> · <a href="${REPO}/issues/new?template=translation.yml&amp;title=${encodeURIComponent(`[Translation] ${s.title}`)}">${T.translateStory}</a></p>
  </div>
${illustrated ? "</div>" : "</article>"}
</div></main>
${footer()}`;
}

function producerPage(p) {
  const prefix = "../../";
  const row = (k, val) => (val ? `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>` : "");
  const rowHtml = (k, html) => (html ? `<div><dt>${k}</dt><dd>${html}</dd></div>` : "");
  const crops = producerCrops(p);
  const grown = [...new Map<string, { crop: string; name: string }>(p.stories.flatMap((s) => (s.varieties || []).map((v) => [`${s.crop}:${v.toLowerCase()}`, { crop: s.crop, name: v }]))).values()];
  const lotsOf = p.stories.filter((s) => s.lots.length);
  // Lots this producer processed or sold for someone else's story.
  const handled = lots.filter((l) => !l.linked.some((x) => p.stories.includes(x)) && (l.owner === p || [l.processed_by, l.roasted_by, l.sold_by, l.tested_by].some((v) => String(v) === String(p.id))));
  const F = T.fields;
  return `${head(`${p.name} · Open Origin`, p.body ? p.body.slice(0, 160) : `${p.name}, ${countryName.of(p.pathCountry.toUpperCase())}`, prefix, "", producerHref(p))}
<main><div class="wrap">
<article class="story">
  <div class="meta">
    <p class="eyebrow"><a href="${prefix}">Open Origin</a> · ${esc(T.ptype[p.type] || T.producerFallback)}</p>
    ${p.logo ? `<img class="org-logo" src="${esc(photoSrc({ photo: p.logo }, prefix))}" alt="${esc(p.name)} logo">` : ""}
    <h1>${esc(p.name)}</h1>
    <div class="where">${flag(p.pathCountry)} ${esc(countryName.of(p.pathCountry.toUpperCase()))}${p.region ? ` · ${esc(p.region)}` : ""}${p.village ? ` · ${esc(p.village)}` : ""}</div>
    <dl class="passport">
      ${row(F.type, T.ptype[p.type])}
      ${row(["roaster", "processor"].includes(p.type) ? F.worksWith : F.grows, crops.map(cropLabel).join(", "))}
      ${rowHtml(F.varieties, grown.map((g) => { const k = varietyFor(g.crop, g.name); return k ? `<a class="term" href="${prefix}learn/${k.crop}/${k.slug}/">${esc(g.name)}</a>` : esc(g.name); }).join(", "))}
      ${row(F.since, p.since)}
      ${row(F.farmSize, p.farm_size_ha ? `${num(p.farm_size_ha)} ha` : "")}
      ${row(F.members, p.members ? T.farmers(num(p.members)) : "")}
      ${rowHtml(F.code, codeTag(p.id, crops))}
      ${rowHtml(F.website, p.website ? `<a href="${esc(p.website)}">${esc(String(p.website).replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>` : "")}
    </dl>
  </div>
  <div class="prose">
    ${p.photo ? photoFigure(p, prefix) : ""}
    ${p.body ? `<div class="text">${cite(marked.parse(p.body), (p.sources || []).length)}</div>` : ""}
    <h2 class="journey-title">${T.storiesHead}</h2>
    ${p.stories.length ? `<div class="cards">${p.stories.map((r) => card(r, prefix)).join("")}</div>`
      : `<div class="empty"><p>${T.noLinkedStories}</p></div>`}
    ${lotsOf.map((s) => `<h2 class="journey-title">${T.lots} · ${esc(inLang(s)?.title || s.title)}</h2>${lotTable(s.lots, prefix, s)}`).join("")}
    ${handled.length ? `<h2 class="journey-title">${p.stories.length ? T.otherLots : T.lots}</h2><p class="part-of">${esc(T.lotsHandled(p.name, p.type === "lab"))}</p>${lotTable(handled, prefix)}` : ""}
    ${p.consent === "public" ? `<p class="part-of">${esc(T.publicProfile(p.name))}</p>` : ""}
    ${sourceList(p.sources || [])}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc(p.file)}">${T.improveProfile}</a></p>
  </div>
</article>
</div></main>
${footer()}`;
}

// "How to read a code", with a box that checks a code and opens it. pages/codes.md is the English text and
// pages/codes.<lang>.md a translation; a language without one shows the English text. pages/ ships with the code, like site/.
const LOOKUP_TEXT = {
  en: { shape: "A code is a letter (O, S, P or L), 8 characters and a check character, e.g. L-KPBJF525-D.", typo: ": the check character does not match, so this code was probably mistyped.",
    none: (id, k) => `${id} is a valid ${k} code, but no ${k} with this code is published yet.`, kind: { O: "origin", S: "story", P: "producer", L: "lot" } },
  id: { shape: "Kode terdiri dari satu huruf (O, S, P atau L), 8 karakter dan satu karakter cek, misalnya L-KPBJF525-D.", typo: ": karakter ceknya tidak cocok, jadi kode ini kemungkinan salah ketik.",
    none: (id, k) => `${id} adalah kode ${k} yang sah, tapi belum ada ${k} dengan kode ini yang diterbitkan.`, kind: { O: "origin", S: "cerita", P: "produsen", L: "lot" } },
};
// data-base is the language root (pages open in the reader's language); data-root holds codes.json.
const lookupJs = (lang) => `<script>
(() => {
  const C = ${JSON.stringify(ID_CHARS)}, SALT = ${JSON.stringify(ID_SALT)}, T = ${JSON.stringify({ ...LOOKUP_TEXT[lang], none: undefined })}, none = ${LOOKUP_TEXT[lang].none.toString()};
  const check = (p, b) => { let t = SALT[p]; for (let i = 0; i < 8; i++) t += (i + 1) * C.indexOf(b[i]); return C[(31 - (t % 31)) % 31]; };
  const form = document.getElementById("lookup"), out = document.getElementById("lookup-out"), base = form.dataset.base, root = form.dataset.root;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const raw = form.code.value.toUpperCase().replace(/[\\s._-]/g, "");
    const m = raw.match(new RegExp("^([OSPL])([" + C + "]{8})([" + C + "])$"));
    if (!m) { out.textContent = T.shape; return; }
    const id = m[1] + "-" + m[2] + "-" + m[3];
    if (check(m[1], m[2]) !== m[3]) { out.textContent = id + T.typo; return; }
    const codes = await fetch(root + "codes.json").then((r) => r.json()).catch(() => ({}));
    const hit = codes[id];
    if (!hit) { out.textContent = none(id, T.kind[m[1]]); return; }
    out.textContent = id + " · " + hit.crop_labels.join(", ").toUpperCase() + " · " + hit.title + " …";
    location.href = base + hit.url;
  });
})();
</script>`;
const PAGES = path.join(path.dirname(SITE), "pages");
async function codesPage() {
  const file = LANG === DEFAULT_LANG ? "codes.md" : `codes.${LANG}.md`;
  const translated = await access(path.join(PAGES, file)).then(() => true, () => false);
  const lang = translated ? LANG : DEFAULT_LANG;
  const { data, content } = matter(await readFile(path.join(PAGES, translated ? file : "codes.md"), "utf8"));
  const prefix = "../";
  return `${head(`${data.title} · Open Origin`, data.summary, prefix, "", "codes/")}
<main><div class="wrap">
<article class="story" lang="${lang}">
  <div>
    <a class="back" href="${prefix}">${T.backHome}</a>
    <h1 style="margin-top:18px">${esc(data.title)}</h1>
    <p style="margin-top:20px">${esc(data.summary)}</p>
    <form id="lookup" class="lookup" data-base="${prefix}" data-root="${prefix}${UP}"><label for="code">${T.lookupLabel}</label>
      <div><input id="code" name="code" placeholder="L-KPBJF525-D" autocomplete="off" spellcheck="false" autocapitalize="characters"><button>${T.lookupButton}</button></div>
      <p id="lookup-out" role="status"></p></form>
  </div>
  <div class="prose codes"><div class="text">${(marked.parse(content) as string).replace("<p>[[code-anatomy]]</p>", `<div class="code-anatomy" aria-label="L-KPBJF525-D"><span class="p">L</span>-<span class="b">KPBJF525</span>-<span class="c">D</span></div>`)}</div></div>
</article>
</div></main>
${lookupJs(LOOKUP_TEXT[LANG] ? LANG : DEFAULT_LANG)}
${footer()}`;
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await copyFile(path.join(SITE, "style.css"), path.join(DIST, "style.css"));
await copyFile(path.join(SITE, "logo.svg"), path.join(DIST, "logo.svg"));
await cp(path.join(SITE, "brand"), path.join(DIST, "brand"), { recursive: true });
try { await access(path.join(ROOT, "photos")); await cp(path.join(ROOT, "photos"), path.join(DIST, "photos"), { recursive: true }); } catch {}
// The API's own page: what the endpoints are and how to credit the data. The JSON itself is written by api.ts, once,
// at the site root. pages/api.<lang>.md is used where it exists, otherwise the English text.
async function apiPage() {
  const translated = LANG !== DEFAULT_LANG && await access(path.join(PAGES, `api.${LANG}.md`)).then(() => true, () => false);
  const { data, content } = matter(await readFile(path.join(PAGES, translated ? `api.${LANG}.md` : "api.md"), "utf8"));
  const prefix = "../", root = `${prefix}${UP}`;
  return `${head(`${data.title} · Open Origin`, data.summary, prefix, "", "api/")}
<main><div class="wrap">
<article class="story" lang="${translated ? LANG : DEFAULT_LANG}">
  <div>
    <a class="back" href="${prefix}">${T.backHome}</a>
    <h1 style="margin-top:18px">${esc(data.title)}</h1>
    <p style="margin-top:20px">${esc(data.summary)}</p>
    <p><a class="btn primary" href="${root}api/v1/index.json">api/v1/index.json</a></p>
    <p class="eyebrow"><a href="${root}feed.xml">Atom feed</a> · <a href="${root}feed.json">JSON Feed</a> · <a href="${root}datapackage.json">Data package</a></p>
  </div>
  <div class="prose codes"><div class="text">${marked.parse(content)}</div></div>
</article>
</div></main>
${footer()}`;
}

// The pages, once per interface language: English at the root, the others under /<lang>/ with the same paths.
for (const lang of LANGS) {
  setLang(lang);
  const out = lang === DEFAULT_LANG ? DIST : path.join(DIST, lang);
  const page = async (rel, html) => { await mkdir(path.join(out, rel), { recursive: true }); await writeFile(path.join(out, rel, "index.html"), html); };
  await page("", indexPage());
  for (const s of stories) {
    await page(href(s), storyPage(s));
    for (const t of s.translations) await page(path.join(href(s), t.language), storyPage(s, t));
  }
  for (const k of knowledge) await page(path.join("learn", k.crop, k.slug), learnPage(k));
  for (const p of producers) await page(producerHref(p), producerPage(p));
  await page("codes", await codesPage());
  await page("api", await apiPage());
}
setLang(DEFAULT_LANG);
// The Indonesian code guide used to live at /codes/id/; keep that address working.
await mkdir(path.join(DIST, "codes", "id"), { recursive: true });
await writeFile(path.join(DIST, "codes", "id", "index.html"), redirect("Cara membaca kode Open Origin", "../../id/codes/"));
// Permalinks: /s/<id>/ always leads to the story, producer or lot, even after its file is renamed. The same page is
// also written for the ways people type a code (small letters, no "-"), so l-kpbjf525-d and LKPBJF525D work too.
function redirect(title, to) { return `<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><link rel="canonical" href="${to}"><meta http-equiv="refresh" content="0; url=${to}"><a href="${to}">${esc(title)}</a>`; }
for (const [pid, title, to] of [...stories.map((s) => [s.id, s.title, `../../${href(s)}`]), ...producers.map((p) => [p.id, p.name, `../../${producerHref(p)}`]),
  ...lots.map((l) => [l.id, l.name || `Lot ${l.id}, ${l.date}`, `../../${lotHref(l)}`])]) {
  const bare = String(pid).replace(/-/g, "");
  // Only spellings that differ by more than case: some hosts (GitHub Pages among them) cannot hold two paths
  // that differ only in case. Small letters are handled by 404.html below.
  for (const spelling of new Set([pid, bare])) {
    const dir = path.join(DIST, "s", spelling);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), redirect(title, to));
  }
}
await writeFile(path.join(DIST, "s", "index.html"), redirect("Look up a code", "../codes/"));
// 404.html: a code typed in small letters or with spaces (/s/l-kpbjf525-d/) is sent to its standard spelling.
await writeFile(path.join(DIST, "404.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Not found · Open Origin</title>
<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:15vh auto;padding:0 16px;line-height:1.5">
<h1>Page not found</h1><p id="msg">This page does not exist. <a id="home" href="/">Go to Open Origin</a>.</p>
<script>
(() => {
  const C = ${JSON.stringify(ID_CHARS)}, SALT = ${JSON.stringify(ID_SALT)};
  const check = (p, b) => { let t = SALT[p]; for (let i = 0; i < 8; i++) t += (i + 1) * C.indexOf(b[i]); return C[(31 - (t % 31)) % 31]; };
  const m = decodeURIComponent(location.pathname).match(/^(.*?\\/)s\\/([^/]+)\\/?$/i);
  const base = m ? m[1] : location.pathname.replace(/^(\\/[^/]+\\/).*$/, "$1");
  document.getElementById("home").href = base;
  if (!m) return;
  const raw = m[2].toUpperCase().replace(/[\\s._-]/g, "");
  const k = raw.match(new RegExp("^([OSPL])([" + C + "]{8})([" + C + "])$"));
  if (k && check(k[1], k[2]) === k[3]) location.replace(base + "s/" + k[1] + "-" + k[2] + "-" + k[3] + "/");
  else document.getElementById("msg").innerHTML = 'This code was not found; it may be mistyped. <a href="' + base + 'codes/">Look up a code</a>.';
})();
</script></body></html>`);

// codes.json: every published code with its kind, crop(s), title and page, for the lookup box and for anyone
// who wants to resolve a code printed on a sack or an invoice.
const codeIndex: Record<string, any> = {};
for (const st of stories) codeIndex[st.id] = { kind: st.kind === "origin" ? "origin" : "story", crops: [st.crop], title: st.title, url: href(st), country: st.country, place_codes: placeCodes(st) };
for (const p of producers) codeIndex[p.id] = { kind: "producer", crops: producerCrops(p), title: p.name, url: producerHref(p) };
for (const l of lots) codeIndex[l.id] = { kind: "lot", crops: [l.pathCrop], title: l.name || `Lot ${l.date}`, url: lotHref(l) };
for (const v of Object.values(codeIndex)) v.crop_labels = v.crops.map((c) => CROPS[c]?.label || c);
await writeFile(path.join(DIST, "codes.json"), JSON.stringify(codeIndex, null, 1));
// One JSON shape per record, shared by the data package and the API.
const lotJson = (l) => ({ id: l.id, name: l.name ?? null, date: String(l.date), form: l.form ?? null, process: l.process ?? null, varieties: l.varieties ?? null,
  quantity_kg: l.quantity_kg ?? null, traceability: l.traceability ?? null, processed_by: l.processed_by ?? null, roasted_by: l.roasted_by ?? null, sold_by: l.sold_by ?? null,
  quality: l.quality ?? null, tested_by: l.tested_by ?? null, certificate: l.certificate ?? null, sources: l.sources || [], notes: l.notes || null, stories: l.linked.map((x) => x.id), producer: l.owner?.id ?? null, url: lotHref(l) });
const storyJson = (s) => ({
  id: s.id, path: `${s.crop}/${s.pathCountry}/${s.slug}`, kind: s.kind, origin: s.originStory ? s.originStory.id : null,
  ...Object.fromEntries(["crop", "country", "region", "producer", "species", "altitude_masl", "varieties", "process", "harvest", "tasting_notes", "coords", "title", "summary", "language", "told_by", "contributor", "journey", "sources", "traceability", "profile", "photo", "photo_credit", "photo_license", "photo_source"].filter((k) => s[k] !== undefined).map((k) => [k, s[k]])),
  place_codes: placeCodes(s),
  story: s.body, url: href(s),
  lots: s.lots.map(lotJson),
  translations: s.translations.map((t) => ({ language: t.language, title: t.title, summary: t.summary, translator: t.translator, story: t.body, ...(t.journey && { journey: t.journey }) })),
});
const varietyJson = (k) => ({
  id: `${k.crop}/${k.slug}`, name: k.title, crop: k.crop, species: k.species, lineage: k.lineage ?? null, aliases: k.aliases || [],
  stature: k.stature ?? null, yield_potential: k.yield_potential ?? null, quality_potential: k.quality_potential ?? null,
  leaf_rust: k.leaf_rust ?? null, altitude_masl: k.altitude_masl ?? null, summary: k.summary, sources: k.sources || [],
});
const producerJson = (p) => ({
  id: String(p.id), file: p.file, name: p.name, country: p.pathCountry.toUpperCase(), type: p.type ?? null, region: p.region ?? null, village: p.village ?? null,
  since: p.since ?? null, farm_size_ha: p.farm_size_ha ?? null, members: p.members ?? null, website: p.website ?? null, consent: p.consent, sources: p.sources || [], about: p.body || null,
  stories: p.stories.map((s) => s.id), url: producerHref(p),
});
await writeFile(path.join(DIST, ".nojekyll"), "");
await exportData();
await buildApi({ DIST, ROOT, SITE_URL, REPO, stories, producers, lots, knowledge, href, producerHref, lotHref, producerCrops, storyJson, producerJson, lotJson, varietyJson });

// Open data export: a Frictionless Data Package (https://datapackage.org) with CSV + JSON, regenerated on every build.
async function exportData() {
  const FIELDS = [
    ["id", "string", "permanent story id, e.g. S-K7M2XQ9P-V"], ["path", "string", "crop/country/slug of the story file"], ["kind", "string", "origin, farm or movement"], ["origin", "string", "id of the origin profile a farm or movement belongs to"],
    ["crop", "string", "coffee, cocoa, tea, spice, vanilla, honey or sugar"], ["country", "string", "ISO 3166-1 alpha-2"], ["region", "string", ""],
    ["producer", "string", ""], ["species", "string", ""], ["altitude_min_masl", "integer", ""], ["altitude_max_masl", "integer", ""],
    ["varieties", "string", "separated by ; "], ["process", "string", "separated by ; "], ["harvest", "string", ""],
    ["tasting_notes", "string", "separated by ; "], ["latitude", "number", "rounded to 2 decimals"], ["longitude", "number", "rounded to 2 decimals"],
    ["iso3166_2", "string", "ISO 3166-2 province codes, separated by ; "], ["admin_codes", "string", "national area codes (Indonesia: Kemendagri), separated by ; "],
    ["wikidata", "string", "Wikidata ids, separated by ; "], ["geonames", "string", "GeoNames ids, separated by ; "],
    ["plus_code", "string", "Open Location Code of the 0.05 degree cell holding the coordinates"], ["h3_cell", "string", "H3 cell at resolution 7 holding the coordinates"],
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
    ...Object.fromEntries(Object.entries(placeCodes(s)).map(([k, v]) => [k, Array.isArray(v) ? v.join("; ") : v])),
    traceability: s.traceability || "", lots: s.lots.length,
    title: s.title, summary: s.summary, language: s.language, translations: s.translations.map((t) => t.language).join("; "),
    told_by: s.told_by, contributor: s.contributor, url: href(s),
  }));
  const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const csv = [FIELDS.map((f) => f[0]).join(","), ...rows.map((r) => FIELDS.map((f) => cell(r[f[0]])).join(","))].join("\n") + "\n";
  const full = stories.map(storyJson);
  await mkdir(path.join(DIST, "data"), { recursive: true });
  await writeFile(path.join(DIST, "data", "stories.csv"), csv);
  await writeFile(path.join(DIST, "data", "stories.json"), JSON.stringify(full, null, 2));
  // Lots: one row per lot, plus quality in long format (one row per measured value) so every crop fits one table.
  const LFIELDS = [["id", "string", "permanent lot id, e.g. L-K7M2XQ9P-P"], ["story_ids", "string", "stories the lot comes from, separated by ; (several for a blend)"], ["producer", "string", "producer profile the lot is filed under"], ["crop", "string", ""], ["name", "string", ""],
    ["date", "string", "YYYY, YYYY-MM or YYYY-MM-DD"], ["form", "string", "state the lot is sold in; the options depend on the crop"], ["process", "string", "separated by ; "], ["varieties", "string", "separated by ; "],
    ["quantity_kg", "number", ""], ["traceability", "string", ""], ["processed_by", "string", "name or producer id"], ["roasted_by", "string", "name or producer id"], ["sold_by", "string", "name or producer id"], ["tested_by", "string", "name or producer id of the lab or grader"],
    ["certificate", "string", ""]];
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
  const varieties = knowledge.filter((k) => k.type === "variety").map(varietyJson);
  await writeFile(path.join(DIST, "data", "varieties.json"), JSON.stringify(varieties, null, 2));
  const prods = producers.map(producerJson);
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
