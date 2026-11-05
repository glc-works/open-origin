// Checks every story file and exits non-zero with readable messages if any are invalid.
import { loadStories, validateStory, validateTranslation, linkOrigins, loadKnowledge, validateKnowledge, loadBatches, validateBatch, loadProducers, validateProducer, linkProducers } from "./lib.mjs";

const { stories, translations } = await loadStories();
let failed = 0;
const linkErrors = linkOrigins(stories);
const producers = await loadProducers();
const profileErrors = linkProducers(stories, producers);
const seen = new Set();
for (const s of stories) {
  const errors = [...validateStory(s), ...(linkErrors.get(s.file) || []), ...(profileErrors.get(s.file) || [])];
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
const batches = await loadBatches();
for (const b of batches) {
  const errors = validateBatch(b, stories);
  if (errors.length) {
    failed++;
    console.error(`\n✗ ${b.file}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
for (const p of producers) {
  const errors = validateProducer(p);
  if (errors.length) {
    failed++;
    console.error(`\n✗ ${p.file}`);
    for (const e of errors) console.error(`  - ${e}`);
  }
}
if (failed) {
  console.error(`\n${failed} of ${stories.length + translations.length + knowledge.length + batches.length + producers.length} files need fixes.`);
  process.exit(1);
}
console.log(`✓ ${stories.length} stories, ${translations.length} translations, ${knowledge.length} Learn entries, ${batches.length} batches and ${producers.length} producers valid.`);
