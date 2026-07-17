# scripts/osm_discovery.py
#
# Discovery stage using OpenStreetMap's Overpass API — free, no API key, no
# billing. Trade-off vs Google Places: OSM's business coverage is strong in
# Europe and patchier elsewhere, and it almost never has an email tag — that's
# what contact_crawler.py is for, same as before: it visits the website OSM
# gives us and looks for a published email there.
#
# Query shape: for each enabled entry in search_queries.OSM_QUERIES, we
# resolve the named city *inside* the named country's OSM boundary first, so
# "London" under GB can never accidentally match "London, Ontario" — then
# pull every node/way/relation in that area carrying the requested tag.
#
# Public endpoint courtesy notice: this hits the free, community-run Overpass
# instance. Keep queries modest and spaced out (see REQUEST_DELAY_SECS) — if
# you outgrow it, self-hosting Overpass or a paid mirror are options, but for
# a lead-gen pipeline running every few hours this should be fine.
#
# Known limitation: admin_level=2 is the standard OSM tag for a national
# boundary and is correct for essentially every country, but if a query for
# a given country/city ever comes back empty when you know matches exist,
# check that combination on https://overpass-turbo.eu/ before assuming
# there's a bug here.

import time
import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
REQUEST_TIMEOUT = 90
REQUEST_DELAY_SECS = 2.0   # between queries — be a polite citizen on a free shared service


def require_allowed_country(query: dict, allowed_countries: list) -> bool:
    """The hard gate: a query only ever runs if its country is allow-listed.
    Called before any network request — a disallowed country never even
    reaches Overpass.
    """
    return query.get("country") in allowed_countries


def _build_query(osm_tag: tuple, city: str, country: str) -> str:
    key, value = osm_tag
    return f"""
[out:json][timeout:{REQUEST_TIMEOUT - 15}];
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
        return None  # unnamed POIs aren't useful leads

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
    ql = _build_query(query["osm_tag"], query["city"], query["country"])
    try:
        resp = requests.post(OVERPASS_URL, data={"data": ql}, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        print(f"    [SKIP] Overpass error: {e}")
        return []

    elements = resp.json().get("elements", [])
    records = []
    for el in elements:
        rec = _to_record(el, query)
        if rec:
            records.append(rec)
    return records


def discover(queries: list, allowed_countries: list) -> list:
    """Runs every enabled OSM query and returns normalized records.
    Disallowed-country queries are skipped before any request is sent.
    """
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
