// Runs the validator against fixture folders: the good set must pass, the bad set must fail with these messages.
// npm test
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const run = (script, dir) => spawnSync(process.execPath, [path.join(here, "..", "scripts", script)], {
  env: { ...process.env, OPEN_ORIGIN_ROOT: path.join(here, "fixtures", dir) }, encoding: "utf8" });
const validate = (dir) => run("validate.mjs", dir);

let failed = 0;
const check = (ok, msg) => { if (!ok) failed++; console.log(`${ok ? "✓" : "✗"} ${msg}`); };

const good = validate("good");
check(good.status === 0, `good fixtures (cocoa, honey, sugar, tea; blend and roaster-only lots) pass${good.status ? `\n${good.stderr}` : ""}`);

// The good set must also build, and its pages must show the crop-specific parts.
const built = run("build.mjs", "good");
check(built.status === 0, `good fixtures build${built.status ? `\n${built.stderr}` : ""}`);
if (built.status === 0) {
  const read = (p) => readFileSync(path.join(here, "fixtures", "good", "dist", p), "utf8");
  const farm = read("stories/cocoa/id/test-cocoa-farm/index.html");
  check(farm.includes("From tree to bar") && !farm.includes("How coffee is scored"), "cocoa story uses cocoa wording");
  check(farm.includes('id="L-TESTBKQW-A"') && farm.includes("Blend of"), "blend lot shows on each of its stories");
  check(read("producers/P-TESTPQQW-T/index.html").includes('id="L-TESTRQQW-E"'), "a lot filed under a producer shows on its profile");
  check(read("s/L-TESTRQQW-E/index.html").includes("producers/P-TESTPQQW-T/#L-TESTRQQW-E"), "lot permalink leads to the producer page");
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
]) check(bad.stderr.includes(expected), `reports: ${expected}`);

// Ids can be typed any way (small letters, no "-", spaces) and still read back the same; a typo never passes.
const { parseId, newId } = await import("../scripts/lib.mjs");
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
