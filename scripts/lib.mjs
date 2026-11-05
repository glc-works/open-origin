// Shared story loading and validation for Open Origin.
// The story format is documented in CONTRIBUTING.md; keep the two in sync.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// OPEN_ORIGIN_ROOT points the scripts at another content folder, e.g. the test fixtures.
export const ROOT = process.env.OPEN_ORIGIN_ROOT ? path.resolve(process.env.OPEN_ORIGIN_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Front matter with a readable error: a YAML mistake names the file and line instead of a stack trace.
function readFront(text, file) {
  try { return matter(text); }
  catch (e) {
    const where = e.mark ? ` (line ${e.mark.line + 1})` : "";
    throw new Error(`${path.relative(ROOT, file)}${where}: ${e.reason || e.message}. Text with a colon, like a summary, needs quotes.`);
  }
}

export const STORIES_DIR = path.join(ROOT, "stories");

// Crops that are open for stories. Add a crop here (and a folder under stories/) to open it.
// Quality fields a lot of each crop may report: [key, label, unit, min, max]; min null = free text.
const MOISTURE = ["moisture_pct", "Moisture", "%", 0, 40];
const GRADE = ["grade", "Grade", "", null];
export const QUALITY = {
  coffee: [["cupping_score", "Cupping score", "pts", 0, 100], ["cupping_protocol", "Protocol", "", null], MOISTURE,
    ["water_activity", "Water activity", "aw", 0, 1], ["screen_size", "Screen size", "", null], ["density_g_l", "Density", "g/L", 300, 1000],
    ["defects_primary", "Primary defects", "per 350 g", 0, 500], ["defects_secondary", "Secondary defects", "per 350 g", 0, 500], GRADE],
  cocoa: [["fermented_pct", "Well fermented", "%", 0, 100], ["slaty_pct", "Slaty", "%", 0, 100], ["mouldy_pct", "Mouldy", "%", 0, 100],
    ["bean_count_per_100g", "Bean count", "per 100 g", 30, 250], MOISTURE, GRADE],
  tea: [GRADE, ["flush", "Flush", "", null], MOISTURE],
  spice: [GRADE, MOISTURE, ["density_g_l", "Density", "g/L", 100, 1000], ["volatile_oil_pct", "Volatile oil", "%", 0, 30]],
  vanilla: [GRADE, MOISTURE, ["pod_length_cm", "Pod length", "cm", 5, 35], ["vanillin_pct", "Vanillin", "%", 0, 10]],
  honey: [["botanical_source", "Nectar source", "", null], MOISTURE, ["hmf_mg_kg", "HMF", "mg/kg", 0, 500], ["diastase_schade", "Diastase", "Schade", 0, 100]],
  sugar: [MOISTURE, ["colour", "Colour", "", null], ["sucrose_pct", "Sucrose", "%", 0, 100]],
};

// Per crop: allowed `species`, `processes` (how it is made) and `forms` (the state a lot is sold in),
// plus the words the site uses for the end of its journey and, optionally, the Learn entry that explains its grading. Add a crop here (and a folder under stories/) to open it.
export const CROPS = {
  coffee: { label: "Coffee", species: ["arabica", "robusta", "liberica", "excelsa"],
    processes: ["washed", "natural", "honey", "wet-hulled", "anaerobic", "fermented", "other"],
    forms: ["cherry", "parchment", "green", "roasted"], journey: "From farm to cup", use: "In the cup",
    grading: ["cupping-and-q-grading", "How coffee is scored"] },
  cocoa: { label: "Cocoa", species: ["criollo", "forastero", "trinitario", "nacional"],
    processes: ["fermented", "unfermented", "sun-dried", "machine-dried", "other"],
    forms: ["pods", "wet-beans", "dried-beans", "nibs", "chocolate"], journey: "From tree to bar", use: "Into chocolate",
    grading: ["cut-test", "How cocoa is graded"] },
  tea: { label: "Tea", species: ["sinensis", "assamica"],
    processes: ["white", "green", "oolong", "black", "dark", "other"],
    forms: ["fresh-leaf", "made-tea"], journey: "From garden to cup", use: "In the cup" },
  spice: { label: "Spices", species: ["nutmeg", "clove", "pepper", "cinnamon", "cardamom", "ginger", "turmeric", "other"],
    processes: ["sun-dried", "machine-dried", "fermented", "other"],
    forms: ["fresh", "dried", "ground", "oil"], journey: "From farm to kitchen", use: "In the kitchen" },
  vanilla: { label: "Vanilla", species: ["planifolia", "tahitensis", "pompona"],
    processes: ["sun-cured", "oven-cured", "other"],
    forms: ["green-pods", "cured-pods", "extract", "powder"], journey: "From vine to kitchen", use: "In the kitchen" },
  honey: { label: "Honey", species: ["apis-mellifera", "apis-cerana", "apis-dorsata", "stingless-bee", "other"],
    processes: ["raw", "filtered", "dehumidified", "creamed", "other"],
    forms: ["comb", "liquid", "crystallised"], journey: "From hive to jar", use: "On the table" },
  sugar: { label: "Palm & coconut sugar", species: ["aren", "coconut", "lontar", "nipa", "other"],
    processes: ["open-pan", "vacuum", "other"],
    forms: ["sap", "block", "granulated", "liquid"], journey: "From tree to kitchen", use: "In the kitchen" },
};
const processesFor = (crop) => CROPS[crop]?.processes || [];
const formsFor = (crop) => CROPS[crop]?.forms || [];

export const TOLD_BY = ["farmer", "producer-group", "roaster", "researcher", "editor", "other"];

// origin: a profile of a growing region (Gayo, Yirgacheffe). One per region, written from many sources.
// farm: one farmer, farm or cooperative's own story. Many per origin; link it with `origin: <slug>`.
// movement: a community, cooperative or initiative and what it changes.
export const KINDS = ["origin", "farm", "movement"];

// Steps of the farm-to-table journey, in the order they usually happen.
export const STAGES = ["farm", "harvest", "process", "dry", "sort", "roast", "brew", "market", "other"];

// How far back a story's product can be traced. Region and producer may be broad for country or blend.
export const TRACEABILITY = ["farm", "group", "region", "country", "blend"];

const REQUIRED = ["title", "crop", "country", "producer", "summary", "language", "told_by", "contributor", "consent"];

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
    const { data, content } = readFront(raw, file);
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
  try { files = (await walk(LEARN_DIR)).sort(); } catch (e) { if (e.code === "ENOENT") return []; throw e; }
  const out = [];
  for (const file of files) {
    const { data, content } = readFront(await readFile(file, "utf8"), file);
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
  errors.push(...citationErrors(k.body, k.sources));
  return errors;
}

// Producer profiles: producers/<country>/<slug>.md. Only id, name and consent are required.
// Permanent ids: a kind prefix, a hyphen and 8 random characters: O-… for an origin profile,
// S-… for a farm or movement story and P-… for a producer. They never change, so names and files can be renamed freely.
export const ID_PREFIX = { origin: "O", story: "S", producer: "P", lot: "L" };
const ID_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O, 1/I/L, easy to read aloud
export function newId(prefix) {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `${prefix}-${[...bytes].map((b) => ID_CHARS[b % ID_CHARS.length]).join("")}`;
}
export function idErrors(v, prefix) {
  if (v === undefined) return [`missing required field "id": add a permanent id such as id: ${newId(prefix)}`];
  if (typeof v !== "string" || !new RegExp(`^${prefix}-[A-Z0-9]{8}$`).test(v)) return [`id must be "${prefix}-" followed by 8 capital letters or digits, e.g. ${newId(prefix)}`];
  return [];
}
export const PRODUCERS_DIR = path.join(ROOT, "producers");
// Everyone who shapes a lot gets a profile: growers, processing facilities (mills, washing stations) and roasters.
export const PRODUCER_TYPES = ["farmer", "group", "estate", "processor", "roaster"];
// consent: true means the people named agreed. consent: public is only for a business or group (never a single
// farmer) and means every fact was already published (by the organisation or its buyers), with the links in sources.
const consentErrors = (consent, sources, what) => {
  if (consent === true) return [];
  if (consent === "public") return Array.isArray(sources) && sources.length ? [] : [`consent: public needs sources: links to where the ${what} was published`];
  return [`consent must be true (everyone named agreed) or public (an organisation, only facts already published, with sources)`];
};

export async function loadProducers() {
  let files = [];
  try { files = (await walk(PRODUCERS_DIR)).sort(); } catch (e) { if (e.code === "ENOENT") return []; throw e; }
  const out = [];
  for (const file of files) {
    const { data, content } = readFront(await readFile(file, "utf8"), file);
    const parts = path.relative(PRODUCERS_DIR, file).split(path.sep);
    out.push({ ...data, body: content.trim(), file: path.relative(ROOT, file), depth: parts.length, pathCountry: parts[0], slug: (parts[1] || "").replace(/\.md$/, "") });
  }
  return out;
}

const isPhoto = (v) => (isHttpUrl(v) && String(v).startsWith("https:")) || /^photos\/[a-z0-9/_-]+\.(jpe?g|png|webp)$/i.test(String(v));

export function validateProducer(p) {
  const errors = [];
  if (p.depth !== 2) return [`producer files go in producers/<country>/<name>.md`];
  if (!/^[a-z]{2}$/.test(p.pathCountry)) errors.push(`folder must be a two-letter country code, e.g. producers/id/`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`file name must be lowercase words joined by hyphens, e.g. producers/id/koperasi-gayo.md`);
  errors.push(...idErrors(p.id, ID_PREFIX.producer));
  if (!p.name || typeof p.name !== "string") errors.push(`missing required field "name"`);
  errors.push(...consentErrors(p.consent, p.sources, "information"));
  if (p.consent === "public" && (p.type === undefined || p.type === "farmer")) errors.push(`consent: public is only for an organisation: set type to group, estate, processor or roaster`);
  if (p.sources !== undefined && !(Array.isArray(p.sources) && p.sources.every(isHttpUrl))) errors.push(`sources must be a list of http(s) links`);
  if (p.type !== undefined && !PRODUCER_TYPES.includes(p.type)) errors.push(`type must be one of: ${PRODUCER_TYPES.join(", ")}`);
  if (p.since !== undefined && !(Number.isInteger(p.since) && p.since > 1700 && p.since <= new Date().getFullYear())) errors.push(`since must be a year, e.g. 2008`);
  if (p.farm_size_ha !== undefined && !(isNum(p.farm_size_ha) && p.farm_size_ha > 0)) errors.push(`farm_size_ha must be a positive number`);
  if (p.members !== undefined && !(Number.isInteger(p.members) && p.members > 0)) errors.push(`members must be a whole number`);
  if (p.website !== undefined && !(isHttpUrl(p.website) && String(p.website).startsWith("https:"))) errors.push(`website must be an https link`);
  if (p.photo !== undefined && !isPhoto(p.photo)) errors.push(`photo must be an https link or a file in photos/`);
  if (p.photo !== undefined && !p.photo_credit) errors.push(`photo needs a photo_credit`);
  if (p.crops !== undefined && !(isStrList(p.crops) && p.crops.every((c) => CROPS[c]))) errors.push(`crops must be a list from: ${Object.keys(CROPS).join(", ")}`);
  return errors;
}

// No two files may share an id. Pass every story and producer. Returns errors keyed by file.
export function duplicateIds(items) {
  const errors = new Map();
  for (const p of items) {
    const other = items.find((x) => x !== p && x.id !== undefined && String(x.id) === String(p.id));
    if (other) errors.set(p.file, [`id "${p.id}" is also used by ${other.file}; give this file a new one, e.g. ${newId(String(p.id)[0])}`]);
  }
  return errors;
}

// Connects stories to producer profiles through the story's "profile" field (the profile's id). Returns errors keyed by file.
export function linkProducers(stories, producers) {
  const errors = new Map();
  for (const p of producers) p.stories = [];
  for (const s of stories) {
    if (s.profile === undefined) continue;
    const p = producers.find((x) => String(x.id) === String(s.profile));
    if (!p) errors.set(s.file, [`profile "${s.profile}" not found: use the id of a profile in producers/`]);
    else { s.producerProfile = p; p.stories.push(s); }
  }
  return errors;
}

// A "[n]" footnote in a body must point to one of the entry's sources.
export function citationErrors(body, sources) {
  const n = Array.isArray(sources) ? sources.length : 0;
  const bad = [...String(body || "").matchAll(/\[(\d+)\](?!\()/g)].map((m) => Number(m[1])).filter((i) => i < 1 || i > n);
  return bad.length ? [`footnote ${[...new Set(bad)].map((i) => `[${i}]`).join(", ")} has no matching link in sources (${n} listed)`] : [];
}

// Lots: lots/<crop>/<country>/<story-slug>/<name>.md. A lot is one harvest, shipment or production run
// (what a buyer actually buys); process, variety, form and quality belong to it, not to the story or the origin.
export const LOTS_DIR = path.join(ROOT, "lots");

export async function loadLots() {
  let files = [];
  try { files = (await walk(LOTS_DIR)).sort(); } catch (e) { if (e.code === "ENOENT") return []; throw e; }
  const out = [];
  for (const file of files) {
    const { data, content } = readFront(await readFile(file, "utf8"), file);
    const parts = path.relative(LOTS_DIR, file).split(path.sep);
    // lots/<crop>/<country>/<story>/<name>.md belongs to that story; lots/<crop>/<name>.md links by id instead.
    const [crop, country, storySlug, name] = parts.length === 2 ? [parts[0], undefined, undefined, parts[1]] : parts;
    // YAML reads an unquoted 2025-06-01 as a Date; keep it as the written YYYY-MM-DD text.
    if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
    if (typeof data.process === "string") data.process = [data.process];
    out.push({ ...data, notes: content.trim(), file: path.relative(ROOT, file), depth: parts.length, pathCrop: crop, pathCountry: country, storySlug, slug: name ? name.replace(/\.md$/, "") : "" });
  }
  return out;
}

// YYYY, YYYY-MM or YYYY-MM-DD, and a day that exists in that month.
function isPartialDate(v) {
  const m = String(v ?? "").match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), m[2] && Number(m[2]), m[3] && Number(m[3])];
  if (mo !== undefined && (mo < 1 || mo > 12)) return false;
  if (d !== undefined && (d < 1 || d > new Date(Date.UTC(y, mo, 0)).getUTCDate())) return false;
  return true;
}

