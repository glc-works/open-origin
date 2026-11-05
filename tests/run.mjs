// Runs the validator against fixture folders: the good set must pass, the bad set must fail with these messages.
// npm test
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const validate = (dir) => spawnSync(process.execPath, [path.join(here, "..", "scripts", "validate.mjs")], {
  env: { ...process.env, OPEN_ORIGIN_ROOT: path.join(here, "fixtures", dir) }, encoding: "utf8" });

let failed = 0;
const check = (ok, msg) => { if (!ok) failed++; console.log(`${ok ? "✓" : "✗"} ${msg}`); };

const good = validate("good");
check(good.status === 0, `good fixtures (cocoa, honey, sugar, tea) pass${good.status ? `\n${good.stderr}` : ""}`);

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
]) check(bad.stderr.includes(expected), `reports: ${expected}`);

if (failed) process.exit(1);
