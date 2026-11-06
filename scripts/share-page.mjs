// The /share/ page: a story form made for a phone, in English (/share/) and Bahasa Indonesia (/share/id/).
// It needs no GitHub account when the relay in relay/ is running (relay/public-config.json says where it is);
// until then it fills in the GitHub issue form instead. The form logic is in site/share.js.
import { CROP_KEYS, KINDS, TRACEABILITY, TOLD_BY, MAX, MIN_STORY } from "./story-form.mjs";

// Countries listed first; any other two-letter code can be typed under "Other".
const COUNTRIES = ["ID", "TL", "PG", "MY", "PH", "VN", "LA", "TH", "MM", "IN", "LK", "CN", "TW", "JP", "YE", "ET", "KE", "UG", "RW", "BI", "TZ", "CD", "CM", "CI", "GH", "NG", "MG", "BR", "CO", "PE", "EC", "BO", "HN", "GT", "SV", "NI", "CR", "PA", "MX", "US"];
const LANGS = ["id", "en", "jv", "su", "min", "bug", "ban", "ms", "tet", "es", "pt", "fr", "am", "sw", "vi", "th", "zh", "ja", "ar", "hi"];

export const T = {
  en: {
    title: "Share a story", lede: "Tell the story of your farm, your group or your region in your own words. It takes about 10 minutes and works on a phone. No account needed.",
    draft: "Saved on this phone as you type, so you can stop and come back.", other: "Bahasa Indonesia", otherHref: "id/",
    steps: ["You", "Where it grows", "Your story", "Send"], next: "Next", back: "Back",
    you: "About you", name: "Your name", nameHint: "Shown on the story as the person who shared it.",
    toldBy: "Who is telling this story?", told: { farmer: "I am the farmer", "producer-group": "Our farmer group or cooperative", roaster: "A roaster", researcher: "A researcher", other: "Someone else (family, friend, field officer)" },
    contact: "WhatsApp or email for our team (optional)", contactHint: "Only our reviewers see this, to check details with you. It is never published and is deleted after 6 months.",
    crop: "What do you grow?", cropLabel: { coffee: "Coffee", cocoa: "Cocoa", tea: "Tea", spice: "Spices", vanilla: "Vanilla", honey: "Honey", sugar: "Palm or coconut sugar" },
    kind: "What kind of story?", kinds: { farm: "A farm or a farmer", movement: "A community or movement", origin: "A whole growing region" },
    producer: "Name of the farmer, farm or group", producerHint: "Use a person's name only if they agreed. \"A family farm near Takengon\" is fine too.",
    country: "Country", otherCountry: "Other (type the 2-letter code)", region: "Region", regionHint: "District and province, e.g. Bener Meriah, Aceh. Needed unless only the country is known or it is a blend.",
    town: "Nearest town or village", townHint: "Used to put the story on the map. We round it so no one's home can be found.",
    locate: "Use my location (rounded to about 1 km)", located: "Location saved, rounded to about 1 km:", locateFail: "Could not get the location. You can skip this.", unlocate: "Remove",
    origin: "Part of an origin on the site?", originNone: "No, or not sure",
    trace: "Where does the harvest come from?", traces: { farm: "One farm or one family", group: "A farmer group, cooperative or collector", region: "Many farms in one region", country: "Only the country is known", blend: "A mix of several regions" },
    more: "More details (optional, you can skip these)", species: "Species or type", speciesHint: "Needed for a farm story. If you are not sure, ask someone who knows, or choose another kind of story.", speciesNone: "Not sure", altitude: "Altitude in metres", altitudeHint: "e.g. 1200-1600",
    varieties: "Varieties", varietiesHint: "Separate with commas, e.g. Tim Tim, Ateng Super", process: "Process", harvest: "Harvest months", harvestHint: "e.g. Oct-Jun",
    notes: "Tasting notes", notesHint: "Up to 4, separated by commas",
    storyTitle: "Story title", storyTitleHint: "e.g. Gayo coffee from the shores of Lake Laut Tawar",
    summary: "Short summary", summaryHint: "One or two sentences. Shown on the story card.",
    story: "The story", storyHint: "A few paragraphs is perfect. Some questions that help:",
    prompts: ["Who looks after the farm, and since when?", "What is special about your land: soil, shade trees, weather?", "How do you process the harvest, and why that way?", "What is hard right now, and what do you hope for?"],
    journey: "From farm to cup (optional)", journeyHint: "One step per line, e.g. \"harvest: we pick only red cherries\". Steps: farm, harvest, process, dry, sort, roast, brew, market, other.",
    language: "Language of the story", languageHint: "Write in the language you are most comfortable with. A translation can be added later.",
    photo: "Photo (optional)", photoHint: "One photo you took or may share. We make it smaller and remove its location data before sending.", photoCredit: "Who took the photo?",
    sources: "Links to sources (optional)", sourcesHint: "For historical facts, one link per line.",
    consent1: "Everyone named or pictured in this story agreed to have it published.", consent2: "I agree to publish this story and photo under the CC BY 4.0 licence, with my name on it.",
    review: "What happens next: our team reads your story and may contact you with questions. When it is ready, it is published with your name. This usually takes a few days.",
    send: "Send my story", sendGithub: "Continue on GitHub", sending: "Sending…",
    githubNote: "The no-account form is not switched on yet, so this opens the GitHub form already filled in. You need a free GitHub account to send it.",
    githubLong: "Your story is long, so it was copied: paste it into \"The story\" on GitHub.",
    thanks: "Thank you! Your story has arrived.", thanksBody: "Its number is #{n}. Our team will read it and get back to you. You can follow it here:", another: "Share another story",
    offline: "No signal right now. Your story is saved on this phone; try again when you are online.",
    failed: "Sending did not work. Your story is still saved on this phone. Please try again in a moment.",
    tooMany: "Too many stories sent from here in a short time. Please wait a minute and try again.",
    fix: "Please check the marked field.", errors: { required: "Please fill this in.", "too-short": "Please write a little more: a few sentences at least.", "too-long": "This is too long.", invalid: "Please check this." },
    left: "{n} characters left",
  },
  id: {
    title: "Bagikan cerita", lede: "Ceritakan kebun, kelompok atau daerah Anda dengan kata-kata sendiri. Sekitar 10 menit, bisa dari HP, tanpa perlu akun.",
    draft: "Tersimpan otomatis di HP ini selama Anda mengetik, jadi bisa dilanjutkan nanti.", other: "English", otherHref: "../",
    steps: ["Anda", "Tempat tumbuh", "Cerita", "Kirim"], next: "Lanjut", back: "Kembali",
    you: "Tentang Anda", name: "Nama Anda", nameHint: "Ditampilkan di cerita sebagai orang yang membagikannya.",
    toldBy: "Siapa yang menceritakan?", told: { farmer: "Saya petaninya", "producer-group": "Kelompok tani atau koperasi kami", roaster: "Roaster", researcher: "Peneliti", other: "Orang lain (keluarga, teman, pendamping)" },
    contact: "WhatsApp atau email untuk tim kami (boleh dikosongkan)", contactHint: "Hanya dilihat tim pemeriksa untuk mengecek isi cerita bersama Anda. Tidak pernah diterbitkan dan dihapus setelah 6 bulan.",
    crop: "Apa yang Anda tanam?", cropLabel: { coffee: "Kopi", cocoa: "Kakao", tea: "Teh", spice: "Rempah", vanilla: "Vanili", honey: "Madu", sugar: "Gula aren atau kelapa" },
    kind: "Cerita tentang apa?", kinds: { farm: "Satu kebun atau petani", movement: "Komunitas atau gerakan", origin: "Satu daerah penghasil" },
    producer: "Nama petani, kebun atau kelompok", producerHint: "Pakai nama orang hanya jika orangnya setuju. \"Kebun keluarga dekat Takengon\" juga boleh.",
    country: "Negara", otherCountry: "Lainnya (ketik kode 2 huruf)", region: "Daerah", regionHint: "Kabupaten dan provinsi, mis. Bener Meriah, Aceh. Wajib, kecuali hanya negaranya yang diketahui atau campuran.",
    town: "Kota atau desa terdekat", townHint: "Untuk menaruh cerita di peta. Kami bulatkan supaya rumah siapa pun tidak bisa ditemukan.",
    locate: "Pakai lokasi saya (dibulatkan sekitar 1 km)", located: "Lokasi tersimpan, dibulatkan sekitar 1 km:", locateFail: "Lokasi tidak bisa diambil. Bagian ini boleh dilewati.", unlocate: "Hapus",
    origin: "Bagian dari daerah asal yang sudah ada di situs?", originNone: "Tidak, atau tidak tahu",
    trace: "Hasil panennya dari mana?", traces: { farm: "Dari satu kebun atau satu keluarga", group: "Dari kelompok tani, koperasi atau pengepul", region: "Dari banyak kebun di satu daerah", country: "Hanya diketahui negaranya", blend: "Campuran beberapa daerah" },
    more: "Detail lain (boleh dilewati)", species: "Jenis", speciesHint: "Wajib untuk cerita kebun. Kalau belum tahu, tanyakan ke yang tahu, atau pilih jenis cerita lain.", speciesNone: "Tidak tahu", altitude: "Ketinggian (meter)", altitudeHint: "mis. 1200-1600",
    varieties: "Varietas", varietiesHint: "Pisahkan dengan koma, mis. Tim Tim, Ateng Super", process: "Proses pengolahan", harvest: "Bulan panen", harvestHint: "mis. Okt-Jun",
    notes: "Catatan rasa", notesHint: "Paling banyak 4, pisahkan dengan koma",
    storyTitle: "Judul cerita", storyTitleHint: "mis. Kopi Gayo dari tepi Danau Laut Tawar",
    summary: "Ringkasan singkat", summaryHint: "Satu atau dua kalimat. Tampil di kartu cerita.",
    story: "Ceritanya", storyHint: "Beberapa paragraf sudah cukup. Pertanyaan yang bisa membantu:",
    prompts: ["Siapa yang merawat kebun, dan sejak kapan?", "Apa yang istimewa dari lahan Anda: tanah, pohon pelindung, cuaca?", "Bagaimana hasil panen diolah, dan kenapa begitu?", "Apa yang sulit sekarang, dan apa harapan Anda?"],
    journey: "Dari kebun ke cangkir (boleh dilewati)", journeyHint: "Satu langkah per baris, mis. \"harvest: kami hanya petik buah merah\". Langkah: farm, harvest, process, dry, sort, roast, brew, market, other.",
    language: "Bahasa cerita", languageHint: "Tulis dengan bahasa yang paling nyaman bagi Anda. Terjemahan bisa ditambahkan nanti.",
    photo: "Foto (boleh dilewati)", photoHint: "Satu foto yang Anda ambil atau boleh dibagikan. Kami perkecil dan hapus data lokasinya sebelum dikirim.", photoCredit: "Siapa yang memotret?",
    sources: "Tautan sumber (boleh dilewati)", sourcesHint: "Untuk fakta sejarah, satu tautan per baris.",
    consent1: "Semua orang yang disebut atau difoto dalam cerita ini setuju ceritanya diterbitkan.", consent2: "Saya setuju cerita dan foto ini diterbitkan dengan lisensi CC BY 4.0, dengan nama saya.",
    review: "Setelah ini: tim kami membaca cerita Anda dan mungkin menghubungi Anda untuk bertanya. Setelah siap, cerita diterbitkan dengan nama Anda. Biasanya beberapa hari.",
    send: "Kirim cerita saya", sendGithub: "Lanjut ke GitHub", sending: "Mengirim…",
    githubNote: "Formulir tanpa akun belum dinyalakan, jadi tombol ini membuka formulir GitHub yang sudah terisi. Anda perlu akun GitHub (gratis) untuk mengirimnya.",
    githubLong: "Cerita Anda panjang, jadi sudah disalin: tempel di kolom \"The story\" di GitHub.",
    thanks: "Terima kasih! Cerita Anda sudah masuk.", thanksBody: "Nomornya #{n}. Tim kami akan membacanya dan menghubungi Anda. Anda bisa mengikutinya di sini:", another: "Bagikan cerita lain",
    offline: "Sedang tidak ada sinyal. Cerita Anda tersimpan di HP ini; coba kirim lagi saat ada sinyal.",
    failed: "Pengiriman gagal. Cerita Anda masih tersimpan di HP ini. Silakan coba lagi sebentar lagi.",
    tooMany: "Terlalu banyak cerita dikirim dari sini dalam waktu singkat. Tunggu semenit lalu coba lagi.",
    fix: "Mohon periksa kolom yang ditandai.", errors: { required: "Mohon diisi.", "too-short": "Tulis sedikit lagi, paling tidak beberapa kalimat.", "too-long": "Terlalu panjang.", invalid: "Mohon diperiksa lagi." },
    left: "sisa {n} huruf",
  },
};

