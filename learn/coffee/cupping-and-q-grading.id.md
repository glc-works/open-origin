---
title: "Cupping dan Q grading"
summary: "Cara mutu kopi dinilai dengan skala 100 poin, apa yang diperiksa seorang Q Grader, dan mengapa 80 poin adalah batas kopi spesialti."
translator: Open Origin Editorial
---

**Cupping** adalah cara baku untuk mencicipi dan membandingkan kopi. Kopi yang baru disangrai dan digiling kasar diseduh air panas di cangkir-cangkir yang sama. Pencicip memecah lapisan ampas yang terbentuk di permukaan, menghirup aromanya, membuang ampasnya, lalu menyeruput kopi dari sendok selagi mendingin, supaya bisa menilainya saat panas, hangat dan dingin.

**Q Grader** adalah pencicip yang disertifikasi Coffee Quality Institute (CQI) untuk menilai arabika secara konsisten dengan grader lain di seluruh dunia. Ujiannya berlangsung beberapa hari dan mencakup penciuman, pengecapan, cupping, serta penilaian biji hijau dan biji sangrai. **R Grader** (kadang disebut Q Robusta Grader) melakukan hal yang sama untuk robusta, dengan 80 poin ke atas berarti "robusta fine".

### Apa yang dinilai

Pada formulir cupping SCA/CQI klasik, sepuluh atribut masing-masing diberi nilai sampai 10 poin, totalnya dari 100:

| Atribut | Yang ditanyakan pencicip |
|---|---|
| Fragrance / aroma | Bagaimana baunya, saat kering lalu saat diberi air? |
| Flavour (rasa) | Seberapa kuat, kompleks dan enak rasanya? |
| Aftertaste | Apakah rasa enaknya bertahan setelah ditelan? |
| Acidity (keasaman) | Apakah kesegarannya hidup dan enak, atau masam? |
| Body | Bagaimana rasanya di mulut: encer, lembut, kental? |
| Balance (keseimbangan) | Apakah semua unsurnya menyatu? |
| Uniformity (keseragaman) | Apakah kelima cangkir rasanya sama? |
| Clean cup | Apakah ada cacat rasa? |
| Sweetness (manis) | Apakah ada rasa manis yang enak? |
| Overall | Penilaian keseluruhan pencicip |

Cacat yang ditemukan di cangkir dikurangkan.

### Biji hijaunya juga dihitung

Sebelum mencicipi, grader memeriksa 350 g sampel kopi biji hijau. Untuk mutu spesialti, sampel itu tidak boleh punya cacat primer (kategori 1), seperti biji hitam penuh, biji asam atau benda asing, dan cacat sekunder penuh tidak lebih dari lima, seperti biji pecah, berlubang karena serangga atau belum matang. Kadar airnya sebaiknya sekitar 10–12%.

### Arti angkanya

| Skor | Mutu |
|---|---|
| 90–100 | Luar biasa (*outstanding*) |
| 85–89,99 | Istimewa (*excellent*) |
| 80–84,99 | Sangat baik: spesialti |
| Di bawah 80 | Di bawah mutu spesialti |

### Pendekatan yang lebih baru

Pada 2024 Specialty Coffee Association memperkenalkan **Coffee Value Assessment (CVA)**. Sistem ini memisahkan penggambaran kopi (rasa apa yang ada dan seberapa kuat) dari penilaiannya (seberapa suka pencicip), dan menambahkan cerita serta keberlanjutan kopi sebagai bagian dari nilainya. Kedua sistem dipakai sekarang.

### Di Open Origin

Skor adalah milik satu lot dari satu panen, bukan milik seluruh daerah. Karena itu skor dicatat di file lot di samping cerita kebun atau kelompok, dengan `cupping_score` di blok `quality` dan nama penilainya di `tested_by`. Kami menampilkannya sebagaimana dilaporkan.
