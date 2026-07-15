# Vantage Solutions — Contact Discovery

Part of the vantagesolutions SvelteKit app — same deploy, same Pages project, same domain. Not a
separate Worker, not a separate repo.

```
vantagesolutions/
├── src/
│   ├── app.d.ts                     ← NEW — types the D1 + env bindings
│   ├── lib/
│   │   ├── server/                  ← NEW — db.ts, auth.ts, csv.ts (D1 queries, sessions)
│   │   └── types/business.ts        ← NEW
│   └── routes/
│       ├── api/                     ← NEW — ingest, login, logout, businesses (list/status/export)
│       └── access/master/           ← NEW — the admin panel page
├── schema.sql                       ← D1 schema
├── scripts/                         ← the Python scraper
└── .github/workflows/
    ├── deploy.yml                   ← EXISTING, one new step added (applies schema.sql)
    └── scrape-contacts.yml          ← NEW — cron, every 6h
```

Confirmed by actually building this repo: `npm run build` succeeds, `svelte-check` reports 0
errors, and every new route compiles into the same `.svelte-kit/output` that `deploy.yml` already
uploads via `cloudflare/pages-action`. One deployment, one project.

## 1. Create the D1 database and bind it (Cloudflare dashboard, one time)

This part can't happen through GitHub — Cloudflare Pages bindings are dashboard-only, there's no
way around that regardless of deploy mechanism.

1. Cloudflare dashboard → **Workers & Pages → D1** → **Create database** → name it
   `vantagesolutions-contacts` → Create.
2. Cloudflare dashboard → **Workers & Pages → vantage-solutions** (your existing Pages project) →
   **Settings → Functions → D1 database bindings** → Add binding:
   - Variable name: `DB`
   - Database: `vantagesolutions-contacts`

That's the binding done — `event.platform.env.DB` now works in every route, in every future
deploy, automatically.

## 2. Add the four contacts secrets (same Settings page)

Same Pages project → **Settings → Environment variables** → add these four, each marked
**Encrypt**:

| Variable | Value |
|---|---|
| `INGEST_SECRET` | any long random string you make up |
| `ADMIN_USERNAME` | your admin panel login |
| `ADMIN_PASSWORD` | your admin panel login |
| `SESSION_SECRET` | another random string |

`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` should already exist as **GitHub** repo secrets
— `deploy.yml` has needed them since before any of this. Nothing to do there unless they're
missing, in which case: Cloudflare dashboard → profile → API Tokens → Create Token → "Edit
Cloudflare Workers" template, and account ID is on the dashboard's right sidebar.

## 3. Google Places API (New)

Unchanged from before:

1. https://console.cloud.google.com → enable **"Places API (New)"** (the legacy one can't be
   enabled on new projects anymore).
2. Create an API key, restrict it to Places API (New).
3. Set up billing — `websiteUri`/`phone`/`rating` fields put each call in the Enterprise SKU
   pricing tier. Keep `scripts/search_queries.py` short at first.

## 4. GitHub repo secrets for the scraper

**Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `INGEST_URL` | `https://vantage-solutions.pages.dev/api/ingest` (or your custom domain) |
| `INGEST_SECRET` | the exact same value you set in Cloudflare step 2 |
| `GOOGLE_PLACES_API_KEY` | from step 3 |

## 5. Deploy

**Actions → Deploy to Cloudflare Pages → Run workflow.** (It's manual — no auto-deploy on push,
that's how this repo already worked before any of this.) This applies the schema and deploys the
site in one run.

## 6. Check it

- Admin panel: `https://vantage-solutions.pages.dev/access/master`
- Turn on the scraper: **Actions → Scrape and Ingest Business Contacts → Run workflow** (or just
  wait — it's already on a 6-hour cron).

## Day to day

- **Push code** → run **Deploy to Cloudflare Pages** manually when you want it live, same as
  always.
- **Add a search query** → edit `scripts/search_queries.py`, commit. Next scrape run picks it up.
- **Prune a business** → Exclude button in the admin panel, no deploy needed.
- **Rotate a secret** → update it in the Pages project's Environment variables — takes effect on
  the next deploy.

## Before emailing anyone on this list

Same as last time, still true: this only pulls contact info a business already published on its
own site. CAN-SPAM needs a real physical address + working unsubscribe in every message (US);
GDPR treats a named business email as personal data, worth checking current guidance for anything
at real volume (EU/UK). Not legal advice.