export function sharePage({ lang, prefix, crops, origins, config, esc }) {
  const t = T[lang];
  const countryName = new Intl.DisplayNames([lang], { type: "region" });
  const langName = (c) => { try { return new Intl.DisplayNames([lang], { type: "language" }).of(c); } catch { return c; } };
  const pretty = (x) => { const s = String(x).replace(/-/g, " "); return s[0].toUpperCase() + s.slice(1); };
  const relay = Boolean(config.relay_url);
  const field = (id, label, input, hint = "") => `<div class="f" data-field="${id}"><label for="f-${id}">${esc(label)}</label>${hint ? `<p class="hint" id="h-${id}">${esc(hint)}</p>` : ""}${input}<p class="err" role="alert"></p></div>`;
  const text = (id, attrs = "") => `<input id="f-${id}" name="${id}" maxlength="${MAX[id]}" ${attrs}>`;
  const area = (id, rows, attrs = "") => `<textarea id="f-${id}" name="${id}" rows="${rows}" maxlength="${MAX[id]}" ${attrs}></textarea>`;
  const radios = (id, list, labels, required = true) => `<fieldset class="f choices" data-field="${id}"><legend>${esc(t[id === "told_by" ? "toldBy" : id === "traceability" ? "trace" : id])}</legend>${list.map((v) => `<label class="choice"><input type="radio" name="${id}" value="${v}"${required ? " required" : ""}><span>${esc(labels[v])}</span></label>`).join("")}<p class="err" role="alert"></p></fieldset>`;

  // Data the script needs: per-crop species and processes, origins for the "part of an origin" list, and the strings.
  const data = {
    lang, minStory: MIN_STORY, config: { relay_url: config.relay_url || "", turnstile_site_key: config.turnstile_site_key || "", photos: Boolean(config.photos && relay), contacts: Boolean(config.contacts && relay) },
    crops: Object.fromEntries(CROP_KEYS.map((c) => [c, { species: crops[c].species, processes: crops[c].processes }])),
    origins: origins.map((o) => ({ slug: o.slug, title: o.title, crop: o.crop, country: o.country })),
    t: { next: t.next, back: t.back, send: relay ? t.send : t.sendGithub, sending: t.sending, speciesNone: t.speciesNone, originNone: t.originNone, located: t.located, locateFail: t.locateFail, unlocate: t.unlocate,
      thanks: t.thanks, thanksBody: t.thanksBody, another: t.another, offline: t.offline, failed: t.failed, tooMany: t.tooMany, fix: t.fix, errors: t.errors, left: t.left, githubLong: t.githubLong },
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return `<main><div class="wrap share" lang="${lang}">
  <a class="back" href="${prefix}">← Open Origin</a>
  <h1>${esc(t.title)}</h1>
  <p class="lede">${esc(t.lede)}</p>
  <p class="eyebrow"><a href="${t.otherHref}" hreflang="${lang === "en" ? "id" : "en"}">${esc(t.other)}</a></p>
  <ol class="steps" aria-hidden="true">${t.steps.map((s, i) => `<li data-step="${i}">${esc(s)}</li>`).join("")}</ol>
  <form id="share" novalidate>
    <fieldset class="step" data-step="0"><legend class="step-title">${esc(t.you)}</legend>
      ${field("contributor", t.name, text("contributor", 'autocomplete="name" required'), t.nameHint)}
      ${radios("told_by", TOLD_BY, t.told)}
      ${data.config.contacts ? field("contact", t.contact, `<input id="f-contact" name="contact" maxlength="200" autocomplete="email" inputmode="email">`, t.contactHint) : ""}
      ${field("language", t.language, `<select id="f-language" name="language">${LANGS.map((c) => `<option value="${c}"${c === lang ? " selected" : ""}>${esc(langName(c))}</option>`).join("")}</select>`, t.languageHint)}
    </fieldset>

    <fieldset class="step" data-step="1"><legend class="step-title">${esc(t.steps[1])}</legend>
      <fieldset class="f choices crops" data-field="crop"><legend>${esc(t.crop)}</legend>${CROP_KEYS.map((c) => `<label class="choice"><input type="radio" name="crop" value="${c}" required><span>${esc(t.cropLabel[c])}</span></label>`).join("")}<p class="err" role="alert"></p></fieldset>
      ${radios("kind", KINDS, t.kinds)}
      ${field("producer", t.producer, text("producer", "required"), t.producerHint)}
      ${field("country", t.country, `<select id="f-country" name="country">${COUNTRIES.map((c) => `<option value="${c}"${c === "ID" ? " selected" : ""}>${esc(countryName.of(c))}</option>`).join("")}<option value="">${esc(t.otherCountry)}</option></select><input id="f-country-other" maxlength="2" autocapitalize="characters" placeholder="XX" hidden aria-label="${esc(t.otherCountry)}">`)}
      ${field("region", t.region, text("region"), t.regionHint)}
      ${field("town", t.town, text("town"), t.townHint)}
      <div class="f"><button type="button" class="btn small" id="locate">${esc(t.locate)}</button><p id="where" role="status"></p></div>
      ${field("origin", t.origin, `<select id="f-origin" name="origin"></select>`)}
      ${radios("traceability", TRACEABILITY, t.traces)}
      ${field("species", t.species, `<select id="f-species" name="species"></select>`, t.speciesHint)}
      <details class="more"><summary>${esc(t.more)}</summary>
        ${field("process", t.process, `<div id="f-process" class="checks"></div>`)}
        ${field("varieties", t.varieties, text("varieties"), t.varietiesHint)}
        ${field("altitude", t.altitude, text("altitude", 'inputmode="numeric"'), t.altitudeHint)}
        ${field("harvest", t.harvest, text("harvest"), t.harvestHint)}
        ${field("tasting_notes", t.notes, text("tasting_notes"), t.notesHint)}
      </details>
    </fieldset>

    <fieldset class="step" data-step="2"><legend class="step-title">${esc(t.steps[2])}</legend>
      ${field("title", t.storyTitle, text("title", "required"), t.storyTitleHint)}
      ${field("summary", t.summary, area("summary", 2, "required"), t.summaryHint)}
      <div class="f" data-field="story"><label for="f-story">${esc(t.story)}</label><p class="hint">${esc(t.storyHint)}</p><ul class="prompts">${t.prompts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>${area("story", 12, "required")}<p class="err" role="alert"></p></div>
      ${data.config.photos ? field("photo", t.photo, `<input id="f-photo" type="file" accept="image/*"><img id="photo-preview" alt="" hidden>`, t.photoHint) + field("photo_credit", t.photoCredit, text("photo_credit")) : ""}
      <details class="more"><summary>${esc(t.more)}</summary>
        ${field("journey", t.journey, area("journey", 4), t.journeyHint)}
        ${field("sources", t.sources, area("sources", 3, 'inputmode="url"'), t.sourcesHint)}
      </details>
    </fieldset>

    <fieldset class="step" data-step="3"><legend class="step-title">${esc(t.steps[3])}</legend>
      <fieldset class="f choices" data-field="consent"><legend class="sr">Consent</legend>
        <label class="choice"><input type="checkbox" name="consent1" required><span>${esc(t.consent1)}</span></label>
        <label class="choice"><input type="checkbox" name="consent2" required><span>${esc(t.consent2)}</span></label>
        <p class="err" role="alert"></p></fieldset>
      <p>${esc(t.review)}</p>
      ${relay ? "" : `<p class="hint">${esc(t.githubNote)}</p>`}
      <div class="trap" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div id="turnstile"></div>
    </fieldset>

    <p id="form-msg" role="status"></p>
    <div class="nav"><button type="button" class="btn" id="back">${esc(t.back)}</button><button type="submit" class="btn primary" id="next">${esc(t.next)}</button></div>
    <p class="hint draft">${esc(t.draft)}</p>
  </form>
  <section id="done" hidden></section>
</div></main>
<script type="application/json" id="share-data">${json}</script>
<script src="${prefix}share.js" defer></script>
${config.turnstile_site_key && relay ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>` : ""}`;
}
