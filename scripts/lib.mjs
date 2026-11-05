// Shared story loading and validation for Open Origin.
// The story format is documented in CONTRIBUTING.md; keep the two in sync.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const STORIES_DIR = path.join(ROOT, "stories");

// Crops that are open for stories. Add a crop here (and a folder under stories/) to open it.
// `species` lists the allowed values for the species field of that crop.
export const CROPS = {
  coffee: { label: "Coffee", species: ["arabica", "robusta", "liberica", "excelsa"] },
  cocoa: { label: "Cocoa", species: ["criollo", "forastero", "trinitario", "nacional"] },
  tea: { label: "Tea", species: ["sinensis", "assamica"] },
  spice: { label: "Spices", species: ["nutmeg", "clove", "pepper", "cinnamon", "cardamom", "ginger", "turmeric", "other"] },
  vanilla: { label: "Vanilla", species: ["planifolia", "tahitensis", "pompona"] },
  honey: { label: "Honey", species: ["apis-mellifera", "apis-cerana", "apis-dorsata", "stingless-bee", "other"] },
  sugar: { label: "Palm & coconut sugar", species: ["aren", "coconut", "lontar", "nipa", "other"] },
};

export const PROCESSES = [
  "washed", "natural", "honey", "wet-hulled", "anaerobic", "fermented", "sun-dried", "other",
];

export const TOLD_BY = ["farmer", "producer-group", "roaster", "researcher", "editor", "other"];

// origin: a profile of a growing region (Gayo, Yirgacheffe). One per region, written from many sources.
// farm: one farmer, farm or cooperative's own story. Many per origin; link it with `origin: <slug>`.
// movement: a community, cooperative or initiative and what it changes.
export const KINDS = ["origin", "farm", "movement"];

// Steps of the farm-to-table journey, in the order they usually happen.
export const STAGES = ["farm", "harvest", "process", "dry", "sort", "roast", "brew", "market", "other"];

const REQUIRED = ["title", "crop", "country", "region", "producer", "summary", "language", "told_by", "contributor", "consent"];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.name.endsWith(".md") && entry.name !== "README.md") out.push(p);
  }
  return out;
}

// Right-to-left scripts, so pages can set dir="rtl".
export const RTL = ["ar", "fa", "ur", "he", "ps", "sd", "ug", "yi"];

// A translation sits next to its story as <slug>.<lang>.md, e.g. gayo.en.md or gayo.zh-hant.md.
const TRANSLATION_RE = /^([a-z0-9-]+)\.([a-z]{2,3}(?:-[a-z0-9]+)?)\.md$/;

export async function loadStories() {
  const files = (await walk(STORIES_DIR)).sort();
  const stories = [];
  const translations = [];
  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { data, content } = matter(raw);
    const rel = path.relative(STORIES_DIR, file);
    const [crop, country, name] = rel.split(path.sep);
    const base = { body: content.trim(), file: path.relative(ROOT, file), pathCrop: crop, pathCountry: country };
    const t = name && name.match(TRANSLATION_RE);
    if (t) translations.push({ ...data, ...base, parentSlug: t[1], fileLang: t[2] });
    else stories.push({ kind: "farm", ...data, ...base, slug: name ? name.replace(/\.md$/, "") : "", translations: [] });
  }
  for (const t of translations) {
    const parent = stories.find((s) => s.slug === t.parentSlug && s.pathCrop === t.pathCrop && s.pathCountry === t.pathCountry);
    t.parent = parent;
    if (parent) parent.translations.push(t);
  }
  return { stories, translations };
}

// Knowledge entries ("Learn" pages): learn/<crop>/<slug>.md, one term per file.
export const LEARN_DIR = path.join(ROOT, "learn");
export const TERM_TYPES = ["species", "process", "variety", "term"];

