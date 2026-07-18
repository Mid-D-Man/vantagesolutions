# scripts/search_queries.py

# Narrowed to US only for now — see OSM_QUERIES below. Re-add "GB" / "CA" here
# if you re-enable any of the commented-out non-US queries.
ALLOWED_COUNTRIES = ["US"]  # ISO 3166-1 alpha-2

# Trimmed down to a single active target on purpose (fewer Overpass calls per
# run, easier to judge results before scaling back up). Picked Car Dealership
# in Miami over the other US option (Real Estate Agency in Austin) because
# `shop=*` tags tend to be mapped far more consistently on OSM than `office=*`
# tags, and Miami is a bigger metro — should mean more/denser results. Worth
# comparing against Austin once you've seen a few runs of real data; flip
# "enabled" on either block below to test that instead of guessing further.
#
# The rest are kept here, disabled, so re-expanding later is a one-line flip
# per entry — just remember to add the matching country back to
# ALLOWED_COUNTRIES above, or a re-enabled non-US query will just get skipped.

OSM_QUERIES = [
    # --- Car Dealerships (active target) ---
    {
        "category": "Car Dealership",
        "osm_tag": ("shop", "car"),
        "city": "Miami",
        "country": "US",
        "enabled": True,
    },
    # --- Dental ---
    {
        "category": "Dental",
        "osm_tag": ("amenity", "dentist"),
        "city": "London",
        "country": "GB",
        "enabled": False,
    },
    # --- Marketing & Advertising Agencies ---
    {
        "category": "Marketing Agency",
        "osm_tag": ("office", "advertising_agency"),
        "city": "Toronto",
        "country": "CA",
        "enabled": False,
    },
    # --- Real Estate (Excellent target for digital marketing) ---
    {
        "category": "Real Estate Agency",
        "osm_tag": ("office", "estate_agent"),
        "city": "Austin",
        "country": "US",
        "enabled": False,
    },
    # --- Fitness & Gyms (High spending on marketing) ---
    {
        "category": "Gym / Fitness",
        "osm_tag": ("leisure", "fitness_centre"),
        "city": "Manchester",
        "country": "GB",
        "enabled": False,
    },
    # --- Legal / Law Firms ---
    {
        "category": "Law Firm",
        "osm_tag": ("office", "lawyer"),
        "city": "Vancouver",
        "country": "CA",
        "enabled": False,
    },
]

DIRECTORY_QUERIES = []
