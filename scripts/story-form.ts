// The "Share a story" fields in one place, with no dependencies, so three readers agree on them:
// the GitHub issue form (.github/ISSUE_TEMPLATE/story.yml), scripts/issue-to-story.ts, which reads an issue back,
// and the web form relay (relay/worker.ts), which writes an issue for people without a GitHub account.

// [key, heading in the issue body]. The order is the order of the form; issue-to-story relies on it.
// The last two are only written by the web form.
export const FIELDS = [
  ["kind", "What kind of story?"], ["crop", "Crop"], ["title", "Story title"], ["country", "Country code"],
  ["traceability", "How far can it be traced?"], ["region", "Region"], ["origin", "Which origin is this part of? (optional)"],
  ["producer", "Farmer, farm or cooperative"], ["species", "Species or type"], ["altitude", "Altitude in metres (optional)"],
  ["varieties", "Varieties (optional, separate with commas)"], ["process", "Process (optional)"], ["harvest", "Harvest months (optional)"],
  ["tasting_notes", "Tasting notes (optional, up to 4, separate with commas)"], ["town", "Nearest town or village (optional)"],
  ["summary", "Short summary"], ["story", "The story"], ["journey", "From farm to cup (optional)"], ["photo", "Photo (optional)"],
  ["photo_credit", "Photo credit (optional)"], ["told_by", "Who is telling this story?"], ["language", "Language of the story"],
  ["sources", "Sources (optional)"], ["consent", "Consent"],
  ["contributor", "Name to credit (web form)"], ["coords", "Approximate location (web form)"],
];
export const LABELS = Object.fromEntries(FIELDS.map(([k, h]) => [h, k]));
export const ORDER = FIELDS.map(([k]) => k);

// Keep in step with CROPS and TOLD_BY in scripts/lib.ts; npm test checks this.
export const CROP_KEYS = ["coffee", "cocoa", "tea", "spice", "vanilla", "honey", "sugar"];
export const KINDS = ["farm", "movement", "origin"];
export const TRACEABILITY = ["farm", "group", "region", "country", "blend"];
export const TOLD_BY = ["farmer", "producer-group", "roaster", "researcher", "other"];
export const CONSENT = [
  "Everyone named or pictured in this story agreed to have it published.",
  "I agree to publish this story and photo under CC BY 4.0.",
];

// Longest accepted text per field, in characters. Anything not listed is not accepted at all.
export const MAX = {
  kind: 20, crop: 20, title: 120, country: 2, traceability: 20, region: 120, origin: 60, producer: 120, species: 60,
  altitude: 40, varieties: 200, process: 120, harvest: 60, tasting_notes: 160, town: 120, summary: 200, story: 20000,
  journey: 4000, photo: 300, photo_credit: 120, told_by: 20, language: 12, sources: 2000, contributor: 80,
};
// The story format wants at least a few sentences (scripts/lib.ts checks the same).
export const MIN_STORY = 200;
export const REQUIRED = ["kind", "crop", "title", "country", "traceability", "producer", "summary", "story", "told_by", "language", "contributor"];

// A checked submission: the text fields by key, plus the rounded location.
export type Submission = { [field: string]: string | undefined } & { coords?: [number, number] };
export type SubmissionError = { field: string; code: "required" | "too-short" | "too-long" | "invalid" };

// Cleans one submission from the web form. Returns { data } or { errors: [{ field, code }] }.
// Codes are short words (required, too-short, too-long, invalid) so the form can say them in the reader's language.
export function checkSubmission(input: unknown): { data?: Submission; errors?: SubmissionError[] } {
  const errors: SubmissionError[] = [];
  const data: Submission = {};
  const src: Record<string, any> = input && typeof input === "object" ? input : {};
  for (const key of Object.keys(MAX)) {
    if (src[key] === undefined || src[key] === null) continue;
    if (typeof src[key] !== "string") { errors.push({ field: key, code: "invalid" }); continue; }
    // No control characters except new lines and tabs; Windows line ends become plain ones.
    const v = src[key].replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u2028-\u202E]/g, "").trim();
    if (!v) continue;
    const oneLine = !["story", "journey", "sources", "summary"].includes(key);
    data[key] = oneLine ? v.replace(/\s+/g, " ") : v;
    if ([...data[key]].length > MAX[key]) errors.push({ field: key, code: "too-long" });
  }
  for (const key of REQUIRED) if (!data[key]) errors.push({ field: key, code: "required" });
  if (data.story && data.story.length < MIN_STORY) errors.push({ field: "story", code: "too-short" });
  if (data.kind === "farm" && !data.species) errors.push({ field: "species", code: "required" });
  if (!data.region && !["country", "blend"].includes(data.traceability)) errors.push({ field: "region", code: "required" });
  const oneOf = (key: string, list: string[]) => { if (data[key] && !list.includes(data[key])) errors.push({ field: key, code: "invalid" }); };
  oneOf("kind", KINDS); oneOf("crop", CROP_KEYS); oneOf("traceability", TRACEABILITY); oneOf("told_by", TOLD_BY);
  if (data.country) { data.country = data.country.toUpperCase(); if (!/^[A-Z]{2}$/.test(data.country)) errors.push({ field: "country", code: "invalid" }); }
  if (data.language) { data.language = data.language.toLowerCase(); if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(data.language)) errors.push({ field: "language", code: "invalid" }); }
  if (data.sources && data.sources.split("\n").some((l) => l.trim() && !/^https?:\/\/\S+$/i.test(l.trim()))) errors.push({ field: "sources", code: "invalid" });
  if (data.photo && !/^https:\/\/\S+$/i.test(data.photo)) errors.push({ field: "photo", code: "invalid" });
  // Never store a precise spot: coordinates are rounded to 2 decimals (about 1 km) here as well as in the browser.
  if (src.coords !== undefined && src.coords !== null) {
    const [lat, lng] = Array.isArray(src.coords) ? src.coords.map(Number) : [NaN, NaN];
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) data.coords = [Math.round(lat * 100) / 100, Math.round(lng * 100) / 100];
    else errors.push({ field: "coords", code: "invalid" });
  }
  if (!(src.consent === true || (Array.isArray(src.consent) && src.consent.length === 2 && src.consent.every((c) => c === true)))) errors.push({ field: "consent", code: "required" });
  return errors.length ? { errors } : { data };
}

// Writes a checked submission as the same issue body the GitHub form makes, so issue-to-story reads both alike.
export function issueBody(data: Submission): string {
  // A line in someone's text that looks like one of our headings would split the story; escape it.
  const guard = (v: string) => String(v).split("\n").map((l) => (/^#{1,6} /.test(l) ? `\\${l}` : l)).join("\n");
  const value = (key: string) => {
    if (key === "consent") return CONSENT.map((c) => `- [X] ${c}`).join("\n");
    if (key === "coords") return data.coords ? data.coords.join(", ") : "_No response_";
    if (key === "photo") return data.photo ? `![photo](${data.photo})` : "_No response_";
    return data[key] ? guard(data[key]) : "_No response_";
  };
  return FIELDS.map(([key, heading]) => `### ${heading}\n\n${value(key)}`).join("\n\n") + "\n";
}