export async function loadKnowledge() {
  let files = [];
  try { files = (await walk(LEARN_DIR)).sort(); } catch { return []; }
  const out = [];
  for (const file of files) {
    const { data, content } = matter(await readFile(file, "utf8"));
    const [crop, name] = path.relative(LEARN_DIR, file).split(path.sep);
    out.push({ ...data, body: content.trim(), file: path.relative(ROOT, file), pathCrop: crop, slug: name ? name.replace(/\.md$/, "") : "" });
  }
  return out;
}

export function validateKnowledge(k) {
  const errors = [];
  for (const key of ["title", "crop", "type", "summary"]) if (!k[key]) errors.push(`missing required field "${key}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(k.slug)) errors.push(`file name must be lowercase words joined by hyphens`);
  if (k.crop && !CROPS[k.crop]) errors.push(`crop "${k.crop}" is not open yet`);
  if (k.crop && k.pathCrop !== k.crop) errors.push(`file is in learn/${k.pathCrop}/ but crop is "${k.crop}"`);
  if (k.type && !TERM_TYPES.includes(k.type)) errors.push(`type must be one of: ${TERM_TYPES.join(", ")}`);
  if (k.summary && String(k.summary).length > 200) errors.push(`summary is ${String(k.summary).length} characters; keep it to 200`);
  if (k.type === "variety") {
    if (!k.species) errors.push(`a variety needs its species`);
    if (k.aliases !== undefined && !isStrList(k.aliases)) errors.push(`aliases must be a list of names`);
    if (k.leaf_rust !== undefined && !["resistant", "tolerant", "susceptible"].includes(k.leaf_rust)) errors.push(`leaf_rust must be resistant, tolerant or susceptible`);
    for (const f of ["yield_potential"]) if (k[f] !== undefined && !["low", "medium", "high", "very high"].includes(k[f])) errors.push(`${f} must be low, medium, high or very high`);
    if (k.quality_potential !== undefined && !["fair", "good", "very good", "exceptional"].includes(k.quality_potential)) errors.push(`quality_potential must be fair, good, very good or exceptional`);
    if (k.stature !== undefined && !["dwarf", "semi-dwarf", "tall"].includes(k.stature)) errors.push(`stature must be dwarf, semi-dwarf or tall`);
    if (k.altitude_masl !== undefined && !(Array.isArray(k.altitude_masl) && k.altitude_masl.length === 2 && k.altitude_masl.every(isNum))) errors.push(`altitude_masl must be [min, max]`);
  }
  if (k.sources !== undefined && (!Array.isArray(k.sources) || !k.sources.every(isHttpUrl))) errors.push(`sources must be a list of http(s) links`);
  if (!k.body || k.body.length < 200) errors.push(`the explanation is too short`);
  return errors;
}

// Links farm and movement stories to their origin profile. Returns errors keyed by file.
export function linkOrigins(stories) {
  const errors = new Map();
  for (const s of stories) {
    s.farms = s.farms || [];
    if (!s.origin) continue;
    const o = stories.find((x) => x.kind === "origin" && x.slug === s.origin && x.pathCrop === s.pathCrop && x.pathCountry === s.pathCountry);
    if (!o) errors.set(s.file, [`origin "${s.origin}" does not match an origin profile in stories/${s.pathCrop}/${s.pathCountry}/`]);
    else { s.originStory = o; (o.farms = o.farms || []).push(s); }
  }
  return errors;
}

export function validateTranslation(t) {
  const errors = [];
  if (!t.parent) errors.push(`no story named ${t.parentSlug}.md next to this translation`);
  for (const key of ["title", "summary", "language", "translator"]) if (!t[key]) errors.push(`missing required field "${key}"`);
  if (t.language && t.language !== t.fileLang) errors.push(`language is "${t.language}" but the file name says "${t.fileLang}"`);
  if (t.parent && t.language === t.parent.language) errors.push(`translation is in the same language as the story`);
  if (t.summary && String(t.summary).length > 200) errors.push(`summary is ${String(t.summary).length} characters; keep it to 200`);
  if (t.tasting_notes !== undefined && (!isStrList(t.tasting_notes) || t.tasting_notes.length > 4)) errors.push(`tasting_notes must be a list of at most 4 words`);
  if (t.journey !== undefined) {
    const n = t.parent?.journey?.length;
    if (!isStrList(t.journey)) errors.push(`journey in a translation is a list of translated step texts`);
    else if (n !== undefined && t.journey.length !== n) errors.push(`journey has ${t.journey.length} steps but the story has ${n}`);
  }
  if (!t.body || t.body.length < 200) errors.push(`the translated story is too short`);
  return errors;
}

export const isHttpUrl = (u) => { try { return ["http:", "https:"].includes(new URL(String(u)).protocol); } catch { return false; } };
const isNum = (n) => typeof n === "number" && Number.isFinite(n);
const isStrList = (v) => Array.isArray(v) && v.every((s) => typeof s === "string" && s.trim());

export function validateStory(s) {
  const errors = [];
  for (const key of REQUIRED) {
    if (s[key] === undefined || s[key] === null || s[key] === "") errors.push(`missing required field "${key}"`);
  }
  if (!s.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug)) {
    errors.push(`file name must be lowercase words joined by hyphens, e.g. stories/coffee/id/gayo.md`);
  }
  if (!KINDS.includes(s.kind)) errors.push(`kind must be one of: ${KINDS.join(", ")}`);
  if (s.kind !== "movement" && !s.species) errors.push(`missing required field "species"`);
  if (s.origin !== undefined && s.kind === "origin") errors.push(`an origin profile cannot itself have an "origin" field`);
  const crop = CROPS[s.crop];
  if (s.crop && !crop) errors.push(`crop "${s.crop}" is not open yet (open: ${Object.keys(CROPS).join(", ")})`);
  if (s.crop && s.pathCrop !== s.crop) errors.push(`file is in stories/${s.pathCrop}/ but crop is "${s.crop}"`);
  if (s.country && !/^[A-Z]{2}$/.test(s.country)) errors.push(`country must be a 2-letter ISO code like ID, ET, CO`);
  if (s.country && s.pathCountry !== String(s.country).toLowerCase()) {
    errors.push(`file is in stories/${s.pathCrop}/${s.pathCountry}/ but country is "${s.country}"`);
  }
  if (crop && s.species && !crop.species.includes(s.species)) {
    errors.push(`species "${s.species}" is not one of: ${crop.species.join(", ")}`);
  }
  if (s.summary && String(s.summary).length > 200) errors.push(`summary is ${String(s.summary).length} characters; keep it to 200`);
  if (s.told_by && !TOLD_BY.includes(s.told_by)) errors.push(`told_by must be one of: ${TOLD_BY.join(", ")}`);
  if (s.consent !== true) errors.push(`consent must be true: everyone named or pictured agreed to publication`);
  if (s.altitude_masl !== undefined) {
    const a = s.altitude_masl;
    if (!Array.isArray(a) || a.length !== 2 || !a.every(isNum) || a[0] > a[1] || a[1] > 3500) {
      errors.push(`altitude_masl must be [min, max] in metres, e.g. [1200, 1600]`);
    }
  }
  if (s.process !== undefined) {
    if (!isStrList(s.process)) errors.push(`process must be a list, e.g. [washed]`);
    else for (const p of s.process) if (!PROCESSES.includes(p)) errors.push(`process "${p}" is not one of: ${PROCESSES.join(", ")}`);
  }
  if (s.varieties !== undefined && !isStrList(s.varieties)) errors.push(`varieties must be a list of names`);
  if (s.tasting_notes !== undefined) {
    if (!isStrList(s.tasting_notes)) errors.push(`tasting_notes must be a list of words`);
    else if (s.tasting_notes.length > 4) errors.push(`tasting_notes: use at most 4`);
  }
  if (s.coords !== undefined) {
    const c = s.coords;
    if (!Array.isArray(c) || c.length !== 2 || !c.every(isNum) || Math.abs(c[0]) > 90 || Math.abs(c[1]) > 180) {
      errors.push(`coords must be [latitude, longitude]`);
    } else if (c.some((n) => (String(n).split(".")[1] || "").length > 2)) {
      errors.push(`coords: round to 2 decimals so a farmer's home cannot be pinpointed`);
    }
  }
  if (s.journey !== undefined) {
    if (!Array.isArray(s.journey) || !s.journey.length) errors.push(`journey must be a list of steps`);
    else s.journey.forEach((j, i) => {
      if (!j || typeof j !== "object" || !STAGES.includes(j.stage) || typeof j.text !== "string" || !j.text.trim()) {
        errors.push(`journey step ${i + 1} needs a stage (${STAGES.join(", ")}) and text`);
      }
    });
  }
  if (s.lot !== undefined) {
    const l = s.lot;
    if (!l || typeof l !== "object" || Array.isArray(l)) errors.push(`lot must be a set of fields, e.g. lot: { harvest_year: 2025 }`);
    else {
      if (s.kind === "origin") errors.push(`lot data belongs to one farm's harvest; add it to a farm story`);
      const known = ["harvest_year", "moisture_pct", "screen_size", "grade", "density_g_l", "water_activity"];
      for (const k of Object.keys(l)) if (!known.includes(k)) errors.push(`lot.${k} is not a known field (${known.join(", ")})`);
      if (l.harvest_year !== undefined && !Number.isInteger(l.harvest_year)) errors.push(`lot.harvest_year must be a year`);
      if (l.moisture_pct !== undefined && !(isNum(l.moisture_pct) && l.moisture_pct > 0 && l.moisture_pct < 30)) errors.push(`lot.moisture_pct must be a percentage, e.g. 11.5`);
      if (l.water_activity !== undefined && !(isNum(l.water_activity) && l.water_activity > 0 && l.water_activity < 1)) errors.push(`lot.water_activity must be between 0 and 1, e.g. 0.55`);
      if (l.density_g_l !== undefined && !(isNum(l.density_g_l) && l.density_g_l > 300 && l.density_g_l < 1000)) errors.push(`lot.density_g_l must be grams per litre, e.g. 720`);
      if (l.screen_size !== undefined && typeof l.screen_size !== "string" && !isNum(l.screen_size)) errors.push(`lot.screen_size must be a number or range, e.g. "16-18"`);
    }
  }
  if (s.cupping_score !== undefined) {
    if (!isNum(s.cupping_score) || s.cupping_score < 0 || s.cupping_score > 100) errors.push(`cupping_score must be a number from 0 to 100`);
    if (s.kind === "origin") errors.push(`cupping_score belongs to one lot and harvest; add it to a farm story, not an origin profile`);
    if (!s.graded_by) errors.push(`cupping_score needs graded_by (who scored it, e.g. "Licensed Q Grader")`);
    if (!Number.isInteger(s.cupping_year)) errors.push(`cupping_score needs cupping_year (the harvest year)`);
  }
  if (s.sources !== undefined) {
    if (!Array.isArray(s.sources)) errors.push(`sources must be a list of links, e.g. [https://example.org/page]`);
    else for (const u of s.sources) if (!isHttpUrl(u)) errors.push(`source "${u}" must be an http(s) link`);
  }
  if (s.photo !== undefined && !(isHttpUrl(s.photo) && String(s.photo).startsWith("https:")) && !/^photos\/[a-z0-9/_-]+\.(jpe?g|png|webp)$/i.test(String(s.photo))) {
    errors.push(`photo must be an https link or a file in photos/, e.g. photos/id/gayo.jpg`);
  }
  if (s.photo !== undefined && !s.photo_credit) errors.push(`photo needs a photo_credit`);
  if (!s.body || s.body.length < 200) errors.push(`the story itself is too short (at least a few sentences)`);
  return errors;
}
