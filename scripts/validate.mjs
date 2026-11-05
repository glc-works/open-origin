// Checks every story file and exits non-zero with readable messages if any are invalid.
import { loadStories, validateStory, validateTranslation, linkOrigins, loadKnowledge, validateKnowledge } from "./lib.mjs";

const { stories, translations } = await loadStories();
let failed = 0;
const linkErrors = linkOrigins(stories);
const seen = new Set();
for (const s of stories) {
  const errors = [...validateStory(s), ...(linkErrors.get(s.file) || [])];
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
if (failed) {
  console.error(`\n${failed} of ${stories.length + translations.length} files need fixes.`);
  process.exit(1);
}
console.log(`✓ ${stories.length} stories, ${translations.length} translations and ${knowledge.length} Learn entries valid.`);
