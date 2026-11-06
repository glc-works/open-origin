// The one list of frontmatter fields for stories, producer profiles, lots, Learn entries and translations.
// Validation (required fields, and no field outside the list), the TypeScript types below, and the docs table
// (`npm run schema`) all come from here. To add a field: add it here, then add any extra rule (allowed values, ranges) in lib.ts.

export type FieldType =
  | "text" | "number" | "integer" | "boolean" | "date" | "id" | "link"
  | "list" | "links" | "range" | "coords" | "block" | "consent";

export interface Field {
  type: FieldType;
  required?: true;
  doc: string;
}

export const STORY = {
  id: { type: "id", required: true, doc: "permanent id: O- for an origin profile, S- for a farm or movement story" },
  kind: { type: "text", required: true, doc: "origin, farm or movement" },
  title: { type: "text", required: true, doc: "" },
  crop: { type: "text", required: true, doc: "coffee, cocoa, tea, spice, vanilla, honey or sugar (palm and coconut)" },
  country: { type: "text", required: true, doc: "two-letter ISO code, e.g. ID" },
  region: { type: "text", doc: "required unless traceability is country or blend" },
  producer: { type: "text", required: true, doc: "who grows or makes it, as the teller names them" },
  summary: { type: "text", required: true, doc: "at most 200 characters" },
  language: { type: "text", required: true, doc: "language code of the story, e.g. en, id" },
  told_by: { type: "text", required: true, doc: "farmer, producer-group, roaster, researcher, editor or other" },
  contributor: { type: "text", required: true, doc: "who wrote it down" },
  consent: { type: "consent", required: true, doc: "true (everyone named agreed) or public (an organisation, published facts only)" },
  origin: { type: "id", doc: "the O- origin profile a farm or movement story belongs to" },
  profile: { type: "id", doc: "the P- producer profile of the farm or group" },
  species: { type: "text", doc: "required for a farm story" },
  varieties: { type: "list", doc: "" },
  process: { type: "list", doc: "processes from the crop's list" },
  harvest: { type: "text", doc: "harvest months, e.g. May–Sep" },
  altitude_masl: { type: "range", doc: "[min, max] in metres" },
  tasting_notes: { type: "list", doc: "at most 4" },
  coords: { type: "coords", doc: "[latitude, longitude], 2 decimals at most" },
  area: { type: "block", doc: "public place codes: iso3166_2, admin_codes, wikidata, geonames" },
  traceability: { type: "text", doc: "farm, group, region, country or blend" },
  journey: { type: "block", doc: "list of { stage, text } steps; for the illustrated journey a step may add title, more (a fact), why (tap for more), then (the line to the next step), scene (scripts/scenes.ts), count { from, to, unit } and cite: [n]" },
  did_you_know: { type: "block", doc: "{ text, cite: [n] }: one surprising fact with its source, shown beside the journey" },
  sources: { type: "links", doc: "http(s) links; cite them in the text as [1], [2]" },
  photo: { type: "link", doc: "https link or a file in photos/" },
  photo_credit: { type: "text", doc: "required with photo" },
  photo_license: { type: "text", doc: "licence of a photo from elsewhere: CC BY 4.0, CC BY-SA 4.0, CC0 or Public domain" },
  photo_source: { type: "link", doc: "https page the photo came from, e.g. on Wikimedia Commons" },
  issue: { type: "integer", doc: "number of the GitHub issue the story was submitted in (written by the form workflow)" },
} as const satisfies Record<string, Field>;

export const PRODUCER = {
  id: { type: "id", required: true, doc: "permanent P- id" },
  name: { type: "text", required: true, doc: "" },
  consent: { type: "consent", required: true, doc: "true, or public for an organisation using published facts with sources" },
  type: { type: "text", doc: "farmer, group, estate, processor, roaster or lab" },
  crops: { type: "list", doc: "crops from the open list" },
  region: { type: "text", doc: "" },
  village: { type: "text", doc: "" },
  since: { type: "integer", doc: "year started" },
  farm_size_ha: { type: "number", doc: "" },
  members: { type: "integer", doc: "" },
  website: { type: "link", doc: "https link" },
  logo: { type: "link", doc: "https link or a file in photos/" },
  photo: { type: "link", doc: "https link or a file in photos/" },
  photo_credit: { type: "text", doc: "required with photo" },
  photo_license: { type: "text", doc: "licence of a photo from elsewhere: CC BY 4.0, CC BY-SA 4.0, CC0 or Public domain" },
  photo_source: { type: "link", doc: "https page the photo came from, e.g. on Wikimedia Commons" },
  sources: { type: "links", doc: "http(s) links" },
} as const satisfies Record<string, Field>;

