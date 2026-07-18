-- Cloudflare D1 schema for the Vantage Solutions contact-discovery database.
-- Apply with:
--   wrangler d1 execute vantagesolutions-contacts --remote --file=./schema.sql   (production)
--   wrangler d1 execute vantagesolutions-contacts --local  --file=./schema.sql   (local dev)
--
-- NOTE: if you already have a live database from the Google Places version of
-- this pipeline (place_id-keyed), running this file alone will NOT migrate it —
-- "CREATE TABLE IF NOT EXISTS" is a no-op against a table that already exists
-- under the old shape. Run migrate_v2_sources.sql once against that database
-- first. A brand new database (never had the old schema) can just use this
-- file as-is.
--
-- If you already applied migrate_v2_sources.sql and are just adding the
-- duplicate-detection column, run migrate_v3_dedup.sql instead — this file's
-- CREATE TABLE is a no-op against a table that already exists.

CREATE TABLE IF NOT EXISTS businesses (
  source_id           TEXT PRIMARY KEY,            -- e.g. "osm:node/123456789" or "directory:<name>:<hash>"
  source               TEXT NOT NULL,                -- 'osm' | 'directory'
  name                TEXT NOT NULL,
  category             TEXT,                          -- from search_queries.py, e.g. "Dental"
  search_query        TEXT,                          -- human-readable description of the query that found it
  country              TEXT,                          -- ISO 3166-1 alpha-2, from the query's allow-listed country
  address              TEXT,
  phone                TEXT,
  website              TEXT,
  website_key          TEXT,                          -- normalized hostname (see db.ts) — used only to catch the same business showing up under two different source_ids, never shown in the UI
  emails                TEXT NOT NULL DEFAULT '[]',     -- JSON-encoded array of strings
  contact_page_url     TEXT,                          -- which page on the site the emails came from
  site_reachable       INTEGER,                       -- 0 / 1 / NULL (not yet checked)
  site_status_code    INTEGER,
  status                TEXT NOT NULL DEFAULT 'new',    -- 'new' | 'excluded' — set by the admin panel, never overwritten by ingest
  discovered_at         TEXT NOT NULL,                 -- ISO timestamp, set on first insert
  last_scraped_at     TEXT                           -- ISO timestamp, updated every ingest pass
);

CREATE INDEX IF NOT EXISTS idx_businesses_status      ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_category    ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_name        ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_source      ON businesses(source);
CREATE INDEX IF NOT EXISTS idx_businesses_country     ON businesses(country);
CREATE INDEX IF NOT EXISTS idx_businesses_website_key ON businesses(website_key);

-- No row-count cap lives in the schema — MAX_BUSINESSES in src/lib/server/db.ts
-- enforces it in code, checked against a plain COUNT(*) on this table.
