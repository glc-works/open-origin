// Checks every story file and exits non-zero with readable messages if any are invalid.
import { loadStories, validateStory, validateTranslation, linkOrigins, loadKnowledge, validateKnowledge, loadLots, validateLot, loadProducers, validateProducer, linkProducers, duplicateIds } from "./lib.ts";
// A broken file (e.g. bad YAML) stops the run with one readable line, not a stack trace.
for (const ev of ["unhandledRejection", "uncaughtException"]) process.on(ev, (e) => { console.error(`\n✗ ${e.message}`); process.exit(1); });

const { stories, translations } = await loadStories();
let failed = 0;
const linkErrors = linkOrigins(stories);
const producers = await loadProducers();
const profileErrors = linkProducers(stories, producers);
const lots = await loadLots();
const dupIds = duplicateIds([...stories, ...producers, ...lots]);
const seen = new Set();
for (const s of stories) {
  const errors = [...validateStory(s), ...(linkErrors.get(s.file) || []), ...(profileErrors.get(s.file) || []), ...(dupIds.get(s.file) || [])];
  const key = `${s.pathCrop}/${s.pathCountry}/${s.slug}`;
  if (seen.has(key)) errors.push("duplicate story path");
  seen.add(key);
  if (errors.length) {
    failed++;
    console.error(`\n✗ ${s.file}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
for (const t of translations) {
  const errors = validateTranslation(t);
  if (errors.length) {
    failed++;
    console.error(`\n✗ ${t.file}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
const knowledge = await loadKnowledge();
for (const k of knowledge) {
  const errors = validateKnowledge(k);
  if (errors.length) {
    failed++;
    console.error(`\n✗ ${k.file}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
for (const b of lots) {
  const errors = [...validateLot(b, stories, producers), ...(dupIds.get(b.file) || [])];
  if (errors.length) {
    failed++;
    console.error(`\n✗ ${b.file}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
for (const p of producers) {
  const errors = [...validateProducer(p), ...(dupIds.get(p.file) || [])];
  if (errors.length) {
    failed++;
    console.error(`\n✗ ${p.file}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
if (failed) {
  console.error(`\n${failed} of ${stories.length + translations.length + knowledge.length + lots.length + producers.length} files need fixes.`);
  process.exit(1);
}
console.log(`✓ ${stories.length} stories, ${translations.length} translations, ${knowledge.length} Learn entries, ${lots.length} lots and ${producers.length} producers valid.`);
