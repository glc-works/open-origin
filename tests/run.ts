// Runs the validator against fixture folders: the good set must pass, the bad set must fail with these messages.
// npm test
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, mkdtempSync, cpSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const run = (script, dir) => spawnSync(process.execPath, [path.join(here, "..", "scripts", script)], {
  env: { ...process.env, OPEN_ORIGIN_ROOT: path.join(here, "fixtures", dir) }, encoding: "utf8" });
const validate = (dir) => run("validate.ts", dir);

let failed = 0;
const check = (ok, msg) => { if (!ok) failed++; console.log(`${ok ? "✓" : "✗"} ${msg}`); };

const good = validate("good");
check(good.status === 0, `good fixtures (cocoa, honey, sugar, tea; blend and roaster-only lots) pass${good.status ? `\n${good.stderr}` : ""}`);

// The good set must also build, and its pages must show the crop-specific parts.
const built = run("build.ts", "good");
check(built.status === 0, `good fixtures build${built.status ? `\n${built.stderr}` : ""}`);
if (built.status === 0) {
  const read = (p) => readFileSync(path.join(here, "fixtures", "good", "dist", p), "utf8");
  const farm = read("stories/cocoa/id/test-cocoa-farm/index.html");
  check(farm.includes("From tree to bar") && !farm.includes("How coffee is scored"), "cocoa story uses cocoa wording");
  check(farm.includes('id="L-TESTBKQW-A"') && farm.includes("Blended with cocoa from"), "blend lot shows on each of its stories");
  check(read("producers/P-TESTPQQW-T/index.html").includes('id="L-TESTRQQW-E"'), "a lot filed under a producer shows on its profile");
  check(read("s/L-TESTRQQW-E/index.html").includes("producers/P-TESTPQQW-T/#L-TESTRQQW-E"), "lot permalink leads to the producer page");
  const page = read("stories/cocoa/id/test-cocoa-origin/index.html");
  check(page.includes("ID-SR") && page.includes("76.04") && page.includes("wikidata.org/wiki/Q12345") && /plus\.codes\/[0-9A-Z]{6}00%2B/.test(page) && page.includes("H3 87"), "an origin shows its area codes, Plus Code and H3 cell");
  check(page.includes('<a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="license">CC BY-SA 4.0</a>') && page.includes('>Wikimedia Commons</a>') && page.includes("Photo: Test Photographer"), "a photo from Commons shows its author, licence and source");
  const codes = JSON.parse(read("codes.json"));
  check(codes["L-TESTCQQ3-3"]?.crops[0] === "cocoa" && codes["O-TESTCQQW-P"]?.place_codes.iso3166_2[0] === "ID-SR", "codes.json lists each code with its crop and place codes");
  check(farm.includes('class="crop-tag">Cocoa'), "codes are shown with their crop");
  check(codes["P-TESTPQQW-T"]?.crops.includes("cocoa"), "a producer's crops include the lots filed under it");
  check(farm.includes('Tested by <a href="../../../../producers/P-TESTKABQ-3/">Test cocoa lab</a>') && read("producers/P-TESTKABQ-3/index.html").includes('id="L-TESTCQQ3-3"'), "tested_by can link to a lab profile, which lists the lots it tested");
  check(farm.includes('class="tg tg-fruity"><b>Fruity</b><span class="tw">red fruit</span>') && farm.includes("Bitterness: low") && read("id/stories/cocoa/id/test-cocoa-farm/index.html").includes("<b>Buah</b><span class=\"tw\">buah merah</span>"), "tasting notes show their group, in the page's language");
  check(read("learn/tastes/index.html").includes('id="fermented"') && JSON.parse(read("data/tastes.json")).words["palm sugar"].id === "gula aren", "the tasting list has its own page and data file");
  const share = read("id/share/index.html");
  check(share.includes('<html lang="id">') && share.includes('id="share"') && share.includes("Kirim") && share.includes('src="../../share.js"') && read("share/index.html").includes('src="../share.js"'), "the story form is built in English at /share/ and Indonesian at /id/share/");
  check(read("index.html").includes('href="share/"') && read("id/index.html").includes('href="share/"'), "the header and buttons lead to the story form in the page's language");
  // Indonesian: the same pages under /id/, in Indonesian words, with shared files still at the root.
  const farmId = read("id/stories/cocoa/id/test-cocoa-farm/index.html");
  check(farmId.includes('<html lang="id">') && farmId.includes("Dari pohon ke cokelat") && farmId.includes('href="../../../../../style.css"'), "the Indonesian page uses Indonesian words and the shared stylesheet");
  check(farmId.includes('Diuji oleh <a href="../../../../producers/P-TESTKABQ-3/">'), "links on an Indonesian page stay on the Indonesian site");
  check(farm.includes('href="../../../../id/stories/cocoa/id/test-cocoa-farm/"') && farmId.includes('href="../../../../../stories/cocoa/id/test-cocoa-farm/"'), "each page links to the same page in the other language");
  const learnId = read("id/learn/cocoa/test-term/index.html");
  check(learnId.includes("Istilah uji") && learnId.includes('href="#src-1"') && read("learn/cocoa/test-term/index.html").includes("Test term"), "a Learn translation is shown on the Indonesian site, with the entry's sources");
  check(read("codes/id/index.html").includes("../../id/codes/") && read("id/codes/index.html").includes("Cari kode"), "the Indonesian code guide is at /id/codes/ and the old address redirects there");
  // Public API: one file per code, in the collection its prefix names, with the licence in every response.
  const api = (p) => JSON.parse(read(`api/v1/${p}`));
  const idx = api("index.json");
  check(idx.meta.license.name === "CC-BY-4.0" && idx.meta.attribution.includes("CC BY 4.0") && idx.data.endpoints.lot_by_id.endsWith("/api/v1/lots/{id}.json"), "API index lists endpoints and the licence");
  const lot = api("lots/L-TESTCQQ3-3.json");
  check(lot.data.id === "L-TESTCQQ3-3" && lot.data.crop === "cocoa" && lot.meta.links.permalink.endsWith("/s/L-TESTCQQ3-3/") && lot.meta.license.url.includes("by/4.0"), "a lot is served by its code, with crop and licence");
  check(lot.data.refs?.gtin === "4006381333931", "a lot's trade references are in its API record");
  const origin = api("origins/O-TESTCQQW-P.json");
  check(origin.data.place_codes.iso3166_2[0] === "ID-SR" && Array.isArray(origin.data.farms), "an origin is served with its place codes and farms");
  check(api("producers/P-TESTKABQ-3.json").data.lots.includes("L-TESTCQQ3-3"), "a lab's API record lists the lots it tested");
  const rows = api("origins.json");
  check(rows.meta.count === rows.data.length && rows.data.every((r) => r.id.startsWith("O-") && r.api.endsWith(`/origins/${r.id}.json`)), "the origins list has one row per origin, each pointing at its file");
  check(api("crops/cocoa.json").data.lots.some((r) => r.id === "L-TESTCQQ3-3"), "a crop file lists that crop's lots");
  const feed = JSON.parse(read("feed.json"));
  check(feed.version.includes("jsonfeed.org") && feed.items.length > 0 && feed.items.every((i) => i.date_published), "JSON Feed lists new records with dates");
  check(read("feed.xml").includes("<feed xmlns=\"http://www.w3.org/2005/Atom\">") && read("api/index.html").includes("api/v1/index.json"), "Atom feed and the API page are built");
  check(farm.includes("HS 1801.00") && farm.includes("GTIN 4006381333931") && farm.includes("Test Trader: TT-COCOA-25") && farm.includes('href="../../../../s/L-TESTCQQ3-3/qr.svg"') && farm.includes('href="../../../../api/v1/lots/L-TESTCQQ3-3.json"'), "a lot shows its trade references and a QR code link");
  const qr = read("s/L-TESTCQQ3-3/qr.svg");
  check(qr.startsWith("<svg") && qr.includes("L-TESTCQQ3-3 · COCOA</text>"), "each lot gets a QR code with its code printed under it");
  rmSync(path.join(here, "fixtures", "good", "dist"), { recursive: true, force: true });
}

