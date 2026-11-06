// Public read API: static JSON files under dist/api/v1/ plus Atom and JSON feeds, written on every build.
// Nothing runs on a server: GitHub Pages (or any static host) serves the files, and it sends
// Access-Control-Allow-Origin: *, so a web page on another site can fetch them too.
//
//   api/v1/index.json                    entry point: endpoints, counts, licence
//   api/v1/{origins,stories,producers,lots}.json        one summary row per record
//   api/v1/{origins,stories,producers,lots}/<ID>.json   the full record, by its permanent id
//   api/v1/crops/<crop>.json             the ids of everything for one crop
//   api/v1/varieties.json                plant varieties
//   feed.xml (Atom) and feed.json (JSON Feed 1.1)        newest stories, producers and lots
//
// Every file carries the CC BY 4.0 licence and the credit line people must show when they reuse the data.
// The shape of each record is the same as in the data package (build.mjs: storyJson, producerJson, lotJson).
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { CROPS } from "./lib.mjs";

export const API_VERSION = "1";
const LICENSE = { name: "CC-BY-4.0", title: "Creative Commons Attribution 4.0", url: "https://creativecommons.org/licenses/by/4.0/" };
// The id prefix says which collection a record is in, so an id alone is enough to build its URL.
export const COLLECTION = { O: "origins", S: "stories", P: "producers", L: "lots" };
const SINGULAR = { origins: "origin", stories: "story", producers: "producer", lots: "lot" };

