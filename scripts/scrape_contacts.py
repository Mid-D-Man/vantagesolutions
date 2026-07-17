# scripts/scrape_contacts.py
#
# Discovery + contact-check pipeline. Replaces the Google Places version —
# no API key, no billing, two discovery sources instead of one:
#
#   1. OSM/Overpass (osm_discovery.py) — primary, free, no key required.
#   2. Directory scraping (directory_scraper.py) — backup for OSM coverage
#      gaps, empty/disabled until you've configured a real target (see that
#      module's docstring).
#
# Both discovery sources are gated by the same country allow-list
# (search_queries.ALLOWED_COUNTRIES) before any request goes out.
#
# Stage 2 (contact_crawler.py) is unchanged in spirit: for any *newly
# discovered* business with a website, visit its homepage and a few likely
# contact-page paths and pull whatever email it has already published there.
# Already-known businesses are skipped on this step (see fetch_known_ids) so
# this script isn't re-crawling the same sites every run.
#
# Results are POSTed to the Cloudflare Worker's /api/ingest, same batching
# pattern as MidMan Pulse's scripts/scrape.py.
#
# Requires env vars: INGEST_URL, INGEST_SECRET
# (no API key needed anymore — that's the whole point of this rewrite)

import os
import requests

import osm_discovery
import directory_scraper
from contact_crawler import check_site
from search_queries import ALLOWED_COUNTRIES, OSM_QUERIES, DIRECTORY_QUERIES

INGEST_URL    = os.environ["INGEST_URL"]     # e.g. https://vantage-solutions.pages.dev/api/ingest
INGEST_SECRET = os.environ["INGEST_SECRET"]

INGEST_BATCH_SIZE   = 50
INGEST_TIMEOUT_SECS = 90    # per batch, mirrors scrape.py's Pages Function timeout headroom


def enrich_with_contact_info(record: dict, known_ids: set) -> dict:
    """Only deep-crawls a business's own site the first time we see it.
    Already-known businesses just get their discovery-source metadata
    refreshed (cheap, no site traffic).
    """
    website = record.get("website")
    if website and record["source_id"] not in known_ids:
        record.update(check_site(website))
    return record


def fetch_known_ids() -> set:
    try:
        resp = requests.get(
            INGEST_URL.replace("/api/ingest", "/api/ingest/known-ids"),
            headers={"Authorization": f"Bearer {INGEST_SECRET}"},
            timeout=30,
        )
        resp.raise_for_status()
        return set(resp.json().get("ids", []))
    except Exception as e:
        print(f"  [WARN] Could not fetch known ids, will check every site's contact page this run: {e}")
        return set()


def ingest_batch(records: list) -> dict:
    resp = requests.post(
        INGEST_URL,
        json=records,
        headers={
            "Authorization": f"Bearer {INGEST_SECRET}",
            "Content-Type": "application/json",
        },
        timeout=INGEST_TIMEOUT_SECS,
    )
    resp.raise_for_status()
    return resp.json()


def main():
    print(f"Allow-listed countries: {', '.join(ALLOWED_COUNTRIES)}")
    print("=" * 55)

    known_ids = fetch_known_ids()
    print(f"Businesses already known: {len(known_ids)}")

    print("\n--- OSM / Overpass discovery ---")
    osm_records = osm_discovery.discover(OSM_QUERIES, ALLOWED_COUNTRIES)

    print("\n--- Directory-scraper discovery ---")
    directory_records = directory_scraper.discover(DIRECTORY_QUERIES, ALLOWED_COUNTRIES)

    all_discovered = osm_records + directory_records
    print(f"\nTotal discovered: {len(all_discovered)} ({len(osm_records)} OSM, {len(directory_records)} directory)")

    if not all_discovered:
        print("Nothing to send.")
        return

    new_count = sum(1 for r in all_discovered if r["source_id"] not in known_ids)
    print(f"({new_count} new — contact pages checked for these)")

    all_records = [enrich_with_contact_info(r, known_ids) for r in all_discovered]

    total_inserted = 0
    total_failed   = 0
    batches = [all_records[i:i + INGEST_BATCH_SIZE] for i in range(0, len(all_records), INGEST_BATCH_SIZE)]
    print(f"\nIngesting in {len(batches)} batch(es) of up to {INGEST_BATCH_SIZE}...")

    for batch_num, batch in enumerate(batches, 1):
        print(f"\n  Batch {batch_num}/{len(batches)} ({len(batch)} records)...")
        try:
            data = ingest_batch(batch)
            inserted = data.get("inserted", 0)
            failed   = data.get("failed", 0)
            total_inserted += inserted
            total_failed   += failed
            print(f"    Inserted/updated: {inserted}  |  Failed: {failed}")
            for r in data.get("results", []):
                if not r.get("ok"):
                    print(f"    [FAIL] {r.get('item')} — {r.get('reason')}")
        except Exception as exc:
            total_failed += len(batch)
            print(f"    [BATCH ERROR] {exc}")

    print(f"\n{'='*55}")
    print(f"  Total inserted/updated: {total_inserted}")
    print(f"  Total failed: {total_failed}")
    print(f"{'='*55}")


if __name__ == "__main__":
    main()