const bad = validate("bad");
check(bad.status === 1, "bad fixtures fail");
for (const expected of [
  `species "arabica" is not one of: criollo, forastero, trinitario, nacional`,
  `process "washed" is not a cocoa process`,
  `a story told by a farmer needs consent: true`,
  `missing required field "id": add a permanent id such as id: L-`,
  `date must be a real date`,
  `form must be one of: pods, wet-beans, dried-beans, nibs, chocolate`,
  `sold_by "P-NQPENQPE-G" not found`,
  `quality.cupping_score is not a cocoa quality field`,
  `quality.fermented_pct must be a number from 0 to 100`,
  `consent: public is only for an organisation`,
  `story "S-NQPENQPE-M" not found`,
  `needs stories: [S-…] or producer: P-…`,
  `id "L-TESTQRQ2-D" has the wrong check character`,
  `story "S-TESTBQQW-R" not found (its check character does not match`,
  `roasted_by "p-testbqq2j" not found (write it as P-TESTBQQ2-J)`,
  `id must look like L-`,
  `area.iso3166_2 "MY-01" is not in country ID`,
  `area.wikidata "12345" must be a Wikidata id`,
  `area.plus is not known`,
  `no entry named no-such-entry.md next to this translation`,
  `area.admin_codes 11.1 must be in quotes`,
  `photo_license must be written like CC BY 4.0`,
  `photo_source must be an https link`,
  `unknown field "tasting_note"; did you mean "tasting_notes"?`,
  `unknown field "quantity"; did you mean "quantity_kg"?`,
  `unknown field "websit"; did you mean "website"?`,
  `unknown field "translater"; did you mean "translator"?`,
  `unknown field "constructor"`,
  `refs.ico_mark "002/1234/0123" must be an ICO mark such as "002/1234/0123" (coffee only)`,
  `refs.gtin "4006381333932" must be a GTIN of 8, 12, 13 or 14 digits with a correct last (check) digit`,
  `refs.gln 614141000005 must be in quotes`,
  `refs.barcode is not known`,
  `refs.skus must list each trader's code`,
  `tasting note "flowers" is not in the list; did you mean "floral"?`,
  `tasting note "durian" is not in the list; add it to scripts/tastes.ts`,
  `tasting note "heavy body" is a basic taste: use the mouthfeel field instead`,
  `acidity must be one of: low, soft, bright, sharp`,
  `defects "smelly" is not one of:`,
]) check(bad.stderr.includes(expected), `reports: ${expected}`);