// When each file was first added and last changed, from git history. One `git log` for the whole tree.
// A file not committed yet (or no git at all) has no dates; the feed then uses the build time.
function gitDates(root) {
  const dates = new Map();
  try {
    if (execFileSync("git", ["rev-parse", "--is-shallow-repository"], { cwd: root, encoding: "utf8" }).trim() === "true") {
      console.warn("! Shallow git clone: added/updated dates in the API are only as old as the clone (use fetch-depth: 0).");
    }
    const out = execFileSync("git", ["log", "--relative", "-M", "--name-status", "--format=%x00%aI", "--", "stories", "producers", "lots"],
      { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    // The log runs newest first. After a rename (R100 old new), older lines name the old path, so they are
    // counted for the file's current name: a renamed file keeps the date it was first added.
    const current = new Map();
    let when = null;
    for (const line of out.split("\n")) {
      if (line.startsWith("\0")) { when = line.slice(1); continue; }
      const parts = line.split("\t");
      if (parts.length < 2 || !when) continue;
      const file = current.get(parts.at(-1)) ?? parts.at(-1);
      const d = dates.get(file) || { added: when, updated: when };
      d.added = when; // the last one seen is the oldest
      dates.set(file, d);
      if (parts[0].startsWith("R") && parts.length === 3) current.set(parts[1], file);
    }
  } catch { /* no git: no dates */ }
  return dates;
}

const xml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

export async function buildApi(ctx) {
  const { DIST, ROOT, SITE_URL, REPO, stories, producers, lots, knowledge, href, producerHref, lotHref, producerCrops, storyJson, producerJson, lotJson, varietyJson } = ctx;
  const generated = new Date().toISOString();
  const BASE = `${SITE_URL}api/v${API_VERSION}/`;
  const dates = gitDates(ROOT);
  const datesOf = (...files) => {
    const ds = files.map((f) => dates.get(f)).filter(Boolean);
    if (!ds.length) return { added: null, updated: null };
    return { added: ds.map((d) => d.added).sort()[0], updated: ds.map((d) => d.updated).sort().at(-1) };
  };
  const meta = (extra = {}) => ({
    api_version: API_VERSION,
    publisher: "Open Origin",
    license: LICENSE,
    attribution: "Data from Open Origin (https://glc-works.github.io/open-origin/), CC BY 4.0. Credit the people who told each story.",
    docs: `${SITE_URL}api/`,
    source: REPO,
    generated,
    ...extra,
  });
  const write = async (rel, body) => {
    const file = path.join(DIST, rel);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(body, null, 2) + "\n");
  };
  const apiUrl = (id) => `${BASE}${COLLECTION[id[0]]}/${id}.json`;
  const links = (id, page) => ({ self: apiUrl(id), html: SITE_URL + page, permalink: `${SITE_URL}s/${id}/` });

  // Each record once, with its dates and links. Stories split into origins (O-) and farm/movement stories (S-).
  const records = [];
  for (const s of stories) {
    const d = datesOf(s.file, ...s.translations.map((t) => t.file));
    const data = {
      ...storyJson(s),
      farms: s.kind === "origin" ? (s.farms || []).map((f) => f.id) : undefined,
      producer_profile: s.producerProfile?.id ?? null,
      ...d,
    };
    records.push({ id: s.id, type: s.kind === "origin" ? "origin" : "story", crops: [s.crop], country: s.country, coords: s.coords ?? null, title: s.title, summary: s.summary, page: href(s), ...d, data });
  }
  for (const p of producers) {
    const d = datesOf(p.file);
    const handled = lots.filter((l) => l.owner === p || [l.processed_by, l.roasted_by, l.sold_by, l.tested_by].some((v) => String(v) === String(p.id)));
    const data = { ...producerJson(p), crops: producerCrops(p), lots: handled.map((l) => l.id), ...d };
    records.push({ id: String(p.id), type: "producer", crops: data.crops, country: data.country, title: p.name, summary: p.type ? `${p.type}` : "", page: producerHref(p), ...d, data });
  }
  for (const l of lots) {
    const d = datesOf(l.file);
    const country = (l.linked[0]?.country || l.pathCountry || "").toUpperCase() || null;
    // refs (trade references such as HS code or EUDR statement) are passed through when a lot has them.
    const data = { ...lotJson(l), crop: l.pathCrop, country, ...(l.refs && { refs: l.refs }), ...d };
    const title = l.name || `Lot ${l.id}, ${l.date}`;
    records.push({ id: l.id, type: "lot", crops: [l.pathCrop], country, title, summary: [l.form, ...(l.process || [])].filter(Boolean).join(", "), page: lotHref(l), ...d, data });
  }

  // coords (rounded to about 1 km) are in the origin and story rows, so a map can be drawn from one file.
  const summary = (r) => ({ id: r.id, type: r.type, title: r.title, crops: r.crops, country: r.country, ...(r.coords !== undefined && { coords: r.coords }), added: r.added, updated: r.updated, url: SITE_URL + r.page, api: apiUrl(r.id) });
  for (const r of records) {
    await write(`api/v${API_VERSION}/${COLLECTION[r.id[0]]}/${r.id}.json`, { meta: meta({ id: r.id, type: r.type, links: links(r.id, r.page) }), data: { ...r.data, url: SITE_URL + r.page } });
  }
  const counts = {};
  for (const [prefix, name] of Object.entries(COLLECTION)) {
    const rows = records.filter((r) => r.id[0] === prefix).map(summary);
    counts[name] = rows.length;
    await write(`api/v${API_VERSION}/${name}.json`, { meta: meta({ count: rows.length, item: `${BASE}${name}/{id}.json` }), data: rows });
  }
  const crops = {};
  for (const crop of Object.keys(CROPS)) {
    const mine = records.filter((r) => r.crops.includes(crop));
    crops[crop] = mine.length;
    await write(`api/v${API_VERSION}/crops/${crop}.json`, {
      meta: meta({ crop, label: CROPS[crop].label }),
      data: Object.fromEntries(Object.values(COLLECTION).map((name) => [name, mine.filter((r) => COLLECTION[r.id[0]] === name).map(summary)])),
    });
  }
  const varieties = knowledge.filter((k) => k.type === "variety").map(varietyJson);
  await write(`api/v${API_VERSION}/varieties.json`, { meta: meta({ count: varieties.length }), data: varieties });
  await write(`api/v${API_VERSION}/index.json`, {
    meta: meta(),
    data: {
      counts,
      crops,
      endpoints: {
        ...Object.fromEntries(Object.values(COLLECTION).flatMap((n) => [[n, `${BASE}${n}.json`], [`${SINGULAR[n]}_by_id`, `${BASE}${n}/{id}.json`]])),
        crop: `${BASE}crops/{crop}.json`,
        varieties: `${BASE}varieties.json`,
        feed_atom: `${SITE_URL}feed.xml`,
        feed_json: `${SITE_URL}feed.json`,
        codes: `${SITE_URL}codes.json`,
        datapackage: `${SITE_URL}datapackage.json`,
      },
      id_prefixes: COLLECTION,
    },
  });

  // Feeds: the 50 newest records, newest first. A record not yet in git history counts as new at build time.
  const newest = [...records]
    .sort((a, b) => String(b.added || generated).localeCompare(String(a.added || generated)) || a.id.localeCompare(b.id))
    .slice(0, 50);
  const KIND = { origin: "Origin", story: "Story", producer: "Producer", lot: "Lot" };
  const feedTitle = (r) => `${KIND[r.type]} · ${r.title}`;
  const feedUpdated = newest.map((r) => r.updated || generated).sort().at(-1) || generated;
  await writeFile(path.join(DIST, "feed.xml"), `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Open Origin</title>
  <subtitle>New origin stories, producers and lots</subtitle>
  <id>${xml(SITE_URL)}</id>
  <link rel="alternate" type="text/html" href="${xml(SITE_URL)}"/>
  <link rel="self" type="application/atom+xml" href="${xml(SITE_URL)}feed.xml"/>
  <updated>${xml(feedUpdated)}</updated>
  <author><name>Open Origin</name><uri>${xml(REPO)}</uri></author>
  <rights>CC BY 4.0: ${xml(LICENSE.url)}</rights>
${newest.map((r) => `  <entry>
    <title>${xml(feedTitle(r))}</title>
    <id>${xml(`${SITE_URL}s/${r.id}/`)}</id>
    <link rel="alternate" type="text/html" href="${xml(SITE_URL + r.page)}"/>
    <link rel="alternate" type="application/json" href="${xml(apiUrl(r.id))}"/>
    <published>${xml(r.added || generated)}</published>
    <updated>${xml(r.updated || generated)}</updated>
${r.crops.map((c) => `    <category term="${xml(c)}" label="${xml(CROPS[c]?.label || c)}"/>`).join("\n")}
    <category term="${xml(r.type)}"/>
    <summary>${xml(r.summary || r.title)}</summary>
  </entry>`).join("\n")}
</feed>
`);
  await writeFile(path.join(DIST, "feed.json"), JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    title: "Open Origin",
    description: "New origin stories, producers and lots. CC BY 4.0.",
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}feed.json`,
    authors: [{ name: "Open Origin", url: REPO }],
    _open_origin: { license: LICENSE, api: `${BASE}index.json` },
    items: newest.map((r) => ({
      id: `${SITE_URL}s/${r.id}/`,
      url: SITE_URL + r.page,
      external_url: apiUrl(r.id),
      title: feedTitle(r),
      summary: r.summary || r.title,
      content_text: r.summary || r.title,
      date_published: r.added || generated,
      date_modified: r.updated || generated,
      tags: [r.type, ...r.crops],
      _open_origin: { id: r.id, type: r.type, crops: r.crops, country: r.country },
    })),
  }, null, 2) + "\n");
  return { counts };
}