// Which stories and producer a lot belongs to: the story folder it sits in, plus any `stories: [S-…]` (a blend
// of several farms or origins) and `producer: P-…` (e.g. a roaster's lot whose farms have no story yet).
export function resolveLot(l, stories, producers = []) {
  const errors = [];
  const out = [];
  if (l.storySlug) {
    const story = stories.find((s) => s.pathCrop === l.pathCrop && s.pathCountry === l.pathCountry && s.slug === l.storySlug);
    if (!story) errors.push(`no story stories/${l.pathCrop}/${l.pathCountry}/${l.storySlug}.md for this lot`);
    else out.push(story);
  }
  if (l.stories !== undefined) {
    if (!isStrList(l.stories)) errors.push(`stories must be a list of story ids, e.g. [S-K7M2XQ9P]`);
    else for (const sid of l.stories) {
      const story = stories.find((s) => String(s.id) === sid);
      if (!story) errors.push(`story "${sid}" not found`);
      else if (story.crop !== l.pathCrop) errors.push(`story "${sid}" is ${story.crop}, but this lot is in lots/${l.pathCrop}/`);
      else if (!out.includes(story)) out.push(story);
    }
  }
  for (const story of out) if (story.kind === "origin") errors.push(`lots belong to a farm, group or movement story, not an origin profile (${story.id})`);
  let producer = null;
  if (l.producer !== undefined) {
    producer = producers.find((p) => String(p.id) === String(l.producer)) || null;
    if (!producer) errors.push(`producer "${l.producer}" not found: use the id of a profile in producers/`);
  }
  if (!out.length && l.producer === undefined) errors.push(`a lot in lots/${l.pathCrop}/ needs stories: [S-…] or producer: P-… (or put it in a story's folder)`);
  return { stories: out, producer, errors };
}

