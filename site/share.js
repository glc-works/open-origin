// The /share/ story form: one step at a time, a draft kept on the phone, and a send that goes to the
// relay (no account needed) or, while there is none, to the GitHub issue form filled in. Built by scripts/share-page.mjs.
(() => {
  const D = JSON.parse(document.getElementById("share-data").textContent);
  const T = D.t;
  const form = document.getElementById("share");
  const steps = [...form.querySelectorAll("fieldset.step")];
  const marks = [...document.querySelectorAll(".progress li")];
  const back = document.getElementById("back");
  const next = document.getElementById("next");
  const msg = document.getElementById("form-msg");
  const $ = (id) => document.getElementById(id);
  const KEY = "open-origin-share-draft";
  const REPO = "https://github.com/glc-works/open-origin";
  const MAX_PHOTO = 1_400_000;
  let step = 0;
  let coords = null;
  let photo = null; // base64 JPEG, already shrunk

  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} },
    clear() { try { localStorage.removeItem(KEY); } catch {} },
  };

  // Per-crop lists: species, processes and the origins already on the site.
  function fillCrop() {
    const crop = form.crop.value;
    const info = D.crops[crop];
    const sp = $("f-species");
    const keep = sp.value;
    sp.innerHTML = `<option value="">${T.speciesNone}</option>` + (info ? info.species.map((s) => `<option value="${s}">${pretty(s)}</option>`).join("") : "");
    sp.value = keep;
    const pr = $("f-process");
    const ticked = new Set([...pr.querySelectorAll("input:checked")].map((i) => i.value));
    pr.innerHTML = info ? info.processes.map((p) => `<label class="choice"><input type="checkbox" name="process" value="${p}"${ticked.has(p) ? " checked" : ""}><span>${pretty(p)}</span></label>`).join("") : "";
    const og = $("f-origin");
    const keepO = og.value;
    const list = D.origins.filter((o) => o.crop === crop && o.country === country());
    og.innerHTML = `<option value="">${T.originNone}</option>` + list.map((o) => `<option value="${o.slug}">${escapeHtml(o.title)}</option>`).join("");
    og.value = keepO;
    og.closest(".f").hidden = list.length === 0;
  }
  const pretty = (x) => { const s = String(x).replace(/-/g, " "); return s[0].toUpperCase() + s.slice(1); };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const country = () => (form.country.value || $("f-country-other").value).trim().toUpperCase();

  // Tasting notes: the ticked words, then any typed under "Other". All are kept (also in the draft);
  // more than D.maxTastes is shown as an error on the step instead of being cut.
  const typedTastes = () => ($("f-tasting_other").value || "").split(",").map((s) => s.trim()).filter(Boolean);
  function syncTastes(e) {
    // A typed word that repeats a ticked one counts once, here and in the limit below.
    const words = () => [...new Set([...form.querySelectorAll('input[name="taste"]:checked')].map((i) => i.value).concat(typedTastes()))];
    if (e && e.target.name === "taste" && e.target.checked && words().length > D.maxTastes) e.target.checked = false;
    const all = words();
    $("f-tasting_notes").value = all.join(", ");
    return all.length;
  }
  form.addEventListener("change", (e) => { if (e.target.name === "taste" || e.target.name === "tasting_other") syncTastes(e); });

  function collect() {
    syncTastes();
    const v = (n) => (form.elements[n] && form.elements[n].value ? form.elements[n].value.trim() : "");
    const fields = {};
    for (const n of ["contributor", "told_by", "language", "crop", "kind", "producer", "region", "town", "origin", "traceability", "species", "varieties", "altitude", "harvest", "tasting_notes", "title", "summary", "story", "journey", "sources", "photo_credit"]) {
      const x = n === "told_by" || n === "crop" || n === "kind" || n === "traceability" ? (form.querySelector(`input[name="${n}"]:checked`) || {}).value || "" : v(n);
      if (x) fields[n] = x;
    }
    fields.country = country();
    const proc = [...form.querySelectorAll('input[name="process"]:checked')].map((i) => i.value);
    if (proc.length) fields.process = proc.join(", ");
    return { fields, coords, consent: [form.consent1.checked, form.consent2.checked], contact: v("contact"), website: v("website") };
  }

  function save() {
    const c = collect();
    // The "Other" box is kept as typed, so a word that also has a ticked box survives unticking it after a reload.
    store.set({ ...c.fields, process: c.fields.process, tasting_ticked: [...form.querySelectorAll('input[name="taste"]:checked')].map((i) => i.value), tasting_other: $("f-tasting_other").value, coords, consent: undefined, contact: c.contact, step });
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    const d = store.get() || {};
    for (const n of ["crop", "kind", "country", "origin", "region"]) if (params.get(n)) d[n] = params.get(n);
    for (const [k, val] of Object.entries(d)) {
      if (val === undefined || val === null || k === "process" || k === "step" || k === "coords") continue;
      if (k === "tasting_notes") {
        // Newer drafts keep the ticked boxes and the "Other" text apart; older ones only have the combined list.
        const split = Array.isArray(d.tasting_ticked) && typeof d.tasting_other === "string";
        const other = [];
        for (const w of split ? d.tasting_ticked : String(val).split(",").map((s) => s.trim()).filter(Boolean)) {
          const box = form.querySelector(`input[name="taste"][value="${CSS.escape(w)}"]`);
          if (box) { box.checked = true; box.closest("details").open = true; } else other.push(w);
        }
        $("f-tasting_other").value = typeof d.tasting_other === "string" ? d.tasting_other : other.join(", ");
        continue;
      }
      if (k === "tasting_other" || k === "tasting_ticked") continue;
      const radio = form.querySelector(`input[type=radio][name="${k}"][value="${CSS.escape(String(val))}"]`);
      if (radio) { radio.checked = true; continue; }
      if (k === "country") {
        if ([...form.country.options].some((o) => o.value === val)) form.country.value = val;
        else { form.country.value = ""; $("f-country-other").hidden = false; $("f-country-other").value = val; }
        continue;
      }
      if (form.elements[k] && form.elements[k].tagName !== "FIELDSET") form.elements[k].value = val;
    }
    fillCrop();
    if (d.origin) $("f-origin").value = d.origin;
    if (d.species) $("f-species").value = d.species;
    if (d.process) for (const p of String(d.process).split(/,\s*/)) { const i = form.querySelector(`input[name="process"][value="${CSS.escape(p)}"]`); if (i) i.checked = true; }
    if (Array.isArray(d.coords)) showWhere(d.coords);
    for (const el of form.querySelectorAll("textarea, input[maxlength]")) counter(el);
    syncTastes();
  }

  // Each step checks only its own fields; the relay checks everything again.
  const REQUIRED = { 0: ["contributor", "told_by"], 1: ["crop", "kind", "producer", "country", "traceability", "region", "species", "tasting_notes"], 2: ["title", "summary", "story"], 3: ["consent"] };
  function check(i) {
    const c = collect();
    const f = c.fields;
    let first = null;
    for (const n of REQUIRED[i]) {
      let err = "";
      if (n === "consent") err = c.consent.every(Boolean) ? "" : T.errors.required;
      else if (n === "country") err = /^[A-Z]{2}$/.test(f.country) ? "" : f.country ? T.errors.invalid : T.errors.required;
      else if (n === "region") err = f.region || ["country", "blend"].includes(f.traceability) ? "" : T.errors.required;
      else if (n === "species") err = f.species || f.kind !== "farm" ? "" : T.errors.required;
      else if (n === "story" && f.story && f.story.length < D.minStory) err = T.errors["too-short"];
      else if (n === "tasting_notes") {
        err = syncTastes() > D.maxTastes ? T.errors["too-many-tastes"] : "";
        if (err) form.querySelector('[data-field="tasting_notes"]').closest("details").open = true;
      }
      else err = f[n] ? "" : T.errors.required;
      mark(n, err);
      if (err && !first) first = n;
    }
    if (first) focusField(first);
    return !first;
  }
  function mark(name, text) {
    const box = form.querySelector(`[data-field="${name}"]`);
    if (!box) return;
    box.classList.toggle("bad", Boolean(text));
    const e = box.querySelector(".err");
    if (e) e.textContent = text;
  }
  function focusField(name) {
    const box = form.querySelector(`[data-field="${name}"]`);
    if (!box) return;
    const s = steps.indexOf(box.closest("fieldset.step"));
    if (s !== step) show(s);
    const d = box.closest("details"); if (d) d.open = true;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = box.querySelector("input, select, textarea");
    if (input) input.focus({ preventScroll: true });
  }

  function show(i) {
    step = i;
    steps.forEach((s, k) => { s.hidden = k !== i; });
    marks.forEach((m, k) => { m.classList.toggle("now", k === i); m.classList.toggle("done", k < i); });
    back.hidden = i === 0;
    next.textContent = i === steps.length - 1 ? T.send : T.next;
    msg.textContent = "";
    if (i === steps.length - 1) turnstile();
  }

  let widget = null;
  function turnstile() {
    if (!D.config.turnstile_site_key || widget !== null || !window.turnstile) return;
    widget = window.turnstile.render("#turnstile", { sitekey: D.config.turnstile_site_key, language: D.lang });
  }

  async function send() {
    const c = collect();
    if (!navigator.onLine) { msg.textContent = T.offline; return; }
    if (!D.config.relay_url) return toGithub(c);
    next.disabled = true; next.textContent = T.sending; msg.textContent = "";
    try {
      const body = { ...c, turnstile: widget !== null && window.turnstile ? window.turnstile.getResponse(widget) : "" };
      if (photo) body.photo_jpeg = photo;
      if (!D.config.contacts) delete body.contact;
      const res = await fetch(D.config.relay_url.replace(/\/+$/, "") + "/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) return done(out);
      if (res.status === 429) msg.textContent = T.tooMany;
      else if (out.error === "fields" && out.fields) {
        for (const f of out.fields) mark(f.field, T.errors[f.code] || T.errors.invalid);
        msg.textContent = T.fix;
        focusField(out.fields[0].field);
      } else msg.textContent = T.failed;
      if (widget !== null && window.turnstile) window.turnstile.reset(widget);
    } catch { msg.textContent = navigator.onLine ? T.failed : T.offline; }
    next.disabled = false; next.textContent = T.send;
  }

  function done(out) {
    store.clear();
    form.hidden = true;
    document.querySelector(".progress").hidden = true;
    const box = $("done");
    box.hidden = false;
    box.innerHTML = `<h2>${escapeHtml(T.thanks)}</h2><p>${escapeHtml(T.thanksBody.replace("{n}", out.number))}</p>`
      + (out.url ? `<p><a href="${escapeHtml(out.url)}">${escapeHtml(out.url)}</a></p>` : "")
      + `<p><a class="btn" href="${location.pathname}">${escapeHtml(T.another)}</a></p>`;
    box.scrollIntoView({ behavior: "smooth" });
  }

  // No relay yet: open the GitHub issue form with the same fields filled in (field ids match story.yml).
  async function toGithub(c) {
    const f = c.fields;
    const p = new URLSearchParams({ template: "story.yml", title: `[Story] ${f.title || ""}` });
    const add = (k, v) => { if (v) p.set(k, v); };
    for (const k of ["kind", "crop", "title", "country", "traceability", "region", "origin", "producer", "species", "altitude", "varieties", "process", "harvest", "tasting_notes", "town", "summary", "journey", "told_by", "language", "sources", "photo_credit"]) add(k, f[k]);
    const credit = f.contributor ? `\n\n(${f.contributor})` : "";
    add("story", (f.story || "") + credit);
    let url = `${REPO}/issues/new?${p}`;
    if (url.length > 7000) {
      p.delete("story");
      url = `${REPO}/issues/new?${p}`;
      try { await navigator.clipboard.writeText((f.story || "") + credit); } catch {}
      msg.textContent = T.githubLong;
    }
    window.open(url, "_blank", "noopener");
  }

  // Location: rounded to 2 decimals (about 1 km) here, before it is kept or sent.
  function showWhere(c) {
    coords = c;
    const w = $("where");
    w.innerHTML = c ? `${escapeHtml(T.located)} <b>${c[0].toFixed(2)}, ${c[1].toFixed(2)}</b> <button type="button" class="linkish" id="unlocate">${escapeHtml(T.unlocate)}</button>` : "";
    if (c) $("unlocate").onclick = () => { showWhere(null); save(); };
  }
  $("locate").addEventListener("click", () => {
    if (!navigator.geolocation) { $("where").textContent = T.locateFail; return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { showWhere([Math.round(pos.coords.latitude * 100) / 100, Math.round(pos.coords.longitude * 100) / 100]); save(); },
      () => { $("where").textContent = T.locateFail; },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  });

  // Photo: drawn again at most 1600 px wide as a JPEG, which also drops the camera's GPS and other data.
  const photoInput = $("f-photo");
  if (photoInput) photoInput.addEventListener("change", async () => {
    photo = null;
    const file = photoInput.files[0];
    const preview = $("photo-preview");
    preview.hidden = true;
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      let side = 1600, q = 0.82, data = "";
      for (let tries = 0; tries < 6; tries++) {
        const scale = Math.min(1, side / Math.max(bmp.width, bmp.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(bmp.width * scale); cv.height = Math.round(bmp.height * scale);
        cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
        data = cv.toDataURL("image/jpeg", q);
        if (data.length * 0.75 < MAX_PHOTO) break;
        side = Math.round(side * 0.8); q = Math.max(0.6, q - 0.06);
      }
      photo = data.split(",")[1];
      preview.src = data; preview.hidden = false;
    } catch { mark("photo", T.errors.invalid); }
  });

  // Characters left, for fields with a limit people can reach.
  function counter(el) {
    if (!["summary", "title"].includes(el.name)) return;
    let c = el.parentNode.querySelector(".count");
    if (!c) { c = document.createElement("p"); c.className = "hint count"; el.after(c); }
    c.textContent = T.left.replace("{n}", el.maxLength - [...el.value].length);
  }

  form.country.addEventListener("change", () => { $("f-country-other").hidden = form.country.value !== ""; fillCrop(); });
  $("f-country-other").addEventListener("input", fillCrop);
  form.addEventListener("change", (e) => { if (e.target.name === "crop") fillCrop(); mark(e.target.name, ""); save(); });
  form.addEventListener("input", (e) => { counter(e.target); if (e.target.closest(".bad")) mark(e.target.closest("[data-field]")?.dataset.field, ""); save(); });
  back.addEventListener("click", () => { show(Math.max(0, step - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!check(step)) return;
    if (step < steps.length - 1) { show(step + 1); save(); form.scrollIntoView({ behavior: "smooth" }); }
    else send();
  });

  restore();
  const saved = store.get();
  show(saved && Number.isInteger(saved.step) && !new URLSearchParams(location.search).has("crop") ? Math.min(saved.step, steps.length - 1) : 0);
})();
