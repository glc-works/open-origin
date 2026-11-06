# Open Origin blueprint

> **Ringkasan (Bahasa Indonesia):** Open Origin adalah koleksi terbuka cerita hasil tani dari tempat asalnya, mulai dari kopi Nusantara lalu ke dunia dan ke komoditas lain. Dokumen ini mencatat visi, model data, alur kontribusi, dan tahapan kerja yang sudah disepakati. Setiap keputusan baru sebaiknya ditambahkan di sini.

## 1. Vision

Every cup, bar, jar or spoonful starts with someone's harvest. Open Origin is an open, community-written collection of those stories: the land, the process and the people, told in their own words, free to read and reuse.

**Principles**

- **The farmer's voice first.** Stories told by farmers themselves are the heart of the project. Every story says whose voice it is (`told_by`).
- **Consent and safety.** Everyone named or pictured agrees to publication. Locations are rounded to about 1 km.
- **Honest about what we know.** Traceability is stated, quality is tied to a lot and to who measured it, and uncertain facts are marked.
- **Open by default.** Stories CC BY 4.0, code Apache-2.0 (forks keep the NOTICE file), data published in an open format on every build.
- **Easy to contribute.** No git needed: forms in plain language, in any language.
- **Plain files, no lock-in.** Everything is Markdown in a git repository and can move to any other tool.

## 2. Who it is for

| Audience | What they get |
|---|---|
| Farmers, cooperatives | A place to tell their story and show their quality, linkable from packaging (QR) |
| Roasters, chocolate makers, buyers | Verified origin stories and lot quality to share with customers |
| Drinkers and eaters | The story behind what they buy |
| Researchers, journalists, apps | An open dataset (CSV/JSON) under a clear licence |
| Translators, volunteers | A way to help without being in the supply chain |

## 3. Crops

Coffee is open first. The structure is ready for **cocoa, tea, spices, vanilla, honey, and palm and coconut sugar**, and more can be added by one entry in `scripts/lib.ts` (`CROPS` and `QUALITY`).

## 4. Content model

### 4.1 Stories (`stories/<crop>/<country>/<slug>.md`)

| Kind | What it is | How many |
|---|---|---|
| `origin` | Profile of a growing region: land, history, typical process | One per region |
| `farm` | One farmer, farm or cooperative in their own words | Many per origin |
| `movement` | A community, cooperative or initiative and what it changes | Many per origin |

Farm and movement stories link to their region with `origin: <slug>`. Two farms in Gayo can be completely different; that difference is the point.

Every story can carry a **farm-to-cup journey**: ordered steps (`farm`, `harvest`, `process`, `dry`, `sort`, `roast`, `brew`, `market`).

### 4.2 Traceability

Not every product can be traced to one farm. Each story states how far back it goes:

`farm` → `group` (cooperative, collector) → `region` → `country` → `blend`

### 4.3 Lots: what a buyer actually buys

Origin is the place. A lot is one harvest, shipment or production run, the thing a buyer actually buys, with a permanent `L-` id:
`lots/<crop>/<country>/<story>/<lot-name>.md` with a date, name, form, process, varieties, quantity, who processed and sold it (a name or a producer id), crop-specific quality fields, who tested it and an optional certificate. Results without a tester are shown as self-reported.

| Crop | Quality fields |
|---|---|
| Coffee | cupping score and protocol, moisture, water activity, screen size, density, defects, grade |
| Cocoa | cut test (fermented, slaty, mouldy %), bean count, moisture, grade |
| Tea | grade, flush, moisture |
| Spices | grade, moisture, density, volatile oil |
| Vanilla | grade, moisture, pod length, vanillin |
| Honey | nectar source, moisture, HMF, diastase |
| Sugar | form, moisture, colour, sucrose |

### 4.4 Languages and translations

English is the main language of the site, links and editorial content. Contributors may write in any language; an English translation is encouraged so every story can be read by everyone.

A translation is a file next to its story: `<slug>.<lang>.md` (en, zh, ar, ja, id, ...). Anyone can contribute one. Right-to-left languages are displayed correctly.

### 4.5 Learn (`learn/<crop>/<slug>.md`)

Short explanations that stories link to automatically:

- **Species**: arabica, robusta, liberica, excelsa
- **Processes**: washed, natural, honey, wet-hulled (giling basah), anaerobic
- **Varieties**: with lineage, local names (Ateng, Tim Tim, Jember), stature, yield, cup quality, leaf rust resistance and altitude. A story's variety names link through these aliases.
- **Terms**: cupping and Q grading

**Sources.** Industry bodies such as SCA, CQI and World Coffee Research are referenced and linked, and entries are written in our own words. Their texts and graphics (for example the Flavor Wheel) are copyrighted and are not copied.

## 5. Contribution flow

1. A contributor fills in a form (story, translation or lot), or opens a pull request.
2. A maintainer checks consent and facts with them.
3. For stories, the `approved` label opens a pull request automatically.
4. Automated checks validate every file; the site and data publish on merge.

## 6. Open data

Every build publishes a **Frictionless Data Package** (Open Knowledge Foundation): `datapackage.json`, `data/stories.csv`, `data/stories.json`, `data/lots.csv`, `data/lot-quality.csv` and `data/varieties.json`. Story pages carry schema.org metadata.

## 7. Technology

- Markdown files plus a small static generator (Node, `gray-matter`, `marked`), published with GitHub Pages.
- Stories come from the public, so raw HTML is escaped and only safe links are rendered.
- **Map** (`/map/`): every story with coordinates, filterable by crop. MapLibre GL ships with the site (no CDN); the basemap is OpenFreeMap (OpenStreetMap data, no key, no quota), trimmed to land, water, borders and large place names and recoloured to the site palette. Moving to self-hosted PMTiles later means changing `BASEMAP` in `scripts/build.mjs`.
- **When to move to a framework:** once the site needs a full multilingual interface, a map and search, move the generator to **Astro** (content collections, built-in i18n). The content files stay as they are.

## 8. Roadmap

| Phase | Scope | Status |
|---|---|---|
| **1. Foundation** | Story model, 9 Nusantara origins, movement and translation examples, forms, validation, site, Pages, open data, Learn (species, processes, cupping) | Done |
| **2. Beans and quality** | Variety catalogue with local names, traceability levels, per-lot quality for all crops, lot form | PR #2 |
| **3. First real voices** | First farmer stories from Gayo, Toraja, Kintamani and Flores through partners and cooperatives; first translations (en, zh, ja, ar) | Next |
| **4. Wider reach** | Tasting vocabulary guide, map view, search, multilingual interface (Astro), QR codes for packaging | Later |
| **5. Beyond coffee** | Open cocoa, then tea, spices, vanilla, honey and palm sugar with their own Learn sections | Later |
| **6. Oral stories** | Voice or WhatsApp submissions transcribed by volunteers | Later |

## 9. Open questions

- Who are the first maintainers and partner cooperatives?
- Do we verify lot claims beyond "tested by", for example by requiring a certificate for scores above 85?
- Should the site have its own domain?
- How do we handle a farmer who wants a story removed later? (Proposed: remove on request, no questions asked.)
