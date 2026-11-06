---
title: Open Origin data API
summary: Every origin, story, producer and lot as JSON, one file per permanent code, plus feeds of what is new. Free to use under CC BY 4.0.
---

The API is a set of plain JSON files, rebuilt each time the collection changes. No key, no sign-up, no rate limit beyond the host's. Any website or app can fetch it, because the files are served with `Access-Control-Allow-Origin: *`.

## Start here

`GET api/v1/index.json` lists every endpoint and how many records each one has.

| Endpoint | What it returns |
|---|---|
| `api/v1/origins.json` | Every origin profile (code `O-`), one summary row each |
| `api/v1/stories.json` | Every farm and movement story (`S-`) |
| `api/v1/producers.json` | Every producer profile (`P-`): farmers, groups, estates, processors, roasters and labs |
| `api/v1/lots.json` | Every lot (`L-`) |
| `api/v1/origins/O-….json` | One origin in full, by its code; the same for `stories/S-…`, `producers/P-…` and `lots/L-…` |
| `api/v1/crops/coffee.json` | Everything for one crop: `coffee`, `cocoa`, `tea`, `spice`, `vanilla`, `honey` or `sugar` |
| `api/v1/varieties.json` | Plant varieties with lineage, local names and traits |
| `feed.xml` · `feed.json` | The 50 newest records as an Atom feed and a JSON Feed |
| `codes.json` | Every code with its kind, crop and page, in one small file |
| `datapackage.json` | The whole collection as CSV and JSON ([Frictionless Data Package](https://datapackage.org)) |

The first letter of a code tells you where it lives: `O` origins, `S` stories, `P` producers, `L` lots. So the code printed on a sack, for example `L-KPBJF525-D`, is enough to fetch `api/v1/lots/L-KPBJF525-D.json`.

## What a response looks like

Every file has the same two parts: `meta` (licence, credit line, links) and `data` (the record or the list).

```json
{
  "meta": {
    "api_version": "1",
    "license": { "name": "CC-BY-4.0", "url": "https://creativecommons.org/licenses/by/4.0/" },
    "attribution": "Data from Open Origin (https://glc-works.github.io/open-origin/), CC BY 4.0. Credit the people who told each story.",
    "id": "L-KPBJF525-D",
    "type": "lot",
    "links": { "self": "…/api/v1/lots/L-KPBJF525-D.json", "html": "…", "permalink": "…/s/L-KPBJF525-D/" }
  },
  "data": { "id": "L-KPBJF525-D", "name": "Gayo Honey Process", "date": "2025-09", "crop": "coffee", "…": "…" }
}
```

A record has the same fields as in the data package, plus `added` and `updated` (when its file was first published and last changed) and `url` (its page). Origins and stories carry `coords`, rounded to about 1 km, in the list rows too, so a map can be drawn from `origins.json` alone. Fields with no value are `null`. Text is in the language it was told in; translations are in `translations`.

## Using the data

The data is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). You may copy, change and use it for anything, also commercially, as long as you credit Open Origin and the people who told the stories, and link to the licence. The `attribution` line in every response is a credit you can show as it is. Photos keep their own licence, given beside each photo.

## Versions

Everything is under `api/v1/`. Within v1, fields are only ever added, never renamed or removed, and codes never change. A change that would break an app gets a new `api/v2/`, and v1 keeps working alongside it for a while.

## Ringkasan (Bahasa Indonesia)

API ini adalah kumpulan file JSON biasa yang dibangun ulang setiap kali koleksi berubah, tanpa kunci dan tanpa daftar. Mulai dari `api/v1/index.json`. Satu kode, misalnya `L-KPBJF525-D` di karung, cukup untuk membuka `api/v1/lots/L-KPBJF525-D.json`. Huruf pertama menunjukkan jenisnya: `O` origin, `S` cerita, `P` produsen, `L` lot. Datanya berlisensi CC BY 4.0: boleh dipakai untuk apa saja, juga komersial, asal mencantumkan Open Origin dan orang yang bercerita. Kabar terbaru ada di `feed.xml` dan `feed.json`.
