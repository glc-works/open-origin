// Builds the static site into dist/ from the story files. No framework: plain HTML + one stylesheet.
import { mkdir, writeFile, copyFile, cp, rm, access } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import { isHttpUrl, QUALITY, TRACEABILITY, loadBatches, validateBatch, ROOT, CROPS, RTL, loadStories, validateStory, validateTranslation, linkOrigins, loadKnowledge, validateKnowledge } from "./lib.mjs";

const STAGE_LABEL = { farm: "On the farm", harvest: "Harvest", process: "Processing", dry: "Drying", sort: "Sorting", roast: "Roasting", brew: "In the cup", market: "To market", other: "Along the way" };
const tagFor = (s) => (s.kind === "movement"
  ? `<span class="species movement">Movement</span>`
  : `<span class="species ${esc(s.species)}">${esc(s.species)}</span>`);

const DIST = path.join(ROOT, "dist");

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
const fmtAlt = (a) => (Array.isArray(a) ? `${a[0].toLocaleString("en")}–${a[1].toLocaleString("en")} masl` : "");
const TOLD = { farmer: "the farmer", "producer-group": "the producer group", roaster: "a roaster", researcher: "a researcher", editor: "the editors", other: "a contributor" };

const loaded = await loadStories();
const stories = loaded.stories.filter((s) => validateStory(s).length === 0);
for (const s of stories) s.translations = s.translations.filter((t) => validateTranslation(t).length === 0);
linkOrigins(stories);
const knowledge = (await loadKnowledge()).filter((k) => validateKnowledge(k).length === 0);
const learnHref = (crop, slug) => (knowledge.some((k) => k.crop === crop && k.slug === slug) ? `learn/${crop}/${slug}/` : null);
// Wraps a term in a link to its Learn page when one exists.
const termLink = (crop, term, prefix, label = term) => {
  const h = learnHref(crop, term);
  return h ? `<a class="term" href="${prefix}${h}">${esc(label)}</a>` : esc(label);
};
// Matches a variety name written in a story ("Ateng Super") to a Learn entry by its aliases.
const norm = (x) => String(x).toLowerCase().replace(/[^a-z0-9]+/g, "");
const varietyFor = (crop, name) => knowledge.find((k) => k.type === "variety" && k.crop === crop
  && [k.title, ...(k.aliases || [])].some((a) => norm(a) === norm(name)));
