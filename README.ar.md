<p align="center"><img src="site/brand/lockup.svg" width="280" alt="Open Origin"></p>
<h1 align="center">Open Origin</h1>
<p align="center"><b>حكايات من حيث تنمو.</b></p>
<p align="center"><a href="README.md">English</a> · <a href="README.id.md">Bahasa Indonesia</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a> · <b>العربية</b></p>

<div dir="rtl">

مجموعة مفتوحة يكتبها المجتمع، تروي حكايات منشأ **البن والكاكاو والشاي والتوابل والفانيليا والعسل وسكر النخيل**: الأرض وطريقة المعالجة والناس، بكلماتهم هم. يمكن لأي شخص أن يقرأها ويعيد استخدامها ويضيف حكايته. نبدأ من أرخبيل إندونيسيا ثم ننطلق إلى العالم.

**الموقع:** https://glc-works.github.io/open-origin/ · **الرؤية وخارطة الطريق:** [BLUEPRINT.md](BLUEPRINT.md) (بالإنجليزية)

## شارك حكاية

لا تحتاج إلى معرفة البرمجة. **[املأ نموذج الحكاية](https://github.com/glc-works/open-origin/issues/new?template=story.yml)** وسيحوّلها أحد المشرفين إلى صفحة. يمكنك الكتابة بأي لغة. لإضافة حصاد أو شحنة أو دفعة إنتاج تبيعها، استخدم **[نموذج الدفعة (lot)](https://github.com/glc-works/open-origin/issues/new?template=lot.yml)**. وإن كنت تستخدم git فيمكنك فتح طلب سحب (pull request)؛ راجع [CONTRIBUTING.md](CONTRIBUTING.md).

## كيف تُنظَّم المحتويات

| | ما هو | المعرّف |
|---|---|---|
| **المنشأ** | منطقة زراعة: الأرض والتاريخ وطريقة المعالجة الشائعة (Gayo، Banda، Kintamani…) | `O-` |
| **الحكاية** | مزرعة أو تعاونية أو حركة تروي بصوتها؛ حكايات كثيرة لكل منشأ | `S-` |
| **المنتِج** | ملف لمزارع أو مجموعة أو ضيعة أو منشأة معالجة أو محمصة | `P-` |
| **الدفعة (Lot)** | حصاد أو شحنة أو دفعة إنتاج واحدة، أي ما يشتريه المشتري فعلًا، مع المعالجة والشكل والجودة | `L-` |
| **Learn** | الأنواع والأصناف وطرق المعالجة وتقييم الجودة (التذوق، واختبار قطع حبوب الكاكاو…) مع المصادر | |

المعرّفات لا تتغير أبدًا، لذا يمكن إعادة تسمية الأسماء والملفات دون أن تنكسر الروابط. الرابط `/s/<id>/` يقود دائمًا إلى الصفحة. يحتوي رمز مثل `L-KPBJF525-D` على حرف تحقق يكشف أخطاء الكتابة؛ انظر [How to read a code](https://glc-works.github.io/open-origin/codes/).

## البيانات المفتوحة

ينشر كل بناء المجموعةَ كاملةً بصيغة [Frictionless Data Package](https://datapackage.org): الملف `datapackage.json` مع `stories.csv`/`.json` و`lots.csv` و`lot-quality.csv` و`producers.json` و`varieties.json`.

## التشغيل محليًا

</div>

```sh
npm install
npm run check      # validate, test and build
open dist/index.html
```

<div dir="rtl">

## الترخيص

الحكايات والصور: [CC BY 4.0](LICENSE-CONTENT.md)، مع ذكر الراوي وOpen Origin. الشيفرة: [Apache-2.0](LICENSE)، ويجب أن تحتفظ النسخ والأعمال المشتقة بملف [NOTICE](NOTICE).

</div>
