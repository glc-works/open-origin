// Web form relay: lets someone share a story from a phone without a GitHub account.
// The form on /share/ posts here; this Worker checks the fields and opens the same "Share a story" issue
// the GitHub form would, labelled story + web-form. From there the review is unchanged: a maintainer reads it
// with the storyteller and adds "approved", which turns it into a pull request.
//
// Secrets (wrangler secret put): GITHUB_TOKEN (fine-grained, this repo only, Issues: read and write),
// TURNSTILE_SECRET (optional, Cloudflare Turnstile). Bindings, all optional: PHOTOS (R2 bucket), CONTACTS (KV),
// LIMITER (rate limit). Setup steps: relay/README.md.
import { checkSubmission, issueBody } from "../scripts/story-form.ts";

const MAX_BODY = 3_000_000; // bytes of JSON, photo included
const MAX_PHOTO = 1_500_000; // bytes after the browser has shrunk it

export default {
  async fetch(request: Request, env: Record<string, any>): Promise<Response> {
    const origin = request.headers.get("Origin") || "";
    const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const cors = allowed.includes(origin) ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {};
    const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors } });
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } });
    if (request.method === "GET" && url.pathname === "/") return reply(200, { ok: true, service: "open-origin story relay" });
    if (request.method !== "POST" || url.pathname !== "/submit") return reply(404, { ok: false, error: "not-found" });
    if (!cors["Access-Control-Allow-Origin"]) return reply(403, { ok: false, error: "origin" });

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: ip });
      if (!success) return reply(429, { ok: false, error: "rate-limit" });
    }
    if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY) return reply(413, { ok: false, error: "too-large" });
    let body: Record<string, any>;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY) return reply(413, { ok: false, error: "too-large" });
      body = JSON.parse(text);
    } catch { return reply(400, { ok: false, error: "bad-json" }); }

    // A field people cannot see: only bots fill it in. Answer as if it worked, so they learn nothing.
    if (body.website) return reply(200, { ok: true });

    if (env.TURNSTILE_SECRET) {
      const form = new FormData();
      form.append("secret", env.TURNSTILE_SECRET);
      form.append("response", String(body.turnstile || ""));
      form.append("remoteip", ip);
      const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form }).then((r) => r.json()).catch(() => ({}));
      if (!check.success) return reply(400, { ok: false, error: "turnstile" });
    }

    const fields = { ...(body.fields || {}) };
    delete fields.photo; // only this Worker sets the photo link
    const checked = checkSubmission({ ...fields, coords: body.coords, consent: body.consent });
    if (checked.errors) return reply(422, { ok: false, error: "fields", fields: checked.errors });
    const data = checked.data;

    if (body.photo_jpeg && env.PHOTOS && env.PHOTO_BASE_URL) {
      let bytes: Uint8Array;
      try { bytes = Uint8Array.from(atob(String(body.photo_jpeg)), (c) => c.charCodeAt(0)); }
      catch { return reply(400, { ok: false, error: "photo" }); }
      // The browser redraws the photo as a JPEG, which also drops its GPS and camera data. Accept nothing else.
      if (bytes.length > MAX_PHOTO || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return reply(400, { ok: false, error: "photo" });
      const key = `inbox/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.jpg`;
      await env.PHOTOS.put(key, bytes, { httpMetadata: { contentType: "image/jpeg" } });
      data.photo = `${String(env.PHOTO_BASE_URL).replace(/\/+$/, "")}/${key}`;
    }

    const res = await fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "open-origin-story-relay", "Content-Type": "application/json" },
      body: JSON.stringify({ title: `[Story] ${data.title}`, body: issueBody(data), labels: ["story", "web-form"] }),
    });
    if (!res.ok) {
      console.error("GitHub said", res.status, await res.text());
      return reply(502, { ok: false, error: "github" });
    }
    const issue = await res.json();

    // A way to reach the storyteller during review. It never goes into the public issue; it expires after 180 days.
    const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 200) : "";
    let contactSaved = false;
    if (contact && env.CONTACTS) {
      await env.CONTACTS.put(`issue:${issue.number}`, JSON.stringify({ contact, name: data.contributor, at: new Date().toISOString() }), { expirationTtl: 180 * 24 * 3600 });
      contactSaved = true;
    }
    return reply(201, { ok: true, number: issue.number, url: issue.html_url, contact_saved: contactSaved });
  },
};