const batches = (await loadBatches()).filter((b) => validateBatch(b, stories).length === 0)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));
for (const s of stories) s.batches = batches.filter((b) => b.pathCrop === s.pathCrop && b.pathCountry === s.pathCountry && b.storySlug === s.slug);
const TRACE_LABEL = { farm: "Traced to the farm", group: "Traced to the producer group", region: "Traced to the region", country: "Traced to the country", blend: "Blend" };
const qField = (crop, k) => (QUALITY[crop] || []).find((f) => f[0] === k);
const qText = (crop, k, v) => { const f = qField(crop, k); return f ? `${f[1]} ${v}${f[2] ? ` ${f[2]}` : ""}` : `${k} ${v}`; };
const origins = stories.filter((s) => s.kind === "origin");
const voices = stories.filter((s) => s.kind !== "origin");
const submitFor = (o) => `${SUBMIT}&crop=${encodeURIComponent(o.crop)}&country=${encodeURIComponent(o.country)}&origin=${encodeURIComponent(o.slug)}&region=${encodeURIComponent(o.region || "")}`;
const nativeName = (code) => { try { return new Intl.DisplayNames([code], { type: "language" }).of(code); } catch { return code; } };
const dirOf = (lang) => (RTL.includes(String(lang).split("-")[0]) ? "rtl" : "ltr");
const href = (s) => `stories/${s.crop}/${s.pathCountry}/${s.slug}/`;
const photoSrc = (s, prefix) => (/^https?:\/\//.test(s.photo) ? s.photo : prefix + String(s.photo).replace(/^\/+/, ""));

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
${extra}</head>
<body>
<header class="bar"><div class="wrap">
  <a class="brand" href="${prefix}">Open<span>·</span>Origin</a>
  <nav><a href="${prefix}#stories">Stories</a><a href="${prefix}#learn">Learn</a><a href="${prefix}#contribute">Contribute</a><a href="${prefix}datapackage.json">Open data</a><a href="${REPO}">GitHub</a></nav>
</div></header>`;
}

const foot = `<footer class="site-footer"><div class="wrap">
  <p>Open Origin · stories from where it grows.</p>
  <p>Stories are CC BY 4.0, credited to the people who told them. Code is MIT. Altitude and tasting notes are typical ranges; every harvest is different.</p>
</div></footer>
</body>
</html>`;

function card(s) {
  const cover = s.photo
    ? `<img src="${esc(photoSrc(s, ""))}" alt="" loading="lazy">`
    : s.altitude_masl ? `<span class="alt">${esc(s.altitude_masl[1].toLocaleString("en"))}<small> masl</small></span>` : "";
  const latest = s.batches?.[0];
  const facts = [latest?.quality?.cupping_score ? `${latest.quality.cupping_score} pts (${latest.date})` : "", s.traceability && s.traceability !== "farm" ? TRACE_LABEL[s.traceability] : "", fmtAlt(s.altitude_masl), (s.varieties || []).slice(0, 2).join(", "), (s.process || []).join(" · ")].filter(Boolean);
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
    if (!s.coords) continue;
    const c = byCountry.get(s.country) || { lons: [], n: 0 };
    c.lons.push(s.coords[1]); c.n++;
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
  return `${head("Open Origin", "Open, community-written stories of coffee and other crops, told from where they grow.", "")}
<main>
<section class="hero" style="border-top:0"><div class="wrap">
  <div class="eyebrow">An open collection · ${stories.length} stories · ${countries.length} ${countries.length === 1 ? "country" : "countries"}</div>
  <h1>Every cup starts with <em>someone's</em> harvest.</h1>
  <p class="lede">Open Origin collects the stories behind coffee, cocoa, tea, spices, vanilla, honey and palm sugar: the land, the process and the people, told in their own words. Anyone can read them, reuse them and add their own.</p>
  <div class="cta"><a class="btn primary" href="${SUBMIT}">Share a story</a><a class="btn" href="#stories">Read the stories</a></div>
  ${strip()}
</div></section>

<section id="stories"><div class="wrap">
  <div class="section-head"><div class="eyebrow">The collection</div><h2>Stories from the farms</h2>
  <p>Each origin has a profile of its land and history, and below it the stories of the farmers and movements who work there. We are starting with coffee from the Indonesian archipelago.</p></div>
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
    : `<div class="empty"><p><strong>The first farmer stories are still to come.</strong> Two farms in Gayo can taste completely different: another hill, another process, another family. That difference is what Open Origin is for. Grow coffee, or work with people who do? Tell their story.</p><a class="btn primary" href="${SUBMIT}">Share a farmer story</a></div>`}
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
    <div class="text">${marked.parse(k.body)}</div>
    ${related.length ? `<h2 class="journey-title">Stories with ${esc(k.title.toLowerCase())}</h2><div class="cards">${related.map((r) => card(r).replace(`href="${href(r)}"`, `href="${prefix}${href(r)}"`)).join("")}</div>` : ""}
    ${(k.sources || []).length ? `<p class="eyebrow" style="margin-top:2em">Sources</p><ul>${k.sources.map((u) => `<li><a href="${esc(u)}">${esc(u)}</a></li>`).join("")}</ul>` : ""}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc(k.file)}">Improve this entry</a></p>
  </div>
