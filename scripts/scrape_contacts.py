# scripts/scrape_contacts.py
#
# Two-stage process, both scoped to what businesses have chosen to make public:
#
#   1. Discovery — Google Places API (New) Text Search, run against the queries
#      in search_queries.py. This returns businesses matching "<category> in
#      <location>" the same way Google Maps would show them to a person.
#
#   2. Contact check — for any *newly discovered* business with a website, visit
#      its homepage and a few likely contact-page paths (/contact, /about, /team)
#      and pull whatever email address it has already published there. Already-
#      known businesses are skipped on this step (see fetch_known_ids) so this
#      script isn't re-crawling the same sites every run.
#
# Results are POSTed to the Cloudflare Worker's /api/ingest, same batching
# pattern as MidMan Pulse's scripts/scrape.py.
#
# Requires env vars: INGEST_URL, INGEST_SECRET, GOOGLE_PLACES_API_KEY
#
# Note on the Places API: the legacy Places API can no longer be enabled for
# new Google Cloud projects — this script targets Places API (New)
# (https://places.googleapis.com/v1/places:searchText). Make sure "Places API
# (New)" specifically is enabled in your Google Cloud project.

import os
import re
import time
import requests
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

from search_queries import SEARCH_QUERIES as _ALL_QUERIES
QUERIES = [q for q in _ALL_QUERIES if q.get("enabled", True)]

INGEST_URL             = os.environ["INGEST_URL"]              # e.g. https://vantagesolutions.pages.dev/api/ingest
INGEST_SECRET          = os.environ["INGEST_SECRET"]
GOOGLE_PLACES_API_KEY  = os.environ["GOOGLE_PLACES_API_KEY"]

PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.rating",
    "places.userRatingCount",
    "places.businessStatus",
    "nextPageToken",
])

MAX_PAGES_PER_QUERY = 3     # 20 results/page x 3 = up to 60 businesses per query, per run
PAGE_SIZE           = 20

INGEST_BATCH_SIZE    = 50
INGEST_TIMEOUT_SECS  = 90    # per batch, mirrors scrape.py's Pages Function timeout headroom

CONTACT_PATHS   = ["", "contact", "contact-us", "about", "about-us", "team"]
REQUEST_TIMEOUT = 12
POLITE_DELAY_SECS = 0.4      # between requests to the same business's site
USER_AGENT = "VantageSolutionsContactBot/1.0 (+https://vantagesolutions.pages.dev)"

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Filters out the most common regex false-positives: image filenames that look like
# emails (name@2x.png), tracking/CDN noise, and obvious placeholder addresses.
EMAIL_BLOCKLIST_SUFFIXES = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp")
EMAIL_BLOCKLIST_SUBSTR   = ("example.com", "sentry.io", "wixpress.com", "godaddy.com", "schema.org")

_robots_cache = {}


def _allowed_by_robots(url: str) -> bool:
    """Best-effort robots.txt check. If robots.txt can't be fetched or parsed,
    default to allow (matches how browsers behave — robots.txt is a courtesy
    signal, not an access control layer, but we respect it when it's there).
    """
    parsed = urlparse(url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    if origin not in _robots_cache:
        rp = RobotFileParser()
        rp.set_url(f"{origin}/robots.txt")
        try:
            rp.read()
        except Exception:
            rp = None
        _robots_cache[origin] = rp

    rp = _robots_cache[origin]
    if rp is None:
        return True
    try:
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        return True


def extract_emails(html: str) -> list:
    found = set()
    for match in EMAIL_RE.findall(html):
        email = match.strip().rstrip(".,;:")
        lower = email.lower()
        if lower.endswith(EMAIL_BLOCKLIST_SUFFIXES):
            continue
        if any(bad in lower for bad in EMAIL_BLOCKLIST_SUBSTR):
            continue
        found.add(email)
    return sorted(found)


def check_site(website: str) -> dict:
    """Visits a business's own homepage + a few likely contact-page paths and
    pulls whatever email address it has already published there. Stops as soon
    as an email is found rather than checking every path.
    """
    base = website.rstrip("/")
    reachable = False
    status_code = None
    all_emails = set()
    contact_page_url = None

    for i, path in enumerate(CONTACT_PATHS):
        url = f"{base}/{path}" if path else base

        if not _allowed_by_robots(url):
            continue

        if i > 0:
            time.sleep(POLITE_DELAY_SECS)

        try:
            resp = requests.get(
                url,
                timeout=REQUEST_TIMEOUT,
                headers={"User-Agent": USER_AGENT},
                allow_redirects=True,
            )
        except Exception:
            continue

        if path == "":
            reachable = resp.ok
            status_code = resp.status_code

        if resp.ok:
            emails = extract_emails(resp.text)
            if emails and contact_page_url is None:
                contact_page_url = resp.url
            all_emails.update(emails)

        if all_emails:
            break

    return {
        "site_reachable": reachable,
        "site_status_code": status_code,
        "emails": sorted(all_emails),
        "contact_page_url": contact_page_url,
    }


def search_places(query: str) -> list:
    results = []
    page_token = None

    for _ in range(MAX_PAGES_PER_QUERY):
        body = {"textQuery": query, "pageSize": PAGE_SIZE}
        if page_token:
            body["pageToken"] = page_token

        try:
            resp = requests.post(
                PLACES_SEARCH_URL,
                json=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
                    "X-Goog-FieldMask": FIELD_MASK,
                },
                timeout=15,
            )
            resp.raise_for_status()
        except Exception as e:
            print(f"    [SKIP] Places API error: {e}")
            break

        data = resp.json()
        places = data.get("places", [])
        results.extend(places)

        page_token = data.get("nextPageToken")
        if not page_token:
            break

    return results


def build_record(place: dict, query: dict, known_ids: set) -> dict:
    place_id = place.get("id")
    website = place.get("websiteUri")

    record = {
        "place_id": place_id,
        "name": place.get("displayName", {}).get("text", ""),
        "category": query["category"],
        "search_query": query["query"],
        "address": place.get("formattedAddress"),
        "phone": place.get("internationalPhoneNumber"),
        "website": website,
        "rating": place.get("rating"),
        "user_rating_count": place.get("userRatingCount"),
    }

    # Only deep-crawl a business's own site the first time we see it. Already-known
    # businesses just get their Places metadata refreshed (cheap, no site traffic).
    if website and place_id not in known_ids:
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
    enabled_count = len(QUERIES)
    total_defined = len(_ALL_QUERIES)
    print(f"\nRunning {enabled_count}/{total_defined} enabled search queries")
    print("=" * 55)

    known_ids = fetch_known_ids()
    print(f"Businesses already known: {len(known_ids)}")

    all_records = []
    for q in QUERIES:
        print(f"\nSearching: \"{q['query']}\" [{q['category']}]")
        places = search_places(q["query"])
        print(f"  Found {len(places)} places")

        new_count = 0
        for place in places:
            if not place.get("id") or not place.get("displayName"):
                continue
            if place["id"] not in known_ids:
                new_count += 1
            all_records.append(build_record(place, q, known_ids))

        print(f"  ({new_count} new — contact pages checked for these)")

    print(f"\nTotal businesses to ingest: {len(all_records)}")
    if not all_records:
        print("Nothing to send.")
        return

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
