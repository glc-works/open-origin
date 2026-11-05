# Contributing to Open Origin

Thank you for helping tell the stories behind what we drink and eat. Stories can be written in any language.

> **Ringkas (Bahasa Indonesia):** Cara termudah adalah mengisi [formulir cerita](https://github.com/glc-works/open-origin/issues/new?template=story.yml). Maintainer akan mengecek bersama Anda lalu menerbitkannya. Pastikan semua orang yang disebut atau difoto sudah setuju.

## Two ways to contribute

1. **The story form (recommended).** [Open the form](https://github.com/glc-works/open-origin/issues/new?template=story.yml), fill it in, and submit. A maintainer reviews it with you, then adds the `approved` label, which opens a pull request automatically.
2. **A pull request.** Add a Markdown file at `stories/<crop>/<country>/<slug>.md`, run `npm run check`, and open a PR.

## Ground rules

- **Consent first.** Everyone named or pictured must agree to publication. If you are not sure, describe them without names ("a family farm near ...").
- **Protect locations.** Coordinates are rounded to 2 decimals (about 1 km). Never share a home address.
- **Tell it true.** Back historical facts with sources where you can. Typical ranges (altitude, harvest) are fine.
- **Credit the storyteller.** `told_by` says whose voice this is. Stories told by farmers themselves are the heart of this project.

## Three kinds of story

| `kind` | What it is | How many |
|---|---|---|
| `origin` | A profile of a growing region: land, history, typical process. e.g. Gayo, Toraja | One per region |
| `farm` | One farmer, farm or cooperative in their own words. Two farms in Gayo can taste completely different | Many per origin |
| `movement` | A community, cooperative or initiative and what it changes. e.g. Subak Abian in Kintamani | Many per origin |

Link a farm or movement to its region with `origin: <file name of the origin>`, e.g. `origin: gayo`. The origin page then lists it under "Farmers from this origin".

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

## Translations

Anyone can translate a story: [open the translation form](https://github.com/glc-works/open-origin/issues/new?template=translation.yml), or add a file next to the story named `<story>.<language>.md`, for example `gayo.en.md`, `gayo.zh.md`, `gayo.ar.md`, `gayo.ja.md`. Arabic, Persian, Urdu and Hebrew are shown right to left.

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
title: Gayo, kopi dari tepi Danau Laut Tawar
kind: origin                  # origin | farm | movement (default: farm)
origin: gayo                  # farm and movement only: the origin profile it belongs to
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
cupping_score: 86.25          # optional, farm stories only, needs graded_by and cupping_year
graded_by: Licensed Q Grader
cupping_year: 2025
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
