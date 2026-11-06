<p align="center"><img src="site/brand/lockup.svg" width="280" alt="Open Origin"></p>
<h1 align="center">Open Origin</h1>
<p align="center"><b>Cerita dari tempat ia tumbuh.</b></p>
<p align="center"><a href="README.md">English</a> · <b>Bahasa Indonesia</b> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ar.md">العربية</a></p>

Koleksi terbuka cerita asal-usul **kopi, kakao, teh, rempah, vanila, madu dan gula aren/kelapa**, ditulis bersama oleh komunitas: tanahnya, prosesnya, dan orang-orangnya, dengan kata-kata mereka sendiri. Siapa pun boleh membaca, memakai ulang, dan menambahkan ceritanya. Kami mulai dari Nusantara, lalu ke seluruh dunia.

**Situs:** https://glc-works.github.io/open-origin/id/ (bahasa Indonesia) · https://glc-works.github.io/open-origin/ (bahasa Inggris) · **Visi dan peta jalan:** [BLUEPRINT.md](BLUEPRINT.md) (bahasa Inggris)

## Bagikan cerita

Tidak perlu bisa coding. **[Isi formulir cerita](https://github.com/glc-works/open-origin/issues/new?template=story.yml)**, lalu pengelola akan menjadikannya halaman. Boleh ditulis dalam bahasa apa pun. Untuk menambahkan satu panen, kiriman, atau produksi yang Anda jual, pakai **[formulir lot](https://github.com/glc-works/open-origin/issues/new?template=lot.yml)**. Kalau terbiasa dengan git, silakan buka pull request; lihat [CONTRIBUTING.md](CONTRIBUTING.md).

## Cara datanya disusun

| | Isinya | ID |
|---|---|---|
| **Origin** | Daerah asal: tanah, sejarah, proses yang umum (Gayo, Banda, Kintamani…) | `O-` |
| **Cerita** | Kebun, koperasi, atau gerakan dengan suaranya sendiri; banyak per origin | `S-` |
| **Produsen** | Profil petani, kelompok, perkebunan, fasilitas pengolahan, atau roaster | `P-` |
| **Lot** | Satu panen, kiriman, atau produksi, yaitu yang dibeli pembeli, lengkap dengan proses, bentuk, dan mutunya | `L-` |
| **Learn** | Spesies, varietas, proses, dan cara penilaian mutu (cupping, cut test kakao…) dengan sumber | |

ID tidak pernah berubah, jadi nama dan file boleh diganti tanpa merusak tautan. `/s/<id>/` selalu mengarah ke halamannya. Kode seperti `L-KPBJF525-D` punya karakter cek yang menangkap salah ketik; lihat [Cara membaca kode](https://glc-works.github.io/open-origin/id/codes/).

## Data terbuka

Setiap build menerbitkan koleksi ini sebagai [Frictionless Data Package](https://datapackage.org): `datapackage.json` dengan `stories.csv`/`.json`, `lots.csv`, `lot-quality.csv`, `producers.json` dan `varieties.json`.

Data yang sama juga tersedia sebagai API baca gratis: satu file JSON per kode (`api/v1/lots/L-KPBJF525-D.json`), daftar per jenis dan per komoditas, serta feed Atom/JSON untuk entri baru. Mulai dari [`api/v1/index.json`](https://glc-works.github.io/open-origin/api/v1/index.json); penjelasannya ada di [halaman API](https://glc-works.github.io/open-origin/api/).

## Menjalankan di komputer sendiri

```sh
npm install
npm run check      # validasi, tes, dan build
open dist/index.html
```

## Lisensi

Cerita dan foto: [CC BY 4.0](LICENSE-CONTENT.md), cantumkan pencerita dan Open Origin; foto dari Wikimedia Commons tetap memakai lisensi yang tertulis di bawahnya. Kode: [Apache-2.0](LICENSE); salinan dan fork wajib menyertakan file [NOTICE](NOTICE).
