# Contributing to Open Origin

Thank you for helping tell the stories behind what we drink and eat. English is the project's main language, but stories can be written in any language: tell it in the language you are most comfortable with, and an English translation can be added later by you or a volunteer.

> **Ringkas (Bahasa Indonesia):** Cara termudah adalah mengisi [formulir cerita](https://github.com/glc-works/open-origin/issues/new?template=story.yml). Maintainer akan mengecek bersama Anda lalu menerbitkannya. Pastikan semua orang yang disebut atau difoto sudah setuju.

## Two ways to contribute

1. **The story form (recommended).** [Open the form](https://github.com/glc-works/open-origin/issues/new?template=story.yml), fill it in, and submit. A maintainer reviews it with you, then adds the `approved` label, which opens a pull request automatically.
2. **A pull request.** Add a Markdown file at `stories/<crop>/<country>/<slug>.md`, run `npm run check`, and open a PR.

## Ground rules

- **Consent first.** Everyone named or pictured must agree to publication. If you are not sure, describe them without names ("a family farm near ...").
- **Protect locations.** Coordinates are rounded to 2 decimals (about 1 km). Never share a home address.
- **Tell it true.** Back historical facts with sources where you can. Typical ranges (altitude, harvest) are fine.
- **Credit the storyteller.** `told_by` says whose voice this is. Stories told by farmers themselves are the heart of this project.

## Examples to copy

- Farm story template, with guiding questions: [`templates/farm-story.md`](templates/farm-story.md)
- Origin profile: [`stories/coffee/id/gayo.md`](stories/coffee/id/gayo.md)
- Movement: [`stories/coffee/id/subak-abian-kintamani.md`](stories/coffee/id/subak-abian-kintamani.md)
- Translation: [`stories/coffee/id/gayo.id.md`](stories/coffee/id/gayo.id.md) (Indonesian)

## Three kinds of story

| `kind` | What it is | How many |
|---|---|---|
| `origin` | A profile of a growing region: land, history, typical process. e.g. Gayo, Toraja | One per region |
| `farm` | One farmer, farm or cooperative in their own words. Two farms in Gayo can taste completely different | Many per origin |
| `movement` | A community, cooperative or initiative and what it changes. e.g. Subak Abian in Kintamani | Many per origin |

Farm and movement stories (never origin profiles) link to their region with `origin: <file name of the origin>`, e.g. `origin: gayo`. The origin page then lists it under "Farmers from this origin".

## From farm to cup

Any story can add a `journey`: the steps from tree to cup, in order. Stages are `farm`, `harvest`, `process`, `dry`, `sort`, `roast`, `brew`, `market`, `other`.

```yaml
journey:
  - stage: harvest
    text: We pick only red cherries, three rounds per season.
  - stage: process
    text: Pulped the same day and fermented overnight in buckets.
```

### The illustrated journey

A step can also name a picture, and then the story page shows the journey as illustrated panels along one route, with a step bar, gentle motion (off when the reader's device asks for reduced motion) and an "At a glance" box made from the story's altitude, harvest and process. Each panel has one plain sentence for every reader, a fact with its source, and an optional "Why?" for those who want more.

```yaml
journey:
  - stage: harvest
    title: Picked when red              # optional; the stage name is used otherwise
    scene: coffee-picking               # a picture from scripts/scenes.ts
    text: A hand picks it only once it has turned red.
    more: At least 85 of every 100 cherries sent on must be ripe.
    why: The 85% rule is written into the Geographical Indication rules.
    then: down the path to the farmer's house, the same day   # the line to the next step
    cite: [1]                           # required when a step has more, why or count
  - stage: dry
    scene: coffee-wet-hulling
    text: It dries briefly, then loses its husk while still damp.
    count: { from: 40, to: 12, unit: "% water" }   # an animated number on the panel
    cite: [1]
```

Pictures: `coffee-slopes`, `coffee-picking`, `coffee-pulping`, `coffee-wet-hulling`, `coffee-sorting`, `cocoa-grove`, `cocoa-open`, `cocoa-ferment`, `cocoa-drying`, `chocolate`, `honey-forest`, `honey-climb`, `honey-leave`, `honey-drip`, `honey-jar`, `ship`. They are original Open Origin drawings (CC BY 4.0); new ones are welcome. Keep the sentences plain enough for a child and true enough for an expert: no invented people, and a source for every fact. A translation gives each step as `{ text, title, more, why, then, unit }`.

## Learn entries

Explanations of species, processes and terms live in `learn/<crop>/<slug>.md`, with `title`, `crop`, `type` (species, process, variety or term), `summary` and an optional `latin` name. Story pages link to them automatically, for example when a story's species is `arabica` and `learn/coffee/arabica.md` exists.

### Varieties

A variety entry (`type: variety`) adds structured fields: `species`, `lineage`, `aliases` (local names, e.g. Ateng, Tim Tim, Jember), `stature` (dwarf, semi-dwarf, tall), `yield_potential` (low, medium, high, very high), `quality_potential` (fair, good, very good, exceptional), `leaf_rust` (resistant, tolerant, susceptible), `altitude_masl` and `sources`. A story's `varieties` link to an entry automatically when a name matches its title or one of its aliases.

Write entries in your own words. Facts from catalogues such as World Coffee Research are welcome; link them in `sources` rather than copying text. To cite a fact, put its number in brackets after it, like `[2]` for the second link in `sources`; it becomes a footnote. Where sources disagree, give each view with its author and year.

## Permanent ids

Every story, producer profile and lot has an `id` that never changes: a prefix, 8 characters and a check character, such as `L-KPBJF525-D`. The characters are 2–9 and A–Z without I, L and O, so a code can be read aloud and typed from a label. The check character catches every single typo and every swap of two neighbouring characters; [How to read a code](https://glc-works.github.io/open-origin/codes/) explains it for buyers and farmers. Origin profiles start with `O-` (e.g. `O-V9VR4CHS-Q`), farm and movement stories with `S-` (e.g. `S-K7M2XQ9P-V`) producers with `P-` (e.g. `P-H7FAQRHQ-5`) and lots with `L-` (e.g. `L-Q4ZK8M2P-4`), so they can never be mixed up. Run `npm run new-id` for fresh ones (`npm run new-id -- L-KPBJF525-D` checks one), or leave `id` out and the check will suggest one. Never make one up by hand: its check character would be wrong. Stories sent through the issue form get one automatically. Because the id never changes, a title, name or file can be renamed without breaking links: `/s/<id>/` always leads to the story, producer or lot (also typed in small letters or without dashes), and the open data uses the id as its key.

## Producer profiles

Everyone who shapes a lot can have one profile page: a farmer, producer group or estate, a processing facility (mill or washing station), a roaster, or a testing lab or Q grader. The page gathers all their stories, lots and the varieties they grow. Copy [`templates/producer.md`](templates/producer.md) to `producers/<country>/<name>.md`, for example `producers/id/koperasi-gayo.md`. Only `id`, `name` and `consent` are required. The `id` is `P-`, 8 characters and a check character, e.g. `P-H7FAQRHQ-5` (see [Permanent ids](#permanent-ids)). Fill in whatever else the producer is happy to share: `type` (farmer, group, estate, processor, roaster, lab), `region`, `village`, `since` (year), `farm_size_ha`, `members`, `website`, `photo`, `crops` and `sources`. The text below the frontmatter is an optional short introduction.

`consent: true` means the people named agreed. `consent: public` is allowed only for an organisation (any type except `farmer`), and only when every fact has already been published, by the organisation itself or by its buyers, with those links in `sources`. Stories may use `consent: public` on the same terms, except a story told by a farmer. The page then says it was put together from published sources and invites the organisation to correct or remove it.

To link a story to the profile, add the profile's id to the story, e.g. `profile: P-H7FAQRHQ-5`. The profile page lives at `/producers/<id>/`. Do not publish phone numbers or home addresses.

## Traceability

Not every product can be traced to one farm. A story says how far back it goes with `traceability`:

| Value | Meaning | Example |
|---|---|---|
| `farm` | one farm or family | a single-estate coffee |
| `group` | a cooperative, collector or processing group | a palm sugar cooperative |
| `region` | a known region, many farms | Kintamani coffee via the subak |
| `country` | only the country is known | pepper bought from traders |
| `blend` | several origins mixed | a honey blend |

For `country` and `blend`, `region` may be left out. The story then tells who makes, sorts or trades the product, and why its quality is good.

## Lots: what a buyer actually buys

In coffee, "origin" is the place. What you buy, for example "Gayo Honey, green bean, 2025 harvest", is a **lot**: one harvest, shipment or production run. Process, variety, form and quality change from lot to lot, so they are not part of the story. Each lot is its own file:

```
lots/<crop>/<country>/<story-slug>/<lot-name>.md
```

A lot that is not one farm's harvest can sit directly in `lots/<crop>/<name>.md` and say where it belongs by id instead:

- `stories: [S-K7M2XQ9P-V, S-Q4ZK8M2P-A]` for a blend of several farms or origins. It then shows on each of those story pages.
- `producer: P-H7FAQRHQ-5` for a lot filed under a producer, processor or roaster whose farms have no story yet. It shows on that profile.

Copy [`templates/lot.md`](templates/lot.md). Only `id` (`L-`, 8 characters and a check character, see [Permanent ids](#permanent-ids)) and `date` are required. Everything else is optional:

- `name`: the name it is sold under, e.g. `Gayo Honey`
- `form`: the state it is sold in, and `process` (also used on stories). Both depend on the crop, see [Processes and forms per crop](#processes-and-forms-per-crop)
- `varieties`, `quantity_kg`, and `traceability` if it differs from the story
- `processed_by`: leave it out when the farmer or producer processed the lot themselves. Fill it in when someone else did, such as a cooperative, collector or washing station. In Gayo, for example, farmers often sell wet parchment and a processor does the wet-hulling and drying.
- `roasted_by` and `sold_by`: who roasted and who sells it
- `processed_by`, `roasted_by` and `sold_by` take a name or a producer id (`P-...`). An id links to that producer's profile, and the lot is also listed there.
- `sources`: links to where the lot's details were published
- `quality`, `tested_by` and a `certificate` link. A cupping score always needs `tested_by`, even when you scored it yourself. `tested_by` is a name (e.g. "Licensed Q Grader, name and licence number") or the `P-` id of a lab profile, which then links to it and lists the lots it tested.

Quality fields per crop:

| Crop | Quality fields |
|---|---|
| coffee | cupping_score, cupping_protocol, moisture_pct, water_activity, screen_size, density_g_l, defects_primary, defects_secondary, grade |
| cocoa | fermented_pct, slaty_pct, mouldy_pct, bean_count_per_100g, moisture_pct, grade |
| tea | grade, flush, moisture_pct |
| spice | grade, moisture_pct, density_g_l, volatile_oil_pct |
| vanilla | grade, moisture_pct, pod_length_cm, vanillin_pct |
| honey | botanical_source, moisture_pct, hmf_mg_kg, diastase_schade |
| sugar | moisture_pct, colour, sucrose_pct |

The story page lists every lot, newest first, and marks results without `tested_by` as self-reported. `/s/<lot id>/` jumps straight to a lot. The fields are set in `scripts/lib.ts` (`QUALITY`).

### Processes and forms per crop

| Crop | `process` | Lot `form` |
|---|---|---|
| coffee | washed, natural, honey, wet-hulled, anaerobic, fermented, other | cherry, parchment, green, roasted |
| cocoa | fermented, unfermented, sun-dried, machine-dried, other | pods, wet-beans, dried-beans, nibs, chocolate |
| tea | white, green, oolong, black, dark, other | fresh-leaf, made-tea |
| spice | sun-dried, machine-dried, fermented, other | fresh, dried, ground, oil |
| vanilla | sun-cured, oven-cured, other | green-pods, cured-pods, extract, powder |
| honey | raw, filtered, dehumidified, creamed, other | comb, liquid, crystallised |
| sugar | open-pan, vacuum, other | sap, block, granulated, liquid |

The lists live in `scripts/lib.ts` (`CROPS`). If something real does not fit, use `other` and open an issue so we can add it.

## Translations

Anyone can translate a story: [open the translation form](https://github.com/glc-works/open-origin/issues/new?template=translation.yml), or add a file next to the story named `<story>.<language>.md`, for example `gayo.id.md`, `gayo.zh.md`, `gayo.ar.md`, `gayo.ja.md`. Arabic, Persian, Urdu and Hebrew are shown right to left.

```markdown
---
title: Gayo, coffee from the shores of Lake Laut Tawar
summary: Translated summary, at most 200 characters.
language: en            # must match the file name
translator: Your name
region: Central Aceh & Bener Meriah, Aceh     # optional
tasting_notes: [dark chocolate, spice]        # optional
journey:                                      # optional, same number of steps as the story
  - Ripe red cherries are picked by hand.
---

The translated story.
```

### Translating a Learn entry

A Learn entry is translated the same way: add `<entry>.<language>.md` next to it, for example `learn/coffee/arabica.id.md`. It holds only the words (`title`, `summary`, `translator` and the text). The facts and the `sources` stay in the English entry, and `[1]`, `[2]` in the translation point to those same sources.

### Translating the site itself

The site's own words (menus, labels, buttons) live in [`scripts/i18n.ts`](scripts/i18n.ts). English is served at the root of the site and Indonesian under `/id/`, with the same paths below it. To add a language, copy the `id` block in that file, give it the new language code, translate the values and add the code to `LANGS`; anything you leave out shows in English. A translated page such as `pages/codes.id.md` is picked up by its language code. On a page in another language, each story card leads to the story's translation into that language when there is one; otherwise the story is shown as it was told.

## Story format

```markdown
---
id: O-V9VR4CHS-Q                # permanent id: O- for an origin, S- for a farm or movement story
title: Gayo, coffee from the shores of Lake Laut Tawar
kind: origin                  # origin | farm | movement (default: farm)
crop: coffee                  # coffee | cocoa | tea | spice | vanilla | honey | sugar
country: ID                   # ISO 3166 two-letter code, matches the folder name
region: Aceh Tengah & Bener Meriah, Aceh
producer: Petani kopi dataran tinggi Gayo
species: arabica              # see the list per crop below (optional for movements)
altitude_masl: [1200, 1700]   # optional, metres above sea level
varieties: [Tim Tim, Ateng Super]          # optional
process: [wet-hulled, natural]             # optional
harvest: Okt–Jun                           # optional
tasting_notes: [cokelat hitam, rempah]     # optional, at most 4
summary: One or two sentences, at most 200 characters, shown on the card.
photo: photos/id/gayo.jpg     # optional, a path in this repo or an https URL
photo_credit: Name            # required when there is a photo
photo_license: CC BY-SA 4.0   # only for a photo from elsewhere, e.g. Wikimedia Commons: its licence as written there
photo_source: https://commons.wikimedia.org/wiki/File:...  # and the page it came from
coords: [4.62, 96.85]         # optional, latitude and longitude, 2 decimals
area:                         # optional: public codes for the same area, so other data can be joined to it
  iso3166_2: ID-AC            #   province, ISO 3166-2
  admin_codes: ["11.06", "11.17"]  # national area codes (Indonesia: Kemendagri kode wilayah), quoted
  wikidata: [Q..., Q...]      #   Wikidata ids of the regencies
  geonames: [1234567]         #   GeoNames ids
language: id                  # language of the story
told_by: farmer               # farmer | producer-group | roaster | researcher | editor | other
contributor: your-github-name
consent: true                 # must be true
sources: []                   # optional links
---

The story itself, in Markdown. A few paragraphs.
```

### Species per crop

| Crop | Allowed `species` |
|---|---|
| coffee | arabica, robusta, liberica, excelsa |
| cocoa | criollo, forastero, trinitario, nacional |
| tea | sinensis, assamica |
| spice | nutmeg, clove, pepper, cinnamon, cardamom, ginger, turmeric, other |
| vanilla | planifolia, tahitensis, pompona |
| honey | apis-mellifera, apis-cerana, apis-dorsata, stingless-bee, other |
| sugar | aren, coconut, lontar, nipa, other |

Process values: washed, natural, honey, wet-hulled, anaerobic, fermented, sun-dried, other.

## For maintainers

1. Read the submitted issue and talk with the contributor if anything is unclear.
2. Add the `approved` label. A PR opens with the story file.
3. Add `coords` for the nearest town, check the text, and merge. The site publishes automatically.

The repository needs the labels `story` and `approved`, and GitHub Pages set to deploy from **GitHub Actions** (Settings → Pages). Allow Actions to create pull requests under Settings → Actions → General → Workflow permissions.

## For developers

The scripts are TypeScript that Node 22.18 or newer runs directly, with no build step. Every frontmatter field of a story, producer profile, lot, Learn entry and translation is listed once in `scripts/schema.ts`, with its type and whether it is required; the validator and the TypeScript types come from that list, and `npm run schema` prints it as tables. A field that is not in the list fails the check (with a hint such as `did you mean "tasting_notes"?`), so a typo never quietly disappears from the site. To add a field, add it there first, then any extra rule (allowed values, ranges) in `scripts/lib.ts`. `npm run check` runs the type check (`tsc`), the validator, the tests and the build.
