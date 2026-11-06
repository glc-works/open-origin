// The one list of frontmatter fields for stories, producer profiles and lots.
// Validation (required fields), the TypeScript types below, and the docs table (`npm run schema`) all come from here.
// To add a field: add it here, then add any extra rule (allowed values, ranges) in lib.ts.

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
  crop: { type: "text", required: true, doc: "coffee, cocoa, tea, spices, vanilla, honey, palm-sugar, coconut-sugar" },
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
  journey: { type: "block", doc: "list of { stage, text } steps" },
  sources: { type: "links", doc: "http(s) links; cite them in the text as [1], [2]" },
  photo: { type: "link", doc: "https link or a file in photos/" },
  photo_credit: { type: "text", doc: "required with photo" },
  photo_license: { type: "text", doc: "licence of a photo from elsewhere: CC BY 4.0, CC BY-SA 4.0, CC0 or Public domain" },
  photo_source: { type: "link", doc: "https page the photo came from, e.g. on Wikimedia Commons" },
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
} as const satisfies Record<string, Field>;

export const SCHEMAS = { story: STORY, producer: PRODUCER, lot: LOT } as const;

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
interface FileInfo { file: string; slug: string; pathCountry?: string; depth?: number }
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