</article>
</div></main>
${foot}`;
}

// Renders a story in its original language (t = null) or in one of its translations.
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
      : `<span class="species ${esc(s.species)}">${esc(CROPS[s.crop].label)} · ${esc(s.species)}</span>`}
    ${switcher}
    <dl class="passport">
      ${row("Producer", s.producer)}
      ${row("Altitude", fmtAlt(s.altitude_masl))}
      ${rowHtml("Varieties", (s.varieties || []).map((v) => { const k = varietyFor(s.crop, v); return k ? `<a class="term" href="${prefix}learn/${k.crop}/${k.slug}/">${esc(v)}</a>` : esc(v); }).join(", "))}
      ${rowHtml("Species", s.species ? termLink(s.crop, s.species, prefix) : "")}
      ${rowHtml("Process", (s.process || []).map((p) => termLink(s.crop, p, prefix)).join(", "))}
      ${row("Harvest", s.harvest)}
      ${row("Traceability", s.traceability && TRACE_LABEL[s.traceability])}
      ${row("Tastes of", (v.tasting_notes || []).join(", "))}
      ${row("Told by", TOLD[s.told_by])}
      ${row("Told in", nativeName(s.language))}
      ${t ? row("Translated by", t.translator) : ""}
      ${row("Added by", s.contributor)}
    </dl>
  </div>
  <div class="prose">
    ${s.photo ? `<figure class="cover" style="margin:0 0 24px"><img src="${esc(photoSrc(s, prefix))}" alt=""><figcaption>Photo: ${esc(s.photo_credit)}</figcaption></figure>` : ""}
    <div class="text" lang="${esc(v.language)}" dir="${dir}">${marked.parse(v.body)}</div>
    ${s.journey?.length ? `<h2 class="journey-title">From farm to cup</h2><ol class="journey" lang="${esc(v.language)}" dir="${dir}">${s.journey.map((j, i) => `<li><span class="stage">${esc(STAGE_LABEL[j.stage])}</span><p>${esc(journeyText(j, i))}</p></li>`).join("")}</ol>` : ""}
    ${s.batches.length ? `<h2 class="journey-title">Batches</h2>
    <p class="part-of">Quality belongs to a batch: each harvest or shipment is measured on its own. ${termLink(s.crop, "cupping-and-q-grading", prefix, "How coffee is scored")}</p>
    <div class="table-wrap"><table class="batches"><thead><tr><th>Batch</th><th>Quality</th><th>Tested by</th></tr></thead><tbody>
    ${s.batches.map((b) => `<tr><td><strong>${esc(b.date)}</strong><br><span class="muted">${esc(b.id)}${b.quantity_kg ? ` · ${esc(b.quantity_kg)} kg` : ""}${b.traceability ? ` · ${esc(TRACE_LABEL[b.traceability])}` : ""}</span></td>
      <td>${Object.entries(b.quality).map(([k, v]) => `<span class="q">${esc(qText(s.crop, k, v))}</span>`).join("")}${b.notes ? `<div class="muted">${esc(b.notes)}</div>` : ""}</td>
      <td>${esc(b.tested_by || "Self-reported")}${b.certificate ? `<br><a href="${esc(b.certificate)}">Certificate</a>` : ""}</td></tr>`).join("")}
    </tbody></table></div>` : ""}
    ${s.kind === "origin" ? `<h2 class="journey-title">Farmers from this origin</h2>${s.farms.length
      ? `<div class="cards">${s.farms.map((f) => card(f).replace(`href="${href(f)}"`, `href="${prefix}${href(f)}"`)).join("")}</div>`
      : `<div class="empty"><p>No farmer has told their own story from here yet. Every farm in this region grows it a little differently.</p><a class="btn primary" href="${submitFor(s)}">Tell a farm's story</a></div>`}` : ""}
    ${s.originStory ? `<p class="part-of">Part of the origin <a href="${prefix}${href(s.originStory)}">${esc(s.originStory.title)}</a></p>` : ""}
    ${sources.length ? `<p class="eyebrow" style="margin-top:2em">Sources</p><ul>${sources.map((u) => `<li><a href="${esc(u)}">${esc(u)}</a></li>`).join("")}</ul>` : ""}
    <p class="eyebrow" style="margin-top:2em"><a href="${REPO}/blob/main/${esc((t || s).file)}">Suggest an edit</a> · <a href="${REPO}/issues/new?template=translation.yml&amp;title=${encodeURIComponent(`[Translation] ${s.title}`)}">Translate this story</a></p>
  </div>
</article>
</div></main>
${foot}`;
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await copyFile(path.join(ROOT, "site", "style.css"), path.join(DIST, "style.css"));
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
await writeFile(path.join(DIST, ".nojekyll"), "");
await exportData();

