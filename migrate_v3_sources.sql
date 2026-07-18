-- One-time migration: adds the website_key column used for cross-source
-- duplicate detection (see normalizeWebsiteKey() in src/lib/server/db.ts).
-- Only needed if your live database was created before this column existed —
-- i.e. you already ran migrate_v2_sources.sql at some point. A brand new
-- database doesn't need this file; schema.sql already has the column.
--
-- Run with:
--   wrangler d1 execute vantagesolutions-contacts --remote --file=./migrate_v3_dedup.sql
--
-- Not safe to run twice — ADD COLUMN errors if website_key already exists.
-- If that happens, this migration already applied; there's nothing more to do.

ALTER TABLE businesses ADD COLUMN website_key TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_website_key ON businesses(website_key);

-- Best-effort backfill for existing rows, so old data can be matched against
-- right away instead of waiting for its next re-crawl. This is a rough SQL
-- approximation (strip protocol/www, lowercase) — not as precise as the real
-- URL-parsing normalization the app uses for every new or re-crawled row
-- going forward. Good enough for dedup matching; nothing user-facing reads
-- this column directly.
UPDATE businesses
SET website_key = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(TRIM(website), 'https://', ''),
        'http://', ''
      ),
      'www.', ''
    ),
    '/', ''
  )
)
WHERE website IS NOT NULL AND TRIM(website) != '';
