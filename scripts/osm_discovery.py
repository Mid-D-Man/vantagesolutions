# scripts/osm_discovery.py
import time
import requests

# Through 2025-2026 the shared overpass-api.de primary has gotten increasingly
# overloaded (a lot of it bot/AI-scraper traffic hitting the one public
# instance), so a 504 there under completely normal query volume - like a
# single city/category query - isn't rare or a sign anything here is wrong.
# A 504 means the SERVER gave up because it's too busy, not that our request
# was slow - so a bigger client-side timeout can't fix it; the server hands
# back the 504 before that ever matters.
#
# Fix: try a couple of the healthier community mirrors first, keep the
# original overpass-api.de as a last-resort fallback rather than the only
# option. Order picked from current (2026) reports of which mirrors are
# holding up best for this kind of traffic - swap the order any time based on
# what you're actually seeing in the run logs.
OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter",  # original primary, last resort
]

REQUEST_TIMEOUT = 120  # Bumped up to give the server more time for big cities
REQUEST_DELAY_SECS = 3.0
USER_AGENT = "VantageSolutionsOSMBot/1.0 (+https://vantagesolutions.pages.dev)"


def require_allowed_country(query: dict, allowed_countries: list) -> bool:
    return query.get("country") in allowed_countries


def _build_query(osm_tag: tuple, city: str, country: str) -> str:
    key, value = osm_tag
    # Reverted to valid raw Overpass QL syntax, no frontend macros
    return f"""
[out:json][timeout:{REQUEST_TIMEOUT}];
area["ISO3166-1"="{country}"][admin_level=2]->.country;
area["name"="{city}"](area.country)->.searchArea;
(
  nwr["{key}"="{value}"](area.searchArea);
);
out center;
""".strip()


def _to_record(el: dict, query: dict):
    tags = el.get("tags", {})
    name = tags.get("name")
    if not name:
        return None

    exclude_tag = query.get("exclude_if_tag")
    if exclude_tag and exclude_tag in tags:
        return None

    website = tags.get("website") or tags.get("contact:website")
    phone = tags.get("phone") or tags.get("contact:phone")

    address_parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city"),
        tags.get("addr:postcode"),
    ]
    address = " ".join(p for p in address_parts if p) or None

    return {
        "source_id": f"osm:{el['type']}/{el['id']}",
        "source": "osm",
        "name": name,
        "category": query["category"],
        "search_query": f"{query['osm_tag'][0]}={query['osm_tag'][1]} in {query['city']}, {query['country']}",
        "country": query["country"],
        "address": address,
        "phone": phone,
        "website": website,
    }


def run_query(query: dict) -> list:
    """Tries each Overpass endpoint in OVERPASS_URLS in order, moving on to the
    next one for a timeout/5xx/network failure (transient, endpoint-specific).
    A 400 (bad query syntax) stops immediately instead of retrying elsewhere -
    the query is malformed the same way on every mirror, so trying the rest
    would just waste time without changing the outcome.
    """
    ql = _build_query(query["osm_tag"], query["city"], query["country"])

    for i, url in enumerate(OVERPASS_URLS):
        try:
            resp = requests.post(
                url,
                data={"data": ql},
                headers={"User-Agent": USER_AGENT, "Accept": "*/*"},
                timeout=REQUEST_TIMEOUT,
            )
        except requests.exceptions.RequestException as e:
            print(f"    [MIRROR FAIL] {url} — {e}")
            continue

        if resp.status_code == 400:
            print(f"    [SKIP] Overpass query error (400) at {url}: {resp.text[:200]}")
            return []

        if not resp.ok:
            print(f"    [MIRROR FAIL] {url} — HTTP {resp.status_code}")
            continue

        try:
            elements = resp.json().get("elements", [])
        except ValueError:
            print(f"    [MIRROR FAIL] {url} — response wasn't valid JSON")
            continue

        if i > 0:
            print(f"    (served by mirror: {url})")

        records = []
        for el in elements:
            rec = _to_record(el, query)
            if rec:
                records.append(rec)
        return records

    print(f"    [SKIP] all Overpass endpoints failed for this query")
    return []


def discover(queries: list, allowed_countries: list) -> list:
    all_records = []
    enabled = [q for q in queries if q.get("enabled", True)]

    for q in enabled:
        if not require_allowed_country(q, allowed_countries):
            print(f"  [SKIP] '{q['category']}' in {q['city']}, {q['country']} — {q['country']} not in ALLOWED_COUNTRIES")
            continue

        print(f"  Overpass: {q['osm_tag'][0]}={q['osm_tag'][1]} in {q['city']}, {q['country']}")
        records = run_query(q)
        print(f"    Found {len(records)} named businesses")
        all_records.extend(records)
        time.sleep(REQUEST_DELAY_SECS)

    return all_records