// The tasting list: every word in a known group, Indonesian names unique, form input read back to the list's words.
{
  const { TASTE_WORDS, TASTE_GROUPS, toTasteKey, tasteGroups } = await import("../scripts/tastes.ts");
  const ids = Object.values(TASTE_WORDS).map((w) => w.id);
  check(Object.values(TASTE_WORDS).every((w) => TASTE_GROUPS[w.group]) && new Set(ids).size === ids.length, "every tasting word has a group and its own Indonesian name");
  check(Object.values(TASTE_GROUPS).every((g) => !g.general || TASTE_WORDS[g.general]?.group === Object.keys(TASTE_GROUPS).find((k) => TASTE_GROUPS[k] === g)), "each group's general word belongs to that group");
  check(toTasteKey("Gula Aren") === "palm sugar" && toTasteKey("lemon") === "lemon" && toTasteKey("durian") === "durian", "a typed tasting word in English or Indonesian becomes the list's word");
  check(JSON.stringify(tasteGroups(["lemon", "palm sugar", "orange", "floral"])) === JSON.stringify([{ group: "fruity", words: ["lemon", "orange"] }, { group: "sweet", words: ["palm sugar"] }, { group: "floral", words: [] }]), "words are grouped in the order they come, the group's own word left out");
}

// Ids can be typed any way (small letters, no "-", spaces) and still read back the same; a typo never passes.
const { parseId, newId } = await import("../scripts/lib.ts");
const sample = newId("L");
check(parseId(sample.replace(/-/g, "").toLowerCase()) === sample && parseId(` ${sample.slice(0, 5)} ${sample.slice(5)}`) === sample, "an id typed without \"-\" or in small letters reads back the same");
let caught = 0, tries = 0;
for (let i = 2; i < sample.length; i++) for (const c of "23456789ABCDEFGHJKMNPQRSTUVWXYZ") {
  if (sample[i] === "-" || c === sample[i]) continue;
  tries++; if (parseId(sample.slice(0, i) + c + sample.slice(i + 1)) === null) caught++;
}
check(caught === tries, `every one-character typo of an id is caught (${caught}/${tries})`);

