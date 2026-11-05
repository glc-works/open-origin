<p align="center"><img src="site/brand/lockup.svg" width="280" alt="Open Origin"></p>
<h1 align="center">Open Origin</h1>
<p align="center"><b>来自产地的故事。</b></p>
<p align="center"><a href="README.md">English</a> · <a href="README.id.md">Bahasa Indonesia</a> · <b>简体中文</b> · <a href="README.ja.md">日本語</a> · <a href="README.ar.md">العربية</a></p>

一个由社区共同撰写的开放合集，讲述**咖啡、可可、茶、香料、香草、蜂蜜和棕榈糖**的产地故事：土地、加工方式和人，用他们自己的话讲述。任何人都可以阅读、再利用并添加自己的故事。我们从印度尼西亚群岛开始，逐步走向世界。

**网站：** https://glc-works.github.io/open-origin/ · **愿景与路线图：** [BLUEPRINT.md](BLUEPRINT.md)（英文）

## 分享故事

无需会写代码。**[填写故事表单](https://github.com/glc-works/open-origin/issues/new?template=story.yml)**，维护者会把它整理成页面。可以用任何语言书写。要添加你出售的一次收获、一批货或一次生产，请使用 **[批次（lot）表单](https://github.com/glc-works/open-origin/issues/new?template=lot.yml)**。熟悉 git 的话，也可以提交 pull request，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 内容结构

| | 内容 | ID |
|---|---|---|
| **产地（Origin）** | 一个产区：土地、历史、常见加工方式（Gayo、Banda、Kintamani…） | `O-` |
| **故事（Story）** | 农场、合作社或运动的自述；每个产地可以有很多篇 | `S-` |
| **生产者（Producer）** | 农户、团体、庄园、加工厂或烘焙商的简介 | `P-` |
| **批次（Lot）** | 一次收获、一批货或一次生产，也就是买家实际买到的东西，附带加工方式、形态和品质 | `L-` |
| **Learn** | 物种、品种、加工方式和品质评定（杯测、可可切开检验…），附来源 | |

ID 永不改变，因此名称和文件可以改名而不会断链。`/s/<id>/` 永远指向对应页面。像 `L-KPBJF525-D` 这样的编码带有校验字符，可以发现输入错误；参见 [How to read a code](https://glc-works.github.io/open-origin/codes/)。

## 开放数据

每次构建都会以 [Frictionless Data Package](https://datapackage.org) 格式发布整个合集：`datapackage.json` 以及 `stories.csv`/`.json`、`lots.csv`、`lot-quality.csv`、`producers.json` 和 `varieties.json`。

## 本地运行

```sh
npm install
npm run check      # 校验、测试并构建
open dist/index.html
```

## 许可

故事和照片：[CC BY 4.0](LICENSE-CONTENT.md)，请注明讲述者和 Open Origin。代码：[Apache-2.0](LICENSE)，副本和衍生作品必须保留 [NOTICE](NOTICE) 文件。
