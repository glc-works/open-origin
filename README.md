<p align="center"><img src="site/logo.svg" width="72" alt="Open Origin"></p>
<h1 align="center">Open Origin</h1>
<p align="center"><b>Stories from where it grows.</b></p>
<p align="center"><b>English</b> · <a href="README.id.md">Bahasa Indonesia</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ar.md">العربية</a></p>

An open, community-written collection of origin stories for **coffee, cocoa, tea, spices, vanilla, honey and palm sugar**: the land, the process and the people, told in their own words. Anyone can read them, reuse them and add their own. We start in the Indonesian archipelago and grow to the world.

**Website:** https://glc-works.github.io/open-origin/ · **Vision and roadmap:** [BLUEPRINT.md](BLUEPRINT.md)

## Share a story

You don't need to know code. **[Fill in the story form](https://github.com/glc-works/open-origin/issues/new?template=story.yml)** and a maintainer turns it into a page. You can write in any language. To add a harvest, shipment or batch you sell, use the **[lot form](https://github.com/glc-works/open-origin/issues/new?template=lot.yml)**. If you use git, open a pull request instead; see [CONTRIBUTING.md](CONTRIBUTING.md).

## How it is organised

| | What it is | Id |
|---|---|---|
| **Origin** | A growing region: land, history, typical process (Gayo, Banda, Kintamani…) | `O-` |
| **Story** | A farm, cooperative or movement in its own words; many per origin | `S-` |
| **Producer** | A profile of a farmer, group, estate, processing facility or roaster | `P-` |
| **Lot** | One harvest, shipment or production run, the thing a buyer buys, with its process, form and quality | `L-` |
| **Learn** | Species, varieties, processes and grading (cupping, the cocoa cut test…) with sources | |

Ids never change, so names and files can be renamed without breaking links. `/s/<id>/` always leads to the page. A code such as `L-KPBJF525-D` has a check character that catches typos; [How to read a code](https://glc-works.github.io/open-origin/codes/).

## Files

| Path | What it is |
|---|---|
| `stories/<crop>/<country>/<slug>.md` | One story per file, plus translations as `<slug>.<lang>.md` |
| `lots/<crop>/…` | Lots, in a story's folder or linked by id |
| `producers/<country>/<name>.md` | Producer, processor and roaster profiles |
| `learn/<crop>/<slug>.md` | Learn entries |
| `pages/` | Site pages such as How to read a code (`/codes/`) |
| `scripts/` | `validate.mjs`, `build.mjs`, `issue-to-story.mjs`, `new-id.mjs` |
| `tests/` | Example content for every crop; `npm test` checks it |

## Open data

Every build publishes the collection as a [Frictionless Data Package](https://datapackage.org): `datapackage.json` with `stories.csv`/`.json`, `lots.csv`, `lot-quality.csv`, `producers.json` and `varieties.json`. Story pages carry schema.org metadata.

## Run it locally

```sh
npm install
npm run check      # validate, test and build
open dist/index.html
```

## Licence

Stories and photos: [CC BY 4.0](LICENSE-CONTENT.md), credit the storyteller and Open Origin. Code: [Apache-2.0](LICENSE); copies and forks must keep the [NOTICE](NOTICE) file.