export const LOT = {
  id: { type: "id", required: true, doc: "permanent L- id" },
  date: { type: "date", required: true, doc: "YYYY, YYYY-MM or YYYY-MM-DD" },
  name: { type: "text", doc: "" },
  stories: { type: "list", doc: "S- ids the lot comes from (several for a blend)" },
  producer: { type: "id", doc: "P- profile the lot is filed under" },
  form: { type: "text", doc: "from the crop's list, e.g. green, roasted" },
  process: { type: "list", doc: "processes from the crop's list" },
  varieties: { type: "list", doc: "" },
  processed_by: { type: "text", doc: "name or P- id" },
  roasted_by: { type: "text", doc: "name or P- id" },
  sold_by: { type: "text", doc: "name or P- id" },
  tested_by: { type: "text", doc: "name or P- id of a lab or grader" },
  traceability: { type: "text", doc: "farm, group, region, country or blend" },
  quantity_kg: { type: "number", doc: "" },
  quality: { type: "block", doc: "the crop's quality fields" },
  certificate: { type: "link", doc: "https link" },
  sources: { type: "links", doc: "http(s) links" },
  refs: { type: "block", doc: "trade references, all quoted: hs_code, ico_mark, gtin, gln, eudr_dds, skus (trader name: code)" },
} as const satisfies Record<string, Field>;

// Trade references a lot can carry. The L- id stays the reference; these let a trader find it from their own papers.
export const REFS = {
  hs_code: "customs (HS) code, e.g. \"0901.11\"",
  ico_mark: "ICO mark on a coffee bag, e.g. \"002/1234/0123\"",
  gtin: "GS1 barcode number (GTIN-8, 12, 13 or 14)",
  gln: "GS1 location number of the seller (13 digits)",
  eudr_dds: "EU deforestation regulation due diligence statement reference",
  skus: "each trader's own code, e.g. { Kopi Kita: \"GAYO-HONEY-25\" }",
} as const;

// Learn entries: learn/<crop>/<slug>.md. The variety fields are only for type: variety.
export const LEARN = {
  title: { type: "text", required: true, doc: "" },
  crop: { type: "text", required: true, doc: "the crop folder it sits in" },
  type: { type: "text", required: true, doc: "species, process, variety or term" },
  summary: { type: "text", required: true, doc: "at most 200 characters" },
  latin: { type: "text", doc: "scientific name" },
  species: { type: "text", doc: "variety: the species it belongs to (required for a variety)" },
  lineage: { type: "text", doc: "variety: where it comes from" },
  aliases: { type: "list", doc: "variety: other names, including local ones; story varieties link through these" },
  stature: { type: "text", doc: "variety: dwarf, semi-dwarf or tall" },
  yield_potential: { type: "text", doc: "variety: low, medium, high or very high" },
  quality_potential: { type: "text", doc: "variety: fair, good, very good or exceptional" },
  leaf_rust: { type: "text", doc: "variety: resistant, tolerant or susceptible" },
  altitude_masl: { type: "range", doc: "variety: [min, max] in metres" },
  sources: { type: "links", doc: "http(s) links; cite them in the text as [1], [2]" },
} as const satisfies Record<string, Field>;

// A story translation, <slug>.<lang>.md next to the story: only the words. Facts stay in the story.
export const STORY_TRANSLATION = {
  title: { type: "text", required: true, doc: "" },
  summary: { type: "text", required: true, doc: "at most 200 characters" },
  language: { type: "text", required: true, doc: "language code; must match the file name" },
  translator: { type: "text", required: true, doc: "who translated it" },
  region: { type: "text", doc: "the region's name in this language" },
  tasting_notes: { type: "list", doc: "at most 4" },
  journey: { type: "block", doc: "the story's journey steps, translated, in the same order" },
  did_you_know: { type: "text", doc: "the translated did_you_know text" },
} as const satisfies Record<string, Field>;

