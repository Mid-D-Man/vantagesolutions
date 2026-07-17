# scripts/search_queries.py
#
# Configuration for the discovery pipeline: which countries we're willing to
# target at all, and the list of (category, place) queries to run against
# each enabled source.
#
# ── Region allow-list ────────────────────────────────────────────────────
# ALLOWED_COUNTRIES is the single gate every discovery source respects. A
# query for a country not on this list is skipped before any network request
# is made — see require_allowed_country() in osm_discovery.py and
# directory_scraper.py. Edit this list to whatever markets you're actually
# targeting; these three are just the example countries from initial
# planning, not a fixed default.

ALLOWED_COUNTRIES = ["US", "GB", "CA"]  # ISO 3166-1 alpha-2

# ── OSM / Overpass queries ───────────────────────────────────────────────
# Each entry becomes one Overpass query. `osm_tag` is a real OSM tag
# (key, value) pair — see https://wiki.openstreetmap.org/wiki/Map_features
# for the vocabulary. `city` + `country` narrow the search area; `country`
# must be one of ALLOWED_COUNTRIES or the query is skipped entirely.
#
# `exclude_if_tag` is optional — a tag key that, if present on a result,
# drops that result. Useful as a rough "independent, not a chain" filter:
# most (not all) chain locations carry a `brand` tag, independents usually
# don't.

OSM_QUERIES = [
    {
        "category": "Dental",
        "osm_tag": ("amenity", "dentist"),
        "city": "London",
        "country": "GB",
        "enabled": True,
    },
    {
        "category": "Coffee",
        "osm_tag": ("amenity", "cafe"),
        "city": "Austin",
        "country": "US",
        "exclude_if_tag": "brand",  # best-effort "independent, not a chain" filter
        "enabled": True,
    },
    {
        "category": "Marketing Agency",
        "osm_tag": ("office", "advertising_agency"),
        "city": "Toronto",
        "country": "CA",
        "enabled": True,
    },
    # Add more {category, osm_tag, city, country, enabled} entries here.
    # Full tag vocabulary: https://wiki.openstreetmap.org/wiki/Map_features
]

# ── Directory-scraper queries (backup source, see directory_scraper.py) ──
# Empty by default. directory_scraper.py's DirectorySource selectors are a
# template, not verified against a live site — fill in a real, inspected
# config there first (see that module's docstring), then reference its
# `name` from an entry here.
#
# Shape once you have a real source configured:
# {"source": "example_directory", "category": "Dental", "city": "London", "country": "GB", "enabled": True},

DIRECTORY_QUERIES = [
    # Add entries here once directory_scraper.DIRECTORY_SOURCES has a real,
    # verified config to point them at.
]
