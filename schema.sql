-- Cloudflare D1 schema for the Vantage Solutions contact-discovery database.
-- Apply with:
--   wrangler d1 execute vantage-contacts --remote --file=./schema.sql   (production)
--   wrangler d1 execute vantage-contacts --local  --file=./schema.sql   (local dev)

CREATE TABLE IF NOT EXISTS businesses (
  place_id            TEXT PRIMARY KEY,        -- Google Places id, e.g. "ChIJ..."
  name                TEXT NOT NULL,
  category            TEXT,                     -- from search_queries.py, e.g. "Dental"
  search_query        TEXT,                     -- the query that discovered it, e.g. "dentists in London"
  address             TEXT,
  phone               TEXT,
  website             TEXT,
  rating              REAL,
  user_rating_count   INTEGER,
  emails              TEXT NOT NULL DEFAULT '[]',  -- JSON-encoded array of strings
  contact_page_url    TEXT,                     -- which page on the site the emails came from
  site_reachable      INTEGER,                  -- 0 / 1 / NULL (not yet checked)
  site_status_code    INTEGER,
  status              TEXT NOT NULL DEFAULT 'new',  -- 'new' | 'excluded' — set by the admin panel, never overwritten by ingest
  discovered_at       TEXT NOT NULL,            -- ISO timestamp, set on first insert
  last_scraped_at     TEXT                      -- ISO timestamp, updated every ingest pass
);

CREATE INDEX IF NOT EXISTS idx_businesses_status   ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_name     ON businesses(name);
