# scripts/directory_scraper.py
#
# Backup discovery source: a generic, config-driven scraper for business
# directory sites (Yellow Pages-style listings, chamber of commerce
# directories, etc). This exists because OSM's coverage has gaps — use this
# to fill them in for a specific city/category where OSM comes up short.
#
# READ THIS BEFORE ENABLING ANYTHING HERE:
#
# 1. ToS risk is real and source-specific. Big consumer directories (Yelp,
#    Yellow Pages, etc) explicitly prohibit scraping in their Terms of
#    Service — that's a civil/contract matter, not something that puts
#    scraping *public* data in CFAA territory, but it's still real grounds
#    for a cease-and-desist or an account/IP ban if you scale it up. Smaller
#    regional and chamber-of-commerce-style directories often have no such
#    clause, or don't enforce it. Check the ToS of whatever you point this
#    at and decide your own risk tolerance — this module doesn't make that
#    call for you.
#
# 2. The DirectorySource config below is a TEMPLATE. The selectors are
#    illustrative, not verified against any live site — hand-picking
#    selectors for a real named site without actually inspecting its current
#    HTML would just mean shipping a config that silently returns nothing.
#    To wire up a real target:
#      a. Open the directory's search-results page in a browser.
#      b. Right-click a business listing → Inspect, find the repeating
#         "card" element that wraps one whole listing, and note its CSS
#         selector (a class name is usually enough).
#      c. Do the same for the name, phone, website, and address within one
#         card, and the "next page" link if results paginate.
#      d. Fill those into a DirectorySource below, then add a matching
#         entry to DIRECTORY_QUERIES in search_queries.py.
#    Selectors drift when a site redesigns, so expect to redo this
#    periodically regardless of which directory you pick.
#
# 3. Country filtering here works the same way as OSM: DIRECTORY_QUERIES
#    entries declare a country, and require_allowed_country() gates them
#    before any request goes out — same allow-list, same enforcement point.

import time
import hashlib
from dataclasses import dataclass
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

REQUEST_TIMEOUT = 15
REQUEST_DELAY_SECS = 1.5   # between page requests to the *same* directory
USER_AGENT = "VantageSolutionsContactBot/1.0 (+https://vantagesolutions.pages.dev)"

_robots_cache = {}


def _allowed_by_robots(url: str) -> bool:
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


@dataclass
class DirectorySource:
    name: str                                  # short id, e.g. "example_directory" — matches search_queries.py entries
    search_url_template: str                   # "{base}/search?what={category}&where={city}"
    base_url: str                              # for resolving relative links, e.g. "https://example-directory.com"
    result_card_selector: str                  # CSS selector for one listing on the results page
    name_selector: str                         # relative to a card
    phone_selector: str | None = None
    website_selector: str | None = None        # usually an <a href> — href is read, not the link text
    address_selector: str | None = None
    next_page_selector: str | None = None       # CSS selector for the "next page" link, None = no pagination
    max_pages: int = 3


# ── Directory configs ──────────────────────────────────────────────────
# Empty by default — see the module docstring. Add a DirectorySource here
# once you've inspected a real target, then reference its `name` from a
# search_queries.DIRECTORY_QUERIES entry.
#
# Example shape (selectors are placeholders, not verified against anything):
#
# EXAMPLE = DirectorySource(
#     name="example_directory",
#     search_url_template="https://example-directory.com/search?what={category}&where={city}",
#     base_url="https://example-directory.com",
#     result_card_selector="div.listing-card",
#     name_selector="h2.business-name",
#     phone_selector="span.phone",
#     website_selector="a.website-link",
#     address_selector="span.address",
#     next_page_selector="a.pagination-next",
#     max_pages=3,
# )

DIRECTORY_SOURCES: dict = {
    # "example_directory": EXAMPLE,
}


def require_allowed_country(query: dict, allowed_countries: list) -> bool:
    return query.get("country") in allowed_countries


def _text(el):
    return el.get_text(strip=True) if el else None


def _href(el):
    return el.get("href") if el else None


def _make_source_id(source_name: str, name: str, address) -> str:
    """Directories don't hand out a stable numeric id the way OSM or Google
    Places do, so this hashes the one thing that should stay constant for a
    given listing: its name + address as scraped.
    """
    key = f"{name}|{address or ''}".lower().strip()
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]
    return f"directory:{source_name}:{digest}"


def _scrape_page(source: DirectorySource, url: str, query: dict):
    """Returns (records, next_page_url_or_None)."""
    if not _allowed_by_robots(url):
        print(f"    [SKIP] robots.txt disallows {url}")
        return [], None

    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
    except Exception as e:
        print(f"    [SKIP] {source.name} request error: {e}")
        return [], None

    soup = BeautifulSoup(resp.text, "html.parser")
    records = []

    for card in soup.select(source.result_card_selector):
        name = _text(card.select_one(source.name_selector)) if source.name_selector else None
        if not name:
            continue

        phone = _text(card.select_one(source.phone_selector)) if source.phone_selector else None
        address = _text(card.select_one(source.address_selector)) if source.address_selector else None
        website = None
        if source.website_selector:
            website = _href(card.select_one(source.website_selector))
            if website:
                website = urljoin(source.base_url, website)

        records.append({
            "source_id": _make_source_id(source.name, name, address),
            "source": "directory",
            "name": name,
            "category": query["category"],
            "search_query": f"{query['category']} in {query['city']}, {query['country']} ({source.name})",
            "country": query["country"],
            "address": address,
            "phone": phone,
            "website": website,
        })

    next_url = None
    if source.next_page_selector:
        next_el = soup.select_one(source.next_page_selector)
        href = _href(next_el)
        if href:
            next_url = urljoin(source.base_url, href)

    return records, next_url


def run_query(source: DirectorySource, query: dict) -> list:
    url = source.search_url_template.format(category=query["category"], city=query["city"])
    all_records = []

    for page_num in range(source.max_pages):
        records, next_url = _scrape_page(source, url, query)
        all_records.extend(records)

        if not next_url or page_num == source.max_pages - 1:
            break
        url = next_url
        time.sleep(REQUEST_DELAY_SECS)

    return all_records


def discover(queries: list, allowed_countries: list) -> list:
    all_records = []
    enabled = [q for q in queries if q.get("enabled", True)]

    for q in enabled:
        source = DIRECTORY_SOURCES.get(q.get("source"))
        if not source:
            print(f"  [SKIP] directory source '{q.get('source')}' not configured in DIRECTORY_SOURCES")
            continue

        if not require_allowed_country(q, allowed_countries):
            print(f"  [SKIP] '{q['category']}' in {q['city']}, {q['country']} — {q['country']} not in ALLOWED_COUNTRIES")
            continue

        print(f"  {source.name}: {q['category']} in {q['city']}, {q['country']}")
        records = run_query(source, q)
        print(f"    Found {len(records)} listings")
        all_records.extend(records)

    return all_records
