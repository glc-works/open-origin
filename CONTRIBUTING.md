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

## Learn entries

Explanations of species, processes and terms live in `learn/<crop>/<slug>.md`, with `title`, `crop`, `type` (species, process, variety or term), `summary` and an optional `latin` name. Story pages link to them automatically, for example when a story's species is `arabica` and `learn/coffee/arabica.md` exists.

### Varieties

A variety entry (`type: variety`) adds structured fields: `species`, `lineage`, `aliases` (local names, e.g. Ateng, Tim Tim, Jember), `stature` (dwarf, semi-dwarf, tall), `yield_potential` (low, medium, high, very high), `quality_potential` (fair, good, very good, exceptional), `leaf_rust` (resistant, tolerant, susceptible), `altitude_masl` and `sources`. A story's `varieties` link to an entry automatically when a name matches its title or one of its aliases.

Write entries in your own words. Facts from catalogues such as World Coffee Research are welcome; link them in `sources` rather than copying text. To cite a fact, put its number in brackets after it, like `[2]` for the second link in `sources`; it becomes a footnote. Where sources disagree, give each view with its author and year.

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

## Batches: quality belongs to a batch

Quality changes with every harvest, shipment or production run, so it is not part of the story. Each batch is its own file next to nothing else:

```
batches/<crop>/<country>/<story-slug>/<batch-id>.md
```

Copy [`templates/batch.md`](templates/batch.md). A batch has a `date`, optional `quantity_kg`, `traceability` (if it differs from the story), `tested_by`, a `certificate` link, and a `quality` block with fields for its crop:

| Crop | Quality fields |
|---|---|
| coffee | cupping_score, cupping_protocol, moisture_pct, water_activity, screen_size, density_g_l, defects_primary, defects_secondary, grade |
| cocoa | fermented_pct, slaty_pct, mouldy_pct, bean_count_per_100g, moisture_pct, grade |
| tea | grade, flush, moisture_pct |
| spice | grade, moisture_pct, density_g_l, volatile_oil_pct |
| vanilla | grade, moisture_pct, pod_length_cm, vanillin_pct |
| honey | botanical_source, moisture_pct, hmf_mg_kg, diastase_schade |
| sugar | form, moisture_pct, colour, sucrose_pct |

The story page shows every batch, newest first, and marks results without `tested_by` as self-reported. The fields are set in `scripts/lib.mjs` (`QUALITY`).

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

## Story format

```markdown
---
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
coords: [4.62, 96.85]         # optional, latitude and longitude, 2 decimals
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
