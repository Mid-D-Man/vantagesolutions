# Vantage Solutions — Contact Discovery Pipeline

Three pieces, one repo:

- **`src/`** — a Cloudflare Worker + D1 database: ingest endpoint, paginated business API, and the `/access/master` admin panel.
- **`scripts/`** — the Python scraper: discovers businesses via Google Places, checks each new one's own site for a published contact email.
- **`.github/workflows/`** — the cron job that runs the scraper every 6 hours.

Suggested repo layout (this is all one project):

```
vantage-contacts/
├── wrangler.jsonc
├── package.json
├── tsconfig.json
├── schema.sql
├── src/
│   ├── index.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── csv.ts
│   ├── admin-ui.ts
│   └── types.ts
├── scripts/
│   ├── search_queries.py
│   └── scrape_contacts.py
└── .github/workflows/
    └── scrape-contacts.yml
```

## 1. Google Cloud — enable Places API (New)

The **legacy** Places API can no longer be enabled on new Google Cloud projects — this scraper is
built against **Places API (New)**, which is the current version.

1. Create/select a project at https://console.cloud.google.com
2. Enable **"Places API (New)"** specifically (not "Places API" — that's the legacy one).
3. Create an API key, then restrict it: API restrictions → **Places API (New)** only.
4. Set up billing. Text Search itself has a free monthly allotment, but requesting
   `websiteUri` / `internationalPhoneNumber` / `rating` puts each call in the Enterprise SKU
   tier — check current pricing at https://developers.google.com/maps/billing-and-pricing/pricing
   before turning on a lot of queries. Keep `search_queries.py` short at first and watch usage.

## 2. Cloudflare — Worker + D1

```bash
npm install
npx wrangler login

# Create the database, then paste the returned database_id into wrangler.jsonc
npx wrangler d1 create vantage-contacts

# Apply the schema
npm run db:migrate

# Set secrets (you'll be prompted for each value)
npx wrangler secret put INGEST_SECRET     # any long random string — the scraper's bearer token
npx wrangler secret put ADMIN_USERNAME    # your admin login
npx wrangler secret put ADMIN_PASSWORD    # your admin login
npx wrangler secret put SESSION_SECRET    # random string, e.g. `openssl rand -hex 32`

# Deploy
npm run deploy
```

Wrangler prints your Worker's URL after deploy — something like
`https://vantage-contacts.<your-subdomain>.workers.dev`. That's your `INGEST_URL` base.

### Reaching `/access/master`

- **Simplest:** just use the Worker's own URL — `https://vantage-contacts.<your-subdomain>.workers.dev/access/master`
- **On your actual domain** (`vantagesolutions.com/access/master`): this needs `vantagesolutions.com`
  added to Cloudflare as a real DNS zone (not just a `*.pages.dev` site). If it already is, add a
  **Workers Route** in the dashboard — Workers & Pages → your Worker → Settings → Triggers → Routes
  — pattern `vantagesolutions.com/access/master*`. If the domain isn't on Cloudflare DNS, the
  `*.workers.dev` URL is the option until it is.

## 3. GitHub — repo secrets + enable the workflow

In the repo's Settings → Secrets and variables → Actions, add:

| Secret | Value |
|---|---|
| `INGEST_URL` | `https://vantage-contacts.<your-subdomain>.workers.dev/api/ingest` |
| `INGEST_SECRET` | same value you set with `wrangler secret put INGEST_SECRET` |
| `GOOGLE_PLACES_API_KEY` | the key from step 1 |

Push the repo, then trigger a first run manually from the Actions tab (`workflow_dispatch`) rather
than waiting for the cron — that way you see output immediately and can sanity-check the data
before it's running unattended every 6 hours.

## Day to day

- **Add a search query:** edit `scripts/search_queries.py`, push. Next run picks it up.
- **Prune a business:** click "Exclude" in the admin panel. It won't reappear even if the same
  Places search finds it again later — ingest never overwrites `status`.
- **Add a category later:** same pattern — a category here is really just the `category` string
  on a search query, so it's a config change, not a schema change.

## Before you actually email anyone on this list

This pulls contact info a business already chose to publish on its own site — it doesn't scrape
personal social profiles or anything not meant to be found. Still, worth having in place before
sending anything:

- **US:** CAN-SPAM requires a real physical address and a working unsubscribe/opt-out in every
  message.
- **EU/UK:** GDPR treats a named business email (`jane@company.com`) as personal data. B2B cold
  email has a plausible "legitimate interest" basis in some cases, but it's worth a quick read of
  current guidance (or a lawyer, for anything at real volume) rather than assuming — this isn't
  legal advice.
- **General:** the `status = 'excluded'` list doubles as a do-not-contact list. If anyone replies
  asking to be left alone, exclude them there, not just in whatever email tool sends the actual
  messages.
