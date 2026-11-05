---
title: Cara membaca kode Open Origin
summary: Setiap origin, cerita, produsen dan lot punya kode permanen seperti L-KPBJF525-D. Ini arti tiap bagiannya, dan cara salah ketik tertangkap.
---

Setiap origin, cerita, produsen dan lot di Open Origin punya **kode permanen**. Tulis di karung, faktur, kontrak atau label, dan siapa pun bisa mencarinya di sini. Kode ini tidak pernah berubah, walaupun halamannya diganti nama atau dipindah.

## Tiga bagian

[[code-anatomy]]

| Bagian | Contoh | Arti |
|---|---|---|
| **Prefiks** | `L` | Jenis catatannya (lihat tabel di bawah). |
| **Badan** | `KPBJF525` | 8 karakter acak yang dipilih saat catatan dibuat. Bagian inilah yang membuat kode unik. |
| **Karakter cek** | `D` | Dihitung dari prefiks dan badan. Gunanya menangkap salah ketik (lihat di bawah). |

## Prefiks

| Prefiks | Catatan | Artinya |
|---|---|---|
| `O-` | Origin | Tempat: daerah, lembah atau pulau tempat tanaman tumbuh. |
| `S-` | Cerita | Cerita kebun, kelompok atau gerakan dari tempat itu. |
| `P-` | Produsen | Profil petani, kelompok, estate, pengolah atau roaster. |
| `L-` | Lot | Yang benar-benar dibeli pembeli: satu panen, pengiriman atau produksi, dengan proses, varietas dan hasil mutunya sendiri. |

## Karakter yang dipakai

Badan dan karakter cek memakai 31 karakter: angka **2 sampai 9** dan huruf **A sampai Z tanpa I, L dan O**. 0, 1, I, L dan O tidak dipakai karena mirip satu sama lain di label tulisan tangan atau saat dieja lewat telepon. Huruf O dan L hanya muncul sebagai prefiks.

Dengan 8 karakter acak ada 31⁸, sekitar 850 miliar, kemungkinan badan untuk tiap prefiks. Saat build juga dicek bahwa tidak ada dua catatan yang memakai kode yang sama.

## Cara karakter cek menangkap salah ketik

Setiap karakter badan punya nilai 0 sampai 30 (`2` = 0, `3` = 1 … `9` = 7, `A` = 8 … `Z` = 30). Kalikan nilai karakter ke-1 dengan 1, ke-2 dengan 2, dan seterusnya sampai ke-8 dengan 8. Tambahkan angka prefiks (O = 3, S = 7, P = 11, L = 13), lalu jumlahkan semuanya. Karakter cek adalah karakter yang membuat totalnya menjadi kelipatan 31.

Karena 31 bilangan prima, cara ini menangkap:

- **semua** salah ketik satu karakter,
- **semua** pertukaran dua karakter yang bersebelahan,
- dan prefiks yang salah.

Kode yang salah ketik tidak pernah diam-diam terbaca sebagai catatan lain. Anda akan diberi tahu bahwa kode itu kemungkinan salah ketik.

Karakter cek bisa berupa huruf, sama seperti karakter terakhir ISBN bisa berupa X. Cek yang hanya berupa angka (mod 10) akan meloloskan sebagian salah ketik, karena badan kode memakai 31 karakter berbeda.

## Mengetik kode

Kode boleh diketik dengan huruf kecil, tanpa tanda "-", atau dengan spasi: `lkpbjf525d`, `L KPBJF525 D` dan `L-KPBJF525-D` semuanya menemukan lot yang sama. File dan halaman selalu menampilkannya dalam bentuk baku, huruf besar dengan tanda "-".

## Mencari kode

Setiap kode punya tautan pendek: `/s/<kode>/`. Misalnya [/s/L-KPBJF525-D/](../../s/L-KPBJF525-D/) membuka lot itu di halaman cerita tempat lot itu berada.

## Membuat kode baru

Kontributor yang memakai formulir GitHub mendapat kode dari editor. Untuk membuat sendiri, jalankan `npm run new-id`; untuk mengecek kode, jalankan `npm run new-id -- L-KPBJF525-D`.
