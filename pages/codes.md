---
title: How to read an Open Origin code
summary: Every origin, story, producer and lot has a permanent code such as L-KPBJF525-D. This is what each part means, and how a typo is caught.
---

Every origin, story, producer and lot in Open Origin has a **permanent code**. Write it on a sack, an invoice, a contract or a label, and anyone can look it up here. The code never changes, even when a page is renamed or moved.

## The three parts

[[code-anatomy]]

| Part | Example | Meaning |
|---|---|---|
| **Prefix** | `L` | What kind of record it is (see the table below). |
| **Body** | `KPBJF525` | 8 characters picked at random when the record was made. This is what makes the code unique. |
| **Check character** | `D` | Worked out from the prefix and the body. It catches typos (see below). |

## Prefixes

| Prefix | Record | What it is |
|---|---|---|
| `O-` | Origin | A place: a region, valley or island where the crop grows. |
| `S-` | Story | A farm, group or movement story told from that place. |
| `P-` | Producer | A farmer, group, estate, processor or roaster profile. |
| `L-` | Lot | What a buyer actually buys: one harvest, shipment or production run, with its own process, varieties and quality results. |

## Which characters are used

The body and the check character use 31 characters: the digits **2 to 9** and the letters **A to Z without I, L and O**. 0, 1, I, L and O are left out because they look alike on a handwritten label or over the phone. The letters O and L appear only as prefixes.

With 8 random characters there are 31⁸, about 850 billion, possible bodies for each prefix. The build also checks that no two records share a code.

## How the check character catches typos

Each body character has a value from 0 to 30 (`2` = 0, `3` = 1 … `9` = 7, `A` = 8 … `Z` = 30). Multiply the 1st character's value by 1, the 2nd by 2, and so on up to the 8th by 8. Add a number for the prefix (O = 3, S = 7, P = 11, L = 13) and add everything up. The check character is the one that brings the total to a multiple of 31.

Because 31 is a prime number, this catches:

- **every** single mistyped character, and
- **every** swap of two characters next to each other,
- and a wrong prefix.

A mistyped code is never quietly read as a different record. You are told it was probably mistyped.

The check character can be a letter, just as the last character of an ISBN can be X. A check made only of digits (mod 10) would let some typos through, because a body uses 31 different characters.

## Typing a code

You can type a code in small letters, without the dashes, or with spaces: `lkpbjf525d`, `L KPBJF525 D` and `L-KPBJF525-D` all find the same lot. Files and pages always show it in the standard form, with capitals and dashes.

## The crop is shown next to the code

The code itself does not say which crop it is, so it never has to change if a lot turns out to be a blend or was filed under the wrong crop. Pages, labels and the lookup box always show the crop beside it: `L-KPBJF525-D` · COFFEE.

## Origins and public place codes

An origin keeps its own `O-` code, and is matched to public codes for the same area so other datasets can be joined to it:

| Code | Example | What it is |
|---|---|---|
| ISO 3166-2 | `ID-AC` | The international code of the province or state. |
| National area code | `11.17` | The government's own code for the regency; in Indonesia the Kemendagri *kode wilayah*. |
| Wikidata | `Q…` | The open knowledge base id for the place, linked to Wikipedia in every language. |
| GeoNames | `1234567` | The id in the GeoNames gazetteer, used by many maps and datasets. |
| Plus Code | `6MPRJV00+` | The open grid code also used by Google Maps. It is worked out from the coordinates and covers about 5 km, because coordinates are rounded for privacy. |
| H3 cell | `876556163ffffff` | A hexagon in the H3 grid (resolution 7, about 5 km²), used to join supply-chain and deforestation data. Also worked out from the coordinates. |

All of them are in the open data (`stories.csv`, `stories.json` and `codes.json`).

## Looking a code up

Every code has a short link: `/s/<code>/`. For example, [/s/L-KPBJF525-D/](../s/L-KPBJF525-D/) opens that lot on the page of the story it belongs to.

## Making a new code

Contributors who use the GitHub form get a code from the editors. To make one yourself, run `npm run new-id`; to check one, run `npm run new-id -- L-KPBJF525-D`.
