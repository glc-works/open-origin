<p align="center"><img src="site/brand/lockup.svg" width="280" alt="Open Origin"></p>
<h1 align="center">Open Origin</h1>
<p align="center"><b>育つ場所から届く物語。</b></p>
<p align="center"><a href="README.md">English</a> · <a href="README.id.md">Bahasa Indonesia</a> · <a href="README.zh-CN.md">简体中文</a> · <b>日本語</b> · <a href="README.ar.md">العربية</a></p>

**コーヒー、カカオ、茶、スパイス、バニラ、はちみつ、パームシュガー**の産地の物語を、コミュニティで書き集めるオープンなコレクションです。土地、加工、そして人々のことを、本人の言葉で伝えます。誰でも読み、再利用し、自分の物語を加えることができます。インドネシアの島々から始め、世界へ広げていきます。

**サイト:** https://glc-works.github.io/open-origin/ · **ビジョンとロードマップ:** [BLUEPRINT.md](BLUEPRINT.md)（英語）

## 物語を共有する

コードの知識は不要です。**[ストーリーフォームに記入](https://github.com/glc-works/open-origin/issues/new?template=story.yml)**すると、メンテナーがページにします。どの言語で書いても構いません。販売している収穫・出荷・生産の一回分を追加するには **[ロットフォーム](https://github.com/glc-works/open-origin/issues/new?template=lot.yml)** を使ってください。git を使える方は pull request でもどうぞ。詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

## 構成

| | 内容 | ID |
|---|---|---|
| **産地（Origin）** | 産地の土地、歴史、代表的な加工法（Gayo、Banda、Kintamani…） | `O-` |
| **ストーリー** | 農園、協同組合、活動が自ら語る物語。ひとつの産地に複数 | `S-` |
| **生産者** | 農家、グループ、農園、加工施設、ロースターのプロフィール | `P-` |
| **ロット** | 一回の収穫・出荷・生産。買い手が実際に買うもので、加工法・形態・品質を記録 | `L-` |
| **Learn** | 種、品種、加工法、品質評価（カッピング、カカオのカットテスト…）を出典付きで解説 | |

ID は変わらないため、名前やファイル名を変えてもリンクは切れません。`/s/<id>/` は常にそのページを指します。`L-KPBJF525-D` のようなコードにはチェック文字があり、入力ミスを検出します。[How to read a code](https://glc-works.github.io/open-origin/codes/) を参照。

## オープンデータ

ビルドのたびに、コレクション全体を [Frictionless Data Package](https://datapackage.org) として公開します：`datapackage.json` と `stories.csv`/`.json`、`lots.csv`、`lot-quality.csv`、`producers.json`、`varieties.json`。

同じデータは無料の読み取り API としても公開しています：コードごとに 1 つの JSON ファイル（`api/v1/lots/L-KPBJF525-D.json`）、種類別・作物別の一覧、新着の Atom/JSON フィード。[`api/v1/index.json`](https://glc-works.github.io/open-origin/api/v1/index.json) から始めてください。詳しくは [API ページ](https://glc-works.github.io/open-origin/api/)へ。

## ローカルで動かす

```sh
npm install
npm run check      # 検証、テスト、ビルド
open dist/index.html
```

## ライセンス

物語と写真：[CC BY 4.0](LICENSE-CONTENT.md)（語り手と Open Origin をクレジットしてください。Wikimedia Commons の写真は、写真の下に示したそれぞれのライセンスに従います）。コード：[Apache-2.0](LICENSE)。コピーや派生物には [NOTICE](NOTICE) ファイルを残してください。
