// Prints fresh permanent ids: npm run new-id  (one for a story and one for a producer)
import { newId, ID_PREFIX } from "./lib.mjs";
console.log(`origin:   id: ${newId(ID_PREFIX.origin)}\nstory:    id: ${newId(ID_PREFIX.story)}\nproducer: id: ${newId(ID_PREFIX.producer)}`);
