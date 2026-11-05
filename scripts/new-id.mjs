// npm run new-id            prints fresh permanent ids, one of each kind
// npm run new-id -- <id>    checks an id someone typed or read off a label
import { newId, parseId, ID_PREFIX, ID_KIND } from "./lib.mjs";

const typed = process.argv[2];
if (typed) {
  const id = parseId(typed);
  if (!id) { console.error(`✗ "${typed}" is not a valid Open Origin id (wrong format or check character)`); process.exit(1); }
  console.log(`✓ ${id} is a valid ${ID_KIND[id[0]]} id`);
} else {
  console.log(`origin:   id: ${newId(ID_PREFIX.origin)}\nstory:    id: ${newId(ID_PREFIX.story)}\nproducer: id: ${newId(ID_PREFIX.producer)}\nlot:      id: ${newId(ID_PREFIX.lot)}`);
}
