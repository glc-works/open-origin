// The tasting words a story or lot may use, in two levels.
// Level 1: ten groups in everyday words, for someone who just drinks the coffee ("Fruity · Sweet").
// Level 2: the detail words, for tasters ("lemon, rock sugar"). Every word belongs to exactly one group,
// so the group is never stored: it comes from the word.
//
// The groups follow the structure of the Coffee Taster's Flavor Wheel (SCA and World Coffee Research, 2016),
// written in our own words. `wheel` names the closest attribute on that wheel where there is a clear match,
// so a taster can compare. Citrus sits inside Fruity, as on the wheel; chocolate and nuts are split, and
// fermented is its own group because it says something about the process.
//
// To add a word: add a line to WORDS with its group and Indonesian name. A word that is not here fails
// `npm run check`, with the nearest known word as a hint, so the list grows without duplicates.

// `general` is the group's own word (e.g. "floral"): it says no more than the group, so it is not repeated beside it.
export const TASTE_GROUPS = {
  fruity: { en: "Fruity", id: "Buah", wheel: "Fruity", general: "fruity" },
  floral: { en: "Floral", id: "Bunga", wheel: "Floral", general: "floral" },
  sweet: { en: "Sweet", id: "Manis", wheel: "Sweet", general: "sweet" },
  chocolate: { en: "Chocolate", id: "Cokelat", wheel: "Nutty/Cocoa", general: "chocolate" },
  nutty: { en: "Nutty", id: "Kacang", wheel: "Nutty/Cocoa", general: "nuts" },
  spice: { en: "Spice", id: "Rempah", wheel: "Spices", general: "spice" },
  herbal: { en: "Fresh & herbal", id: "Segar & herbal", wheel: "Green/Vegetative", general: "herbal" },
  earthy: { en: "Earthy & woody", id: "Tanah & kayu", wheel: "Other", general: "earthy" },
  roasted: { en: "Smoky & roasted", id: "Asap & sangrai", wheel: "Roasted", general: null },
  fermented: { en: "Fermented", id: "Fermentasi", wheel: "Sour/Fermented", general: "fermented" },
} as const;

export type TasteGroup = keyof typeof TASTE_GROUPS;
export interface TasteWord { group: TasteGroup; id: string; wheel?: string }

const w = (group: TasteGroup, id: string, wheel?: string): TasteWord => ({ group, id, ...(wheel && { wheel }) });

