-- One-time migration: run this ONCE against the existing live database before
-- deploying the new scraper/ingest code — only needed if that database was
-- created by the Google Places version of this pipeline (place_id-keyed). A
-- brand new database doesn't need this — just apply schema.sql directly.
--
-- Run with:
--   wrangler d1 execute vantagesolutions-contacts --remote --file=./migrate_v2_sources.sql
--
-- Not safe to run twice — the RENAME COLUMN step will error on a second run
-- because place_id will no longer exist. If that happens, the migration
-- already applied; there's nothing more to do.

ALTER TABLE businesses RENAME COLUMN place_id TO source_id;
ALTER TABLE businesses ADD COLUMN source  TEXT NOT NULL DEFAULT 'google_places';
ALTER TABLE businesses ADD COLUMN country TEXT;

-- Namespace the old Google-sourced ids so they can never collide with a new
-- "osm:..." or "directory:..." id.
UPDATE businesses SET source_id = 'google:' || source_id WHERE source = 'google_places';

-- Optional — drops the Google-only rating columns now that nothing populates
-- them going forward. Comment these two lines out if you'd rather keep
-- historical rating data sitting on the old rows.
ALTER TABLE businesses DROP COLUMN rating;
ALTER TABLE businesses DROP COLUMN user_rating_count;

CREATE INDEX IF NOT EXISTS idx_businesses_source  ON businesses(source);
CREATE INDEX IF NOT EXISTS idx_businesses_country ON businesses(country);