// A party field (processed_by, roasted_by, sold_by) is free text, or a producer id that must exist.
const partyErrors = (key, v, producers) => {
  if (v === undefined) return [];
  if (typeof v !== "string" || !v.trim()) return [`${key} must be a name or a producer id such as P-H7FAQRHQ`];
  if (/^P-/.test(v) && !producers.some((p) => String(p.id) === v)) return [`${key} "${v}" not found: use the id of a profile in producers/, or write a name`];
  return [];
};

export function validateLot(l, stories, producers = []) {
  const errors = [];
  if (l.depth !== 4 && l.depth !== 2) return [`lot files go in lots/<crop>/<country>/<story>/<name>.md, or lots/<crop>/<name>.md with stories or producer`];
  if (!CROPS[l.pathCrop]) return [`lots/${l.pathCrop}/ is not an open crop (${Object.keys(CROPS).join(", ")})`];
  errors.push(...idErrors(l.id, ID_PREFIX.lot));
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.slug)) errors.push(`lot file name must be lowercase words joined by hyphens, e.g. 2025-honey-1`);
  errors.push(...resolveLot(l, stories, producers).errors);
  if (!isPartialDate(l.date)) errors.push(`date must be a real date written YYYY, YYYY-MM or YYYY-MM-DD`);
  if (l.name !== undefined && !(typeof l.name === "string" && l.name.trim())) errors.push(`name must be text, e.g. "Gayo Honey"`);
  if (l.process !== undefined) {
    if (!isStrList(l.process)) errors.push(`process must be a word or a list, e.g. honey`);
    else for (const p of l.process) if (!processesFor(l.pathCrop).includes(p)) errors.push(`process "${p}" is not a ${l.pathCrop} process (${processesFor(l.pathCrop).join(", ")})`);
  }
  if (l.varieties !== undefined && !isStrList(l.varieties)) errors.push(`varieties must be a list of names`);
  if (l.form !== undefined && !formsFor(l.pathCrop).includes(l.form)) errors.push(`form must be one of: ${formsFor(l.pathCrop).join(", ")}`);
  errors.push(...["processed_by", "roasted_by", "sold_by"].flatMap((k) => partyErrors(k, l[k], producers)));
  if (l.traceability !== undefined && !TRACEABILITY.includes(l.traceability)) errors.push(`traceability must be one of: ${TRACEABILITY.join(", ")}`);
  if (l.quantity_kg !== undefined && !(isNum(l.quantity_kg) && l.quantity_kg > 0)) errors.push(`quantity_kg must be a positive number`);
  const spec = QUALITY[l.pathCrop] || [];
  const q = l.quality;
  if (q !== undefined) {
    if (!q || typeof q !== "object" || Array.isArray(q)) errors.push(`quality must be a block of fields (${spec.map((f) => f[0]).join(", ")})`);
    else for (const [k, v] of Object.entries(q)) {
      const f = spec.find((x) => x[0] === k);
      if (!f) errors.push(`quality.${k} is not a ${l.pathCrop} quality field (${spec.map((x) => x[0]).join(", ")})`);
      else if (f[3] === null ? (typeof v !== "string" && !isNum(v)) : !(isNum(v) && v >= f[3] && v <= f[4])) {
        errors.push(f[3] === null ? `quality.${k} must be text` : `quality.${k} must be a number from ${f[3]} to ${f[4]}`);
      }
    }
  }
  if (q?.cupping_score !== undefined && !(typeof l.tested_by === "string" && l.tested_by.trim())) errors.push(`a cupping score needs tested_by (e.g. "Licensed Q Grader, Name")`);
  if (l.sources !== undefined && !(Array.isArray(l.sources) && l.sources.every(isHttpUrl))) errors.push(`sources must be a list of http(s) links`);
  if (l.certificate !== undefined && !(isHttpUrl(l.certificate) && String(l.certificate).startsWith("https:"))) errors.push(`certificate must be an https link`);
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
  if (!s.region && !["country", "blend"].includes(s.traceability)) errors.push(`missing required field "region" (optional only when traceability is country or blend)`);
  errors.push(...idErrors(s.id, s.kind === "origin" ? ID_PREFIX.origin : ID_PREFIX.story));
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
  errors.push(...consentErrors(s.consent, s.sources, "story's facts"));
  if (s.consent === "public" && s.told_by === "farmer") errors.push(`a story told by a farmer needs consent: true`);
  if (s.altitude_masl !== undefined) {
    const a = s.altitude_masl;
    if (!Array.isArray(a) || a.length !== 2 || !a.every(isNum) || a[0] > a[1] || a[1] > 3500) {
      errors.push(`altitude_masl must be [min, max] in metres, e.g. [1200, 1600]`);
    }
  }
  if (s.process !== undefined) {
    if (!isStrList(s.process)) errors.push(`process must be a list, e.g. [washed]`);
    else for (const p of s.process) if (!processesFor(s.crop).includes(p)) errors.push(`process "${p}" is not a ${s.crop} process (${processesFor(s.crop).join(", ")})`);
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
  if (s.lot !== undefined || s.cupping_score !== undefined) errors.push(`quality and lot data live in lot files under lots/; see CONTRIBUTING.md`);
  if (s.traceability !== undefined && !TRACEABILITY.includes(s.traceability)) errors.push(`traceability must be one of: ${TRACEABILITY.join(", ")}`);
  if (s.sources !== undefined) {
    if (!Array.isArray(s.sources)) errors.push(`sources must be a list of links, e.g. [https://example.org/page]`);
    else for (const u of s.sources) if (!isHttpUrl(u)) errors.push(`source "${u}" must be an http(s) link`);
  }
  errors.push(...citationErrors(s.body, s.sources));
  if (s.photo !== undefined && !(isHttpUrl(s.photo) && String(s.photo).startsWith("https:")) && !/^photos\/[a-z0-9/_-]+\.(jpe?g|png|webp)$/i.test(String(s.photo))) {
    errors.push(`photo must be an https link or a file in photos/, e.g. photos/id/gayo.jpg`);
  }
  if (s.photo !== undefined && !s.photo_credit) errors.push(`photo needs a photo_credit`);
  if (!s.body || s.body.length < 200) errors.push(`the story itself is too short (at least a few sentences)`);
  return errors;
}
