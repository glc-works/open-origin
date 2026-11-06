// Turns an approved "Share a story" issue into a story file.
// Used by .github/workflows/issue-to-story.yml. Inputs come from env: ISSUE_BODY, ISSUE_NUMBER, ISSUE_AUTHOR.
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { ROOT, CROPS, STORIES_DIR, newId, ID_PREFIX } from "./lib.ts";

const LABELS = {
  "What kind of story?": "kind", "Which origin is this part of? (optional)": "origin", "How far can it be traced?": "traceability",
  "From farm to cup (optional)": "journey", "Crop": "crop", "Story title": "title", "Country code": "country", "Region": "region",
  "Farmer, farm or cooperative": "producer", "Species or type": "species",
  "Altitude in metres (optional)": "altitude", "Varieties (optional, separate with commas)": "varieties",
  "Process (optional)": "process", "Harvest months (optional)": "harvest",
  "Tasting notes (optional, up to 4, separate with commas)": "tasting_notes",
  "Nearest town or village (optional)": "town", "Short summary": "summary", "The story": "story",
  "Photo (optional)": "photo", "Photo credit (optional)": "photo_credit",
  "Who is telling this story?": "told_by", "Language of the story": "language",
  "Sources (optional)": "sources", "Consent": "consent",
};

// Splits the issue body on the form's own headings only, so a "### ..." line written inside a story stays in the story.
export function parseIssueForm(body) {
  const out = {};
  const lines = String(body).replace(/\r\n/g, "\n").split("\n");
  // Form fields in the order the form shows them; a heading only counts if it comes after the current one.
  const order = ["kind", "crop", "title", "country", "traceability", "region", "origin", "producer", "species", "altitude", "varieties", "process", "harvest", "tasting_notes", "town", "summary", "story", "journey", "photo", "photo_credit", "told_by", "language", "sources", "consent"];
  let key = null;
  let buf = [];
  const flush = () => {
    if (!key) return;
    const value = buf.join("\n").trim();
    if (value && value !== "_No response_" && value !== "None") out[key] = value;
  };
  for (const line of lines) {
    const m = line.match(/^### (.+?)\s*$/);
    if (m && LABELS[m[1]] && order.indexOf(LABELS[m[1]]) > order.indexOf(key)) {
      flush();
      key = LABELS[m[1]];
      buf = [];
    } else if (key) buf.push(line);
  }
  flush();
  return out;
}

const list = (v) => (v ? v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean) : undefined);
export const slugify = (s) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "story";

export function toStory(f, { number, author }) {
  const alt = f.altitude?.match(/(\d[\d.,]*)\D+(\d[\d.,]*)/);
  const num = (s) => Number(s.replace(/[.,]/g, ""));
  const photo = f.photo?.match(/https:\/\/[^\s)"'>]+/)?.[0];
  const consentOk = (f.consent?.match(/- \[x\]/gi) || []).length >= 2;
  const journey = f.journey?.split("\n").map((l) => l.match(/^\s*([a-z]+)\s*:\s*(.+)$/i)).filter(Boolean)
    .map((m) => ({ stage: m[1].toLowerCase(), text: m[2].trim() }));
  const data = {
    id: newId(f.kind === "origin" ? ID_PREFIX.origin : ID_PREFIX.story),
    title: f.title,
    kind: f.kind || "farm",
    ...(f.origin && { origin: slugify(f.origin) }),
    crop: f.crop,
    country: f.country?.trim().toUpperCase(),
    ...(f.traceability && { traceability: f.traceability }),
    ...(f.region && { region: f.region }),
    producer: f.producer,
    ...(f.species && { species: f.species.trim().toLowerCase() }),
    ...(alt && { altitude_masl: [num(alt[1]), num(alt[2])] }),
    ...(f.varieties && { varieties: list(f.varieties) }),
    ...(f.process && { process: list(f.process) }),
    ...(f.harvest && { harvest: f.harvest }),
    ...(f.tasting_notes && { tasting_notes: list(f.tasting_notes).slice(0, 4) }),
    ...(journey?.length && { journey }),
    summary: f.summary?.replace(/\s+/g, " ").trim(),
    ...(photo && { photo, photo_credit: f.photo_credit || author }),
    language: f.language?.trim().toLowerCase(),
    told_by: f.told_by,
    contributor: author,
    consent: consentOk,
    sources: list(f.sources) || [],
    issue: Number(number),
  };
  if (!CROPS[data.crop]) throw new Error(`Unknown crop "${data.crop}"`);
  if (!/^[A-Z]{2}$/.test(data.country || "")) throw new Error(`Country must be a 2-letter code, got "${data.country}"`);
  // The issue number keeps file names unique, so a submission can never replace an existing story.
  const file = path.join("stories", data.crop, data.country.toLowerCase(), `${slugify(f.title || "story")}-${Number(number)}.md`);
  return { file, text: matter.stringify(`\n${(f.story || "").trim()}\n`, data), town: f.town };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { ISSUE_BODY, ISSUE_NUMBER, ISSUE_AUTHOR, GITHUB_OUTPUT } = process.env;
  const { file, text, town } = toStory(parseIssueForm(ISSUE_BODY), { number: ISSUE_NUMBER, author: ISSUE_AUTHOR });
  const dest = path.resolve(ROOT, file);
  if (!dest.startsWith(STORIES_DIR + path.sep)) throw new Error(`Refusing to write outside stories/: ${file}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, text, { flag: "wx" }); // fails if the file already exists
  console.log(`Wrote ${file}`);
  if (GITHUB_OUTPUT) await appendFile(GITHUB_OUTPUT, `file=${file}\ntown=${(town || "").replace(/\n/g, " ")}\n`);
}
