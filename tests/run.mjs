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
  check(farm.includes('id="L-TESTBL01"') && farm.includes("Blend of"), "blend lot shows on each of its stories");
  check(read("producers/P-TESTP001/index.html").includes('id="L-TESTRO01"'), "a lot filed under a producer shows on its profile");
  check(read("s/L-TESTRO01/index.html").includes("producers/P-TESTP001/#L-TESTRO01"), "lot permalink leads to the producer page");
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
  `sold_by "P-NOPENOPE" not found`,
  `quality.cupping_score is not a cocoa quality field`,
  `quality.fermented_pct must be a number from 0 to 100`,
  `consent: public is only for an organisation`,
  `story "S-NOPENOPE" not found`,
  `needs stories: [S-…] or producer: P-…`,
]) check(bad.stderr.includes(expected), `reports: ${expected}`);

const broken = validate("broken");
check(broken.status === 1 && broken.stderr.includes("broken.md (line 3)") && !broken.stderr.includes("    at "), "a YAML mistake names the file and line, without a stack trace");

if (failed) process.exit(1);