// Keyed by the English word as it is written in a story or lot. Keep each group's general word first.
export const TASTE_WORDS: Record<string, TasteWord> = {
  // Fruity, citrus included
  fruity: w("fruity", "buah"),
  berry: w("fruity", "beri", "Berry"),
  "red fruit": w("fruity", "buah merah"),
  "dark fruit": w("fruity", "buah gelap"),
  "stone fruit": w("fruity", "buah berbiji", "Peach"),
  "tropical fruit": w("fruity", "buah tropis"),
  "dried fruit": w("fruity", "buah kering", "Dried fruit"),
  "browned fruit": w("fruity", "buah matang"),
  apple: w("fruity", "apel", "Apple"),
  grape: w("fruity", "anggur", "Grape"),
  cherry: w("fruity", "ceri", "Cherry"),
  jackfruit: w("fruity", "nangka"),
  mango: w("fruity", "mangga"),
  "passion fruit": w("fruity", "markisa"),
  citrus: w("fruity", "jeruk", "Citrus fruit"),
  lemon: w("fruity", "lemon", "Lemon"),
  orange: w("fruity", "jeruk manis", "Orange"),
  lime: w("fruity", "jeruk nipis", "Lime"),
  grapefruit: w("fruity", "jeruk bali", "Grapefruit"),
  // Floral
  floral: w("floral", "bunga", "Floral"),
  jasmine: w("floral", "melati", "Jasmine"),
  rose: w("floral", "mawar", "Rose"),
  chamomile: w("floral", "kamomil", "Chamomile"),
  "ylang-ylang": w("floral", "kenanga"),
  "coffee blossom": w("floral", "bunga kopi"),
  // Sweet
  sweet: w("sweet", "manis", "Overall sweet"),
  "palm sugar": w("sweet", "gula aren"),
  "rock sugar": w("sweet", "gula batu"),
  "coconut sugar": w("sweet", "gula kelapa"),
  "brown sugar": w("sweet", "gula cokelat", "Brown sugar"),
  caramel: w("sweet", "karamel", "Caramelized"),
  honey: w("sweet", "madu", "Honey"),
  vanilla: w("sweet", "vanili", "Vanilla"),
  molasses: w("sweet", "tetes tebu", "Molasses"),
  // Chocolate
  chocolate: w("chocolate", "cokelat", "Chocolate"),
  "dark chocolate": w("chocolate", "cokelat pekat", "Dark chocolate"),
  "milk chocolate": w("chocolate", "cokelat susu"),
  cocoa: w("chocolate", "kakao", "Cocoa"),
  // Nutty
  nuts: w("nutty", "kacang", "Nutty"),
  peanut: w("nutty", "kacang tanah", "Peanuts"),
  almond: w("nutty", "almond", "Almond"),
  hazelnut: w("nutty", "hazelnut", "Hazelnut"),
  walnut: w("nutty", "kenari"),
  chestnut: w("nutty", "kastanye"),
  "roasted nut": w("nutty", "kacang sangrai"),
  // Spice
  spice: w("spice", "rempah", "Spices"),
  cinnamon: w("spice", "kayu manis", "Cinnamon"),
  clove: w("spice", "cengkeh", "Clove"),
  nutmeg: w("spice", "pala", "Nutmeg"),
  cardamom: w("spice", "kapulaga"),
  pepper: w("spice", "lada", "Pepper"),
  ginger: w("spice", "jahe"),
  anise: w("spice", "adas manis", "Anise"),
  // Fresh & herbal
  herbal: w("herbal", "herbal", "Herb-like"),
  "black tea": w("herbal", "teh hitam", "Black tea"),
  "green tea": w("herbal", "teh hijau"),
  pandan: w("herbal", "pandan"),
  lemongrass: w("herbal", "serai"),
  "lime leaf": w("herbal", "daun jeruk"),
  fresh: w("herbal", "segar", "Fresh"),
  vegetal: w("herbal", "sayur", "Vegetative"),
  grassy: w("herbal", "rumput"),
  seaweed: w("herbal", "rumput laut"),
  hay: w("herbal", "jerami", "Hay-like"),
  // Earthy & woody: only when it is wanted, like the earthy note of a wet-hulled Sumatra. A fault goes in `defects`.
  earthy: w("earthy", "tanah", "Musty/earthy"),
  woody: w("earthy", "kayu", "Woody"),
  cedar: w("earthy", "kayu cedar"),
  tobacco: w("earthy", "tembakau", "Tobacco"),
  leather: w("earthy", "kulit"),
  // Smoky & roasted
  smoky: w("roasted", "asap", "Smoky"),
  toasted: w("roasted", "panggang"),
  malty: w("roasted", "malt", "Malt"),
  cereal: w("roasted", "sereal", "Cereal"),
  charcoal: w("roasted", "arang"),
  // Fermented: only when it is wanted, e.g. from an anaerobic process. A fault goes in `defects`.
  fermented: w("fermented", "fermentasi", "Fermented"),
  winey: w("fermented", "seperti anggur", "Winey"),
  boozy: w("fermented", "seperti tuak", "Whiskey"),
  tape: w("fermented", "tape"),
};

// The four basic tastes a casual reader looks for first. A story or lot gives each as one word.
// Body is stored as `mouthfeel`, because `body` is the story text itself.
export const BASIC_TASTES = {
  acidity: { en: "Acidity", id: "Asam", levels: { low: "rendah", soft: "lembut", bright: "segar", sharp: "tajam" } },
  sweetness: { en: "Sweetness", id: "Manis", levels: { low: "rendah", medium: "sedang", high: "tinggi" } },
  bitterness: { en: "Bitterness", id: "Pahit", levels: { low: "rendah", medium: "sedang", high: "tinggi" } },
  mouthfeel: { en: "Body", id: "Kekentalan", levels: { light: "ringan", medium: "sedang", heavy: "tebal", syrupy: "kental seperti sirup" } },
} as const;
export type BasicTaste = keyof typeof BASIC_TASTES;

// Lot only: detail a taster records.
export const ACIDITY_TYPES = { citric: "sitrat", malic: "malat", phosphoric: "fosfat", acetic: "asetat", tartaric: "tartarat" } as const;
export const AFTERTASTE = { short: "pendek", medium: "sedang", long: "panjang" } as const;
// Faults in the cup, kept apart from tasting notes. For cocoa, faults in the dried bean come from the cut test (quality).
export const DEFECTS = {
  musty: "apak", moldy: "jamur", papery: "kertas", rubbery: "karet", medicinal: "obat", sour: "asam basi",
  overfermented: "terlalu fermentasi", phenolic: "fenol", potato: "kentang",
} as const;

export const MAX_TASTING_NOTES = 4;

// Own keys only, so a name like "constructor" is never taken for a word on the list.
export const isTasteWord = (w: unknown): boolean => typeof w === "string" && Object.hasOwn(TASTE_WORDS, w);

// Edit distance, for "did you mean".
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}

// Common ways of writing a known word, only used for the hint when a note is not in the list.
const HINTS: Record<string, string> = { flowers: "floral", flower: "floral", herbs: "herbal", herb: "herbal", nutty: "nuts", fruit: "fruity", spicy: "spice", smoke: "smoky", wine: "winey", malt: "malty" };

