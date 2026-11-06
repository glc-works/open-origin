# Story relay (no GitHub account needed)

The story form at [/share/](https://glc-works.github.io/open-origin/share/) ([Bahasa Indonesia](https://glc-works.github.io/open-origin/id/share/)) is made for phones. Until this relay is running, its last button opens the GitHub issue form already filled in, so senders still need a GitHub account. With the relay running, anyone can send a story without an account.

The relay is a small [Cloudflare Worker](https://developers.cloudflare.com/workers/) (free plan is enough). It checks the fields with `scripts/story-form.ts` and opens the same "Share a story" issue the GitHub form makes, labelled `story` and `web-form`. Review does not change: a maintainer reads it, talks with the storyteller, and adds `approved`, which opens a pull request.

## What it keeps, and where

| What | Where | Public? |
|---|---|---|
| The story, name to credit, region, town | The GitHub issue | Yes, like any issue |
| Location, if the sender shares it | The issue, rounded to 2 decimals (about 1 km) in the browser and again in the Worker | Yes |
| Photo | R2 bucket `open-origin-photos`, linked from the issue. Shrunk to 1600 px in the browser; redrawing it also removes GPS and camera data | Yes |
| WhatsApp or email for the review | KV namespace `CONTACTS`, key `issue:<number>`, deleted after 180 days | No. Read it with `npx wrangler kv key get --binding CONTACTS issue:<number>` |

## Set it up (once)

1. **GitHub token.** Create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) (or a GitHub App) with access to `glc-works/open-origin` only and the single permission **Issues: Read and write**. It cannot touch code.
2. **Cloudflare.** In this folder:
   ```sh
   npx wrangler login
   npx wrangler r2 bucket create open-origin-photos     # then turn on Public access in the dashboard and copy its URL
   npx wrangler kv namespace create CONTACTS            # paste the id into wrangler.toml
   npx wrangler secret put GITHUB_TOKEN
   ```
   Put the bucket's public URL in `PHOTO_BASE_URL` in `wrangler.toml`.
3. **Spam protection (recommended).** Create a [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) widget for `glc-works.github.io`, then `npx wrangler secret put TURNSTILE_SECRET` with its secret key. The Worker also has a hidden trap field and allows 5 stories per minute per address.
4. **Deploy:** `npx wrangler deploy`. It prints the Worker's address.
5. **Switch the form on.** In `relay/public-config.json` set `relay_url` to that address, `turnstile_site_key` to the widget's site key, and `photos` and `contacts` to `true`. Merge; the site rebuilds.

To switch the relay off, empty `relay_url`: the form goes back to the GitHub issue form.

## Test

`npm test` runs the Worker with GitHub replaced by a stub: it checks the issue it writes, that the contact stays out of it, that other sites cannot post, and that the story it writes passes `npm run validate`.
