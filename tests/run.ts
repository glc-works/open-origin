// Runs the validator against fixture folders: the good set must pass, the bad set must fail with these messages.
// npm test
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
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
  // Public API: one file per code, in the collection its prefix names, with the licence in every response.
  const api = (p) => JSON.parse(read(`api/v1/${p}`));
  const idx = api("index.json");
  check(idx.meta.license.name === "CC-BY-4.0" && idx.meta.attribution.includes("CC BY 4.0") && idx.data.endpoints.lot_by_id.endsWith("/api/v1/lots/{id}.json"), "API index lists endpoints and the licence");
  const lot = api("lots/L-TESTCQQ3-3.json");
  check(lot.data.id === "L-TESTCQQ3-3" && lot.data.crop === "cocoa" && lot.meta.links.permalink.endsWith("/s/L-TESTCQQ3-3/") && lot.meta.license.url.includes("by/4.0"), "a lot is served by its code, with crop and licence");
  const origin = api("origins/O-TESTCQQW-P.json");
  check(origin.data.place_codes.iso3166_2[0] === "ID-SR" && Array.isArray(origin.data.farms), "an origin is served with its place codes and farms");
  check(api("producers/P-TESTKABQ-3.json").data.lots.includes("L-TESTCQQ3-3"), "a lab's API record lists the lots it tested");
  const rows = api("origins.json");
  check(rows.meta.count === rows.data.length && rows.data.every((r) => r.id.startsWith("O-") && r.api.endsWith(`/origins/${r.id}.json`)), "the origins list has one row per origin, each pointing at its file");
  check(api("crops/cocoa.json").data.lots.some((r) => r.id === "L-TESTCQQ3-3"), "a crop file lists that crop's lots");
  const feed = JSON.parse(read("feed.json"));
  check(feed.version.includes("jsonfeed.org") && feed.items.length > 0 && feed.items.every((i) => i.date_published), "JSON Feed lists new records with dates");
  check(read("feed.xml").includes("<feed xmlns=\"http://www.w3.org/2005/Atom\">") && read("api/index.html").includes("api/v1/index.json"), "Atom feed and the API page are built");
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
  `area.admin_codes 11.1 must be in quotes`,
  `photo_license must be written like CC BY 4.0`,
  `photo_source must be an https link`,
]) check(bad.stderr.includes(expected), `reports: ${expected}`);

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

const broken = validate("broken");
check(broken.status === 1 && broken.stderr.includes("broken.md (line 3)") && !broken.stderr.includes("    at "), "a YAML mistake names the file and line, without a stack trace");

if (failed) process.exit(1);