// Open data export: a Frictionless Data Package (https://datapackage.org) with CSV + JSON, regenerated on every build.
async function exportData() {
  const FIELDS = [
    ["id", "string", "crop/country/slug, unique"], ["kind", "string", "origin, farm or movement"], ["origin", "string", "id of the origin profile a farm or movement belongs to"],
    ["crop", "string", "coffee, cocoa, tea, spice, vanilla, honey or sugar"], ["country", "string", "ISO 3166-1 alpha-2"], ["region", "string", ""],
    ["producer", "string", ""], ["species", "string", ""], ["altitude_min_masl", "integer", ""], ["altitude_max_masl", "integer", ""],
    ["varieties", "string", "separated by ; "], ["process", "string", "separated by ; "], ["harvest", "string", ""],
    ["tasting_notes", "string", "separated by ; "], ["latitude", "number", "rounded to 2 decimals"], ["longitude", "number", "rounded to 2 decimals"],
    ["traceability", "string", "farm, group, region, country or blend"], ["batches", "integer", "number of batches with quality data"],
    ["title", "string", ""], ["summary", "string", ""], ["language", "string", "BCP 47 code of the original story"],
    ["translations", "string", "available translation languages, separated by ; "], ["told_by", "string", ""], ["contributor", "string", ""],
    ["url", "string", "path of the story page, relative to the site root"],
  ];
  const id = (s) => `${s.crop}/${s.pathCountry}/${s.slug}`;
  const rows = stories.map((s) => ({
    id: id(s), kind: s.kind, origin: s.originStory ? id(s.originStory) : "", crop: s.crop, country: s.country, region: s.region || "",
    producer: s.producer, species: s.species || "", altitude_min_masl: s.altitude_masl?.[0] ?? "", altitude_max_masl: s.altitude_masl?.[1] ?? "",
    varieties: (s.varieties || []).join("; "), process: (s.process || []).join("; "), harvest: s.harvest || "",
    tasting_notes: (s.tasting_notes || []).join("; "), latitude: s.coords?.[0] ?? "", longitude: s.coords?.[1] ?? "",
    traceability: s.traceability || "", batches: s.batches.length,
    title: s.title, summary: s.summary, language: s.language, translations: s.translations.map((t) => t.language).join("; "),
    told_by: s.told_by, contributor: s.contributor, url: href(s),
  }));
  const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const csv = [FIELDS.map((f) => f[0]).join(","), ...rows.map((r) => FIELDS.map((f) => cell(r[f[0]])).join(","))].join("\n") + "\n";
  const full = stories.map((s) => ({
    id: id(s), kind: s.kind, origin: s.originStory ? id(s.originStory) : null,
    ...Object.fromEntries(["crop", "country", "region", "producer", "species", "altitude_masl", "varieties", "process", "harvest", "tasting_notes", "coords", "title", "summary", "language", "told_by", "contributor", "journey", "sources", "traceability"].filter((k) => s[k] !== undefined).map((k) => [k, s[k]])),
    story: s.body, url: href(s),
    batches: s.batches.map((b) => ({ id: b.id, date: String(b.date), quality: b.quality, tested_by: b.tested_by ?? null, quantity_kg: b.quantity_kg ?? null, traceability: b.traceability ?? null, certificate: b.certificate ?? null })),
    translations: s.translations.map((t) => ({ language: t.language, title: t.title, summary: t.summary, translator: t.translator, story: t.body, ...(t.journey && { journey: t.journey }) })),
  }));
  await mkdir(path.join(DIST, "data"), { recursive: true });
  await writeFile(path.join(DIST, "data", "stories.csv"), csv);
  await writeFile(path.join(DIST, "data", "stories.json"), JSON.stringify(full, null, 2));
  // Batches in long format: one row per measured quality value, so every crop fits one table.
  const BFIELDS = [["batch_id", "string", "story id + batch file name"], ["story_id", "string", ""], ["crop", "string", ""], ["date", "string", "YYYY, YYYY-MM or YYYY-MM-DD"],
    ["field", "string", "quality field, see the crop's list in CONTRIBUTING.md"], ["value", "string", ""], ["unit", "string", ""], ["tested_by", "string", ""]];
  const brows = stories.flatMap((s) => s.batches.flatMap((b) => Object.entries(b.quality).map(([k, v]) => ({
    batch_id: `${id(s)}/${b.id}`, story_id: id(s), crop: s.crop, date: String(b.date), field: k, value: v, unit: qField(s.crop, k)?.[2] || "", tested_by: b.tested_by || "",
  }))));
  await writeFile(path.join(DIST, "data", "batches.csv"), [BFIELDS.map((f) => f[0]).join(","), ...brows.map((r) => BFIELDS.map((f) => cell(r[f[0]])).join(","))].join("\n") + "\n");
  const varieties = knowledge.filter((k) => k.type === "variety").map((k) => ({
    id: `${k.crop}/${k.slug}`, name: k.title, crop: k.crop, species: k.species, lineage: k.lineage ?? null, aliases: k.aliases || [],
    stature: k.stature ?? null, yield_potential: k.yield_potential ?? null, quality_potential: k.quality_potential ?? null,
    leaf_rust: k.leaf_rust ?? null, altitude_masl: k.altitude_masl ?? null, summary: k.summary, sources: k.sources || [],
  }));
  await writeFile(path.join(DIST, "data", "varieties.json"), JSON.stringify(varieties, null, 2));
  const pkg = {
    name: "open-origin-stories",
    title: "Open Origin stories",
    description: "Community-written stories of coffee and other crops, told from where they grow.",
    homepage: REPO,
    version: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    licenses: [{ name: "CC-BY-4.0", path: "https://creativecommons.org/licenses/by/4.0/", title: "Creative Commons Attribution 4.0" }],
    resources: [
      { name: "stories", path: "data/stories.csv", format: "csv", mediatype: "text/csv", encoding: "utf-8",
        schema: { fields: FIELDS.map(([name, type, description]) => ({ name, type, ...(description && { description }) })), primaryKey: "id" } },
      { name: "stories-full", path: "data/stories.json", format: "json", mediatype: "application/json",
        description: "Every story with its full text, farm-to-cup journey and translations." },
      { name: "batches", path: "data/batches.csv", format: "csv", mediatype: "text/csv", encoding: "utf-8",
        description: "Quality measurements per batch, one row per value.",
        schema: { fields: BFIELDS.map(([name, type, description]) => ({ name, type, ...(description && { description }) })) } },
      { name: "varieties", path: "data/varieties.json", format: "json", mediatype: "application/json",
        description: "Plant varieties with species, lineage, local names and agronomic traits." },
    ],
  };
  await writeFile(path.join(DIST, "datapackage.json"), JSON.stringify(pkg, null, 2));
}
const nT = stories.reduce((n, s) => n + s.translations.length, 0);
console.log(`✓ Built ${stories.length} stories and ${nT} translations into dist/`);