// A Learn translation, <slug>.<lang>.md next to the entry. The language comes from the file name.
export const LEARN_TRANSLATION = {
  title: { type: "text", required: true, doc: "" },
  summary: { type: "text", required: true, doc: "at most 200 characters" },
  translator: { type: "text", required: true, doc: "who translated it" },
} as const satisfies Record<string, Field>;

export const SCHEMAS = { story: STORY, producer: PRODUCER, lot: LOT, learn: LEARN, story_translation: STORY_TRANSLATION, learn_translation: LEARN_TRANSLATION } as const;

// Edit distance, to suggest the field someone probably meant.
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** A field that is not in the schema would be dropped without a word, so it is an error, with the closest known field as a hint. */
export function unknownErrors(schema: Record<string, Field>, keys: string[] = []): string[] {
  const known = Object.keys(schema);
  return keys.filter((k) => !Object.hasOwn(schema, k)).map((k) => {
    const low = k.toLowerCase();
    // The closest field by spelling, or one that starts the same way (quantity -> quantity_kg).
    const near = known.map((f) => [f, f.startsWith(low) || low.startsWith(f) ? 0 : distance(low, f)] as const).sort((a, b) => a[1] - b[1])[0];
    const hint = near && near[1] <= Math.max(2, Math.floor(k.length / 3)) ? `; did you mean "${near[0]}"?` : "";
    return `unknown field "${k}"${hint} (see npm run schema for the fields)`;
  });
}

/** Fields a file must have, in the order they are listed. */
export const requiredKeys = (schema: Record<string, Field>): string[] =>
  Object.entries(schema).filter(([, f]) => f.required).map(([k]) => k);

export const missingErrors = (schema: Record<string, Field>, obj: Record<string, unknown>, skip: string[] = []): string[] =>
  requiredKeys(schema).filter((k) => !skip.includes(k) && (obj[k] === undefined || obj[k] === null || obj[k] === ""))
    .map((k) => `missing required field "${k}"`);

// Types for the frontmatter as written. Every field is optional here because the validator, not the type,
// reports what is missing; code that runs after validation can rely on the required ones.
type ValueOf<T extends FieldType> =
  T extends "number" | "integer" ? number :
  T extends "boolean" ? boolean :
  T extends "list" | "links" ? string[] :
  T extends "range" | "coords" ? [number, number] :
  T extends "consent" ? true | "public" :
  T extends "block" ? any :
  string;
type Front<S extends Record<string, Field>> = { -readonly [K in keyof S]?: ValueOf<S[K]["type"]> };

export type StoryFront = Front<typeof STORY>;
export type ProducerFront = Front<typeof PRODUCER>;
export type LotFront = Front<typeof LOT>;

// Fields the loader adds from the file path.
interface FileInfo { file: string; slug: string; pathCountry?: string; depth?: number; frontKeys?: string[] }
export type Story = StoryFront & FileInfo & { pathCrop: string; body: string; translations?: any[]; [extra: string]: any };
export type Producer = ProducerFront & FileInfo & { body: string; [extra: string]: any };
export type Lot = Omit<LotFront, "process"> & FileInfo & { process?: string[]; pathCrop: string; storySlug?: string; notes: string; [extra: string]: any };

/** Markdown table of a schema, for CONTRIBUTING and `npm run schema`. */
export function schemaTable(schema: Record<string, Field>): string {
  const rows = Object.entries(schema).map(([k, f]) => `| \`${k}\` | ${f.type} | ${f.required ? "yes" : ""} | ${f.doc} |`);
  return ["| Field | Type | Required | Notes |", "|---|---|---|---|", ...rows].join("\n");
}

// node scripts/schema.ts prints the tables.
if (process.argv[1]?.endsWith("schema.ts")) {
  for (const [name, s] of Object.entries(SCHEMAS)) console.log(`### ${name}\n\n${schemaTable(s)}\n`);
}