// The known word closest to a typed one: an English or Indonesian name, a plural, a near spelling,
// or one of its words ("wet earth" -> earthy, "dark berries" -> berry).
export function nearestTaste(word: string): string | null {
  const keys = Object.keys(TASTE_WORDS);
  const one = (x: string): string | null => {
    if (isTasteWord(x)) return x;
    if (Object.hasOwn(HINTS, x)) return HINTS[x];
    const byId = Object.entries(TASTE_WORDS).find(([, v]) => v.id === x);
    if (byId) return byId[0];
    const plural = keys.find((k) => x === `${k}s` || x === `${k}es` || (k.endsWith("y") && x === `${k.slice(0, -1)}ies`));
    if (plural) return plural;
    let best: string | null = null, bestD = Infinity;
    for (const k of keys) { const d = distance(x, k); if (d < bestD) { best = k; bestD = d; } }
    if (best && bestD <= Math.max(1, Math.floor(x.length / 4))) return best;
    return keys.find((k) => x.length >= 5 && k.startsWith(x)) || null;
  };
  const x = word.trim().toLowerCase();
  return one(x) || x.split(/\s+/).reverse().map(one).find(Boolean) || null;
}

// A word as someone typed it in a form, turned into the list's own word when it is one (English or Indonesian,
// any case). Anything else is kept as typed, so the check names it and an editor can add it.
export function toTasteKey(word: string): string {
  const x = word.trim().toLowerCase();
  if (isTasteWord(x)) return x;
  const byId = Object.entries(TASTE_WORDS).find(([, v]) => v.id === x);
  return byId ? byId[0] : word.trim();
}

// Errors for a tasting_notes list.
export function tasteErrors(list: unknown): string[] {
  if (!Array.isArray(list) || !list.every((s) => typeof s === "string" && s.trim())) return [`tasting_notes must be a list of words, e.g. [chocolate, palm sugar]`];
  const errors: string[] = [];
  if (list.length > MAX_TASTING_NOTES) errors.push(`tasting_notes: use at most ${MAX_TASTING_NOTES}`);
  for (const n of list) {
    if (isTasteWord(n)) continue;
    const basic = /\b(body|acidity|acid|bitter(ness)?|sweetness)\b/.exec(n.toLowerCase());
    if (basic) {
      const k = ({ body: "mouthfeel", acid: "acidity", bitter: "bitterness", bitterness: "bitterness" } as Record<string, string>)[basic[1]] || basic[1];
      errors.push(`tasting note "${n}" is a basic taste: use the ${k} field instead (${Object.keys(BASIC_TASTES[k as BasicTaste].levels).join(", ")})`);
      continue;
    }
    const near = nearestTaste(n);
    errors.push(near && near !== n
      ? `tasting note "${n}" is not in the list; did you mean "${near}"? If it is a different taste, add it to scripts/tastes.ts with its group`
      : `tasting note "${n}" is not in the list; add it to scripts/tastes.ts with its group and Indonesian name`);
  }
  const seen = new Set();
  for (const n of list) { if (seen.has(n)) errors.push(`tasting note "${n}" is listed twice`); seen.add(n); }
  return errors;
}

// Errors for one-word fields that pick from a fixed list (acidity, body, aftertaste ...).
export function pickErrors(key: string, v: unknown, allowed: readonly string[]): string[] {
  if (v === undefined) return [];
  return typeof v === "string" && allowed.includes(v) ? [] : [`${key} must be one of: ${allowed.join(", ")}`];
}
export function pickListErrors(key: string, v: unknown, allowed: readonly string[]): string[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) return [`${key} must be a list, e.g. [${allowed[0]}]`];
  return v.filter((x) => !allowed.includes(x)).map((x) => `${key} "${x}" is not one of: ${allowed.join(", ")}`);
}
export function basicTasteErrors(x: Record<string, unknown>): string[] {
  return Object.entries(BASIC_TASTES).flatMap(([k, b]) => pickErrors(k, x[k], Object.keys(b.levels)));
}

// The groups of a list of words, in the order the words come, each with its detail words
// (the group's general word left out, since the group name already says it).
export function tasteGroups(list: string[] = []): { group: TasteGroup; words: string[] }[] {
  const groups = [...new Set(list.filter(isTasteWord).map((n) => TASTE_WORDS[n].group).filter(Boolean))] as TasteGroup[];
  return groups.map((group) => ({ group, words: list.filter((n) => isTasteWord(n) && TASTE_WORDS[n].group === group && n !== TASTE_GROUPS[group].general) }));
}

// A word or a group in a language. Only English and Indonesian exist so far; others fall back to English.
export const tasteWord = (n: string, lang: string) => (lang === "id" && isTasteWord(n) ? TASTE_WORDS[n].id : null) || n;
export const groupName = (g: TasteGroup, lang: string) => (lang === "id" ? TASTE_GROUPS[g].id : TASTE_GROUPS[g].en);
export const basicLevel = (k: BasicTaste, v: string, lang: string) => (lang === "id" ? (BASIC_TASTES[k].levels as Record<string, string>)[v] : null) || v;