// The web form: the relay checks a submission and writes the same issue the GitHub form makes,
// and issue-to-story reads it back with the storyteller's name and the rounded location.
{
  const form = await import("../scripts/story-form.ts");
  const { CROPS, TOLD_BY } = await import("../scripts/lib.ts");
  const { parseIssueForm, toStory } = await import("../scripts/issue-to-story.ts");
  check(form.CROP_KEYS.join() === Object.keys(CROPS).join() && form.TOLD_BY.every((t) => TOLD_BY.includes(t)), "web form crops and storytellers match the story format");
  const yml = readFileSync(path.join(here, "..", ".github", "ISSUE_TEMPLATE", "story.yml"), "utf8");
  const labels = [...yml.matchAll(/^\s+label: (.+)$/gm)].map((m) => m[1].replace(/^"|"$/g, "")).filter((l) => !l.startsWith("Everyone") && !l.startsWith("I agree"));
  check(labels.every((l) => form.LABELS[l]) && labels.length === form.FIELDS.length - 2, "every GitHub form field has its heading in story-form.ts");
  const sample = { contributor: "Ibu Sari", told_by: "farmer", language: "id", crop: "coffee", kind: "farm", producer: "Kebun Sari", country: "id",
    traceability: "farm", region: "Bener Meriah, Aceh", species: "arabica", title: "Kopi dari tepi danau", summary: "Kebun kecil di tepi Danau Laut Tawar.",
    story: "Paragraf satu. ".repeat(20) + "\n\n### Short summary\nini bagian dari cerita, bukan judul kolom.", process: "washed, natural" };
  check(form.checkSubmission({ ...sample, consent: [true, false] }).errors?.some((e) => e.field === "consent"), "the web form needs both consent boxes");
  check(form.checkSubmission({ ...sample, story: "Pendek.", consent: [true, true] }).errors?.some((e) => e.field === "story" && e.code === "too-short"), "the web form asks for a few sentences at least");
  check(form.checkSubmission({ ...sample, crop: "tobacco", consent: [true, true] }).errors?.some((e) => e.field === "crop"), "the web form refuses an unknown crop");
  const ok = form.checkSubmission({ ...sample, coords: [4.71234, 96.84567], consent: [true, true] });
  check(ok.data?.coords?.join() === "4.71,96.85" && ok.data.country === "ID", "the web form rounds coordinates to about 1 km");
  const parsed = parseIssueForm(form.issueBody(ok.data));
  const story = toStory(parsed, { number: 7, author: "open-origin-bot" });
  const tmp = mkdtempSync(path.join(tmpdir(), "oo-"));
  cpSync(path.join(here, "fixtures", "good"), tmp, { recursive: true });
  mkdirSync(path.join(tmp, path.dirname(story.file)), { recursive: true });
  writeFileSync(path.join(tmp, story.file), story.text);
  const v = spawnSync(process.execPath, [path.join(here, "..", "scripts", "validate.ts")], { env: { ...process.env, OPEN_ORIGIN_ROOT: tmp }, encoding: "utf8" });
  rmSync(tmp, { recursive: true, force: true });
  check(v.status === 0, `a story sent through the web form passes the story check${v.status ? `\n${v.stderr}` : ""}`);
  check(story.text.includes("contributor: Ibu Sari") && story.text.includes("- 4.71") && story.text.includes("bukan judul kolom") && story.text.includes("summary: Kebun kecil"), "a web form issue becomes a story credited to the storyteller");

  // The relay itself, with GitHub replaced by a stub.
  const worker = (await import("../relay/worker.ts")).default;
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => { sent.push({ url, init }); return new Response(JSON.stringify({ number: 42, html_url: "https://github.com/glc-works/open-origin/issues/42" }), { status: 201 }); };
  const kv = new Map();
  const env = { REPO: "glc-works/open-origin", ALLOWED_ORIGINS: "https://glc-works.github.io", GITHUB_TOKEN: "t", CONTACTS: { put: async (k, v) => kv.set(k, v) } };
  const post = (body, origin = "https://glc-works.github.io") => worker.fetch(new Request("https://relay.example/submit", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) }), env);
  const good = { fields: sample, consent: [true, true], coords: [4.71234, 96.84567], contact: "sari@example.org" };
  const r1 = await post(good);
  const out = await r1.json();
  const issue = sent[0] && JSON.parse(sent[0].init.body);
  check(r1.status === 201 && out.number === 42 && issue.labels.join() === "story,web-form" && issue.title === "[Story] Kopi dari tepi danau", "the relay opens a story issue labelled web-form");
  check(!sent[0].init.body.includes("sari@example.org") && kv.get("issue:42")?.includes("sari@example.org"), "the relay keeps the contact out of the public issue");
  check((await post(good, "https://evil.example")).status === 403, "the relay only takes stories from the site");
  check((await post({ ...good, fields: { ...sample, story: "" } })).status === 422, "the relay refuses a story with an empty text");
  check((await post({ ...good, fields: { ...sample, photo: "https://evil.example/x.jpg" } }).then(() => JSON.parse(sent.at(-1).init.body).body.includes("evil.example"))) === false, "only the relay can set the photo link");
  globalThis.fetch = realFetch;
}

const broken = validate("broken");
check(broken.status === 1 && broken.stderr.includes("broken.md (line 3)") && !broken.stderr.includes("    at "), "a YAML mistake names the file and line, without a stack trace");

if (failed) process.exit(1);
