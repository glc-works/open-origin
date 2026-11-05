---
title: Cut test
crop: cocoa
type: term
summary: "How cocoa beans are graded: 300 beans are cut open lengthwise and counted for mould, slate and other defects."
sources:
  - https://cdn.standards.iteh.ai/samples/5637/2c8e3382039e4cab9ad6fa5e68628832/ISO-1114-1977.pdf
  - https://cdn.standards.iteh.ai/samples/7366/41ad1391cba34271ab76094a22a85a17/ISO-2451-1973.pdf
  - https://standards.iteh.ai/catalog/standards/iso/78146f3a-d85f-4baa-9f55-7055a476ae6e/iso-2451-2014
  - https://jos.unsoed.ac.id/index.php/ijft/article/download/12221/5554
---

Coffee is judged by tasting; dried cocoa beans are first judged by looking inside them. The **cut test** is the international method for this, set out in ISO 1114 [1].

### How it is done

From a sample of the lot, 300 whole beans are taken. Each one is cut lengthwise through the middle so as much of the inside as possible is visible, and both halves are looked at in daylight or equivalent light. Every defect is counted separately and reported as a percentage of the 300 beans. A bean with more than one defect is counted only once, under its most serious defect [1].

### What the cutter looks for

| Defect | What it means |
|---|---|
| Mouldy | Mould is visible inside the bean [2] |
| Slaty | Half or more of the cut surface is slate-coloured: the bean was hardly fermented [2] |
| Insect-damaged | Insects, or damage from them, inside the bean [2] |
| Germinated | The seed germ has pierced or broken the shell [2] |
| Flat | So thin there is nothing to cut [2] |
| Violet or purple | Only partly fermented; the later standard counts these in the cut test too [3] [4] |

The 2014 edition of ISO 2451 uses the cut test to define fermentation levels: **good fermented** beans have no more than 5% slaty and 5% defective beans by count, **fair fermented** no more than 10% of each [3]. The grade limits themselves are in the standard; on Open Origin we record the measured percentages per lot rather than a grade.

### Bean count

Bean size is reported as the number of whole beans in 100 g: fewer beans means bigger beans [3]. Indonesia's standard SNI 2323:2008, as cited by Nabila & Wijayanti (2024), groups them as AA (85 per 100 g), A (86–100), B (101–110) and C (111–120) [4].

### On Open Origin

A cocoa lot can record `fermented_pct`, `slaty_pct`, `mouldy_pct`, `bean_count_per_100g` and `moisture_pct`, with `tested_by` saying who did the cut test.
