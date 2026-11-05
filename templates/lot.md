---
# Template: lot / satu lot (satu panen, pengiriman, atau produksi; yang dibeli pembeli)
# Simpan di lots/<crop>/<negara>/<nama-cerita>/<nama-lot>.md
# Save as lots/<crop>/<country>/<story-slug>/<lot-name>.md, e.g. lots/coffee/id/kebun-pak-rahman/2025-honey-1.md
# Hanya id dan date yang wajib; hapus baris yang tidak dipakai. Only id and date are required; delete lines you don't use.
id: L-Q4ZK8M2P                     # L- + 8 karakter, tidak pernah diubah. Buat baru: npm run new-id / never changes
name: Gayo Honey                   # nama jual lot / the name the lot is sold under
date: 2025-06                      # panen atau produksi: YYYY, YYYY-MM atau YYYY-MM-DD / harvest or production date
form: green                        # cherry | parchment | green | roasted | raw | dried | processed
process: honey                     # washed | natural | honey | wet-hulled | anaerobic | fermented | sun-dried | other
varieties: [Gayo 1, Ateng Super]
quantity_kg: 300
traceability: farm                 # jika beda dari cerita / only if it differs from the story
processed_by: P-H7FAQRHQ           # kosongkan jika diproses sendiri oleh produsen / leave out if the producer processed it
sold_by: Nama penjual              # nama atau id profil / a name or a producer id
quality:                           # opsional; field mutu sesuai komoditas / optional, fields for this crop, see CONTRIBUTING.md
  cupping_score: 85.5
  cupping_protocol: SCA
  moisture_pct: 11.2
  screen_size: "16-18"
  defects_primary: 0
  defects_secondary: 3
tested_by: Licensed Q Grader, nama lab   # wajib untuk cupping_score / required for a cupping score
certificate: https://example.org/sertifikat.pdf   # opsional / optional
---

Catatan singkat tentang lot ini (opsional). Short notes about this lot (optional).
