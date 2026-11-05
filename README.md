# Open Origin

**Stories from where it grows.** An open, community-written collection of stories about coffee, and soon cocoa, tea, spices, vanilla, honey and palm sugar: the land, the process and the people, told in their own words.

> **Bahasa Indonesia:** Open Origin adalah koleksi cerita terbuka tentang kopi dan hasil tani lain, dari suara petani dan orang-orang di sekitarnya. Siapa pun boleh membaca, memakai ulang, dan menambahkan ceritanya. Mulai dari kopi Nusantara, lalu ke seluruh dunia.

## Share a story

You don't need to know code. **[Fill in the story form](https://github.com/glc-works/open-origin/issues/new?template=story.yml)** and a maintainer will turn it into a page. If you are comfortable with git, you can also open a pull request with a Markdown file. See [CONTRIBUTING.md](CONTRIBUTING.md).

## What's here

| Path | What it is |
|---|---|
| `stories/<crop>/<country>/<slug>.md` | One story per file: details at the top, the story below. Kinds: origin profile, farm, movement |
| `stories/<crop>/<country>/<slug>.<lang>.md` | Translations of a story (en, zh, ar, ja, ...) |
| `scripts/validate.mjs` | Checks every story (required fields, consent, rounded coordinates) |
| `scripts/build.mjs` | Builds the website into `dist/` |
| `scripts/issue-to-story.mjs` | Turns an approved story form into a story file |
| `site/style.css` | The website's stylesheet |

## Open data

Every build also publishes the collection as a [Frictionless Data Package](https://datapackage.org), the Open Knowledge Foundation's open data format:

- `datapackage.json`: the package description, licence and column schema
- `data/stories.csv`: one row per story, ready for spreadsheets and analysis
- `data/stories.json`: every story with its full text, farm-to-cup journey and translations

Story pages also carry schema.org (JSON-LD) metadata so search engines understand the place and the story.

## Run it locally

```sh
npm install
npm run check      # validate + build
open dist/index.html
```

## Crops

Coffee is open now. The structure is ready for `cocoa`, `tea`, `spice`, `vanilla`, `honey` and `sugar` (palm and coconut sugar). New crops are added in `scripts/lib.mjs`.

## Licence

- Stories and photos: [CC BY 4.0](LICENSE-CONTENT.md). Credit the storyteller and Open Origin.
- Code: [MIT](LICENSE).
