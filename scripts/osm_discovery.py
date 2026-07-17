# scripts/osm_discovery.py
import time
import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
REQUEST_TIMEOUT = 90
REQUEST_DELAY_SECS = 3.0   # Slightly increased delay to be safer under load
USER_AGENT = "VantageSolutionsContactBot/1.0 (+https://vantagesolutions.pages.dev)"


def require_allowed_country(query: dict, allowed_countries: list) -> bool:
    return query.get("country") in allowed_countries


def _build_query(osm_tag: tuple, city: str, country: str) -> str:
    key, value = osm_tag
    # Optimized query utilizing geocodeArea for faster spatial indexing
    return f"""
[out:json][timeout:{REQUEST_TIMEOUT - 15}];
geocodeArea:"{city}, {country}"->.searchArea;
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
    ql = _build_query(query["osm_tag"], query["city"], query["country"])
    try:
        resp = requests.post(
            OVERPASS_URL, 
            data={"data": ql}, 
            headers={"User-Agent": USER_AGENT}, 
            timeout=REQUEST_TIMEOUT
        )
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
