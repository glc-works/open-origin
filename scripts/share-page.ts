// The /share/ page: a story form made for a phone, built once per site language (/share/, /id/share/).
// Its words are under `share` in scripts/i18n.ts.
// It needs no GitHub account when the relay in relay/ is running (relay/public-config.json says where it is);
// until then it fills in the GitHub issue form instead. The form logic is in site/share.js.
import { CROP_KEYS, KINDS, TRACEABILITY, TOLD_BY, MAX, MIN_STORY } from "./story-form.ts";

// Countries listed first; any other two-letter code can be typed under "Other".
const COUNTRIES = ["ID", "TL", "PG", "MY", "PH", "VN", "LA", "TH", "MM", "IN", "LK", "CN", "TW", "JP", "YE", "ET", "KE", "UG", "RW", "BI", "TZ", "CD", "CM", "CI", "GH", "NG", "MG", "BR", "CO", "PE", "EC", "BO", "HN", "GT", "SV", "NI", "CR", "PA", "MX", "US"];
const LANGS = ["id", "en", "jv", "su", "min", "bug", "ban", "ms", "tet", "es", "pt", "fr", "am", "sw", "vi", "th", "zh", "ja", "ar", "hi"];

// t: the `share` words of the page language; root: the way back to the site root, where share.js lives.
export function sharePage({ t, lang, prefix, root, crops, origins, config, esc }) {
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
    origins: origins.map((o) => ({ id: o.id, title: o.title, crop: o.crop, country: o.country })),
    t: { next: t.next, back: t.back, send: relay ? t.send : t.sendGithub, sending: t.sending, speciesNone: t.speciesNone, originNone: t.originNone, located: t.located, locateFail: t.locateFail, unlocate: t.unlocate,
      thanks: t.thanks, thanksBody: t.thanksBody, another: t.another, offline: t.offline, failed: t.failed, tooMany: t.tooMany, fix: t.fix, errors: t.errors, left: t.left, githubLong: t.githubLong },
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return `<main><div class="wrap share" lang="${lang}">
  <a class="back" href="${prefix}">← Open Origin</a>
  <h1>${esc(t.title)}</h1>
  <p class="lede">${esc(t.lede)}</p>
  <ol class="progress" aria-hidden="true">${t.steps.map((s, i) => `<li data-step="${i}">${esc(s)}</li>`).join("")}</ol>
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
<script src="${root}share.js" defer></script>
${config.turnstile_site_key && relay ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>` : ""}`;
}
