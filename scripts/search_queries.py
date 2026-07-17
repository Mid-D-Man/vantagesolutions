# scripts/search_queries.py

ALLOWED_COUNTRIES = ["US", "GB", "CA"]  # ISO 3166-1 alpha-2

OSM_QUERIES = [
    # --- Dental ---
    {
        "category": "Dental",
        "osm_tag": ("amenity", "dentist"),
        "city": "London",
        "country": "GB",
        "enabled": True,
    },
    # --- Marketing & Advertising Agencies ---
    {
        "category": "Marketing Agency",
        "osm_tag": ("office", "advertising_agency"),
        "city": "Toronto",
        "country": "CA",
        "enabled": True,
    },
    # --- Real Estate (Excellent target for digital marketing) ---
    {
        "category": "Real Estate Agency",
        "osm_tag": ("office", "estate_agent"),
        "city": "Austin",
        "country": "US",
        "enabled": True,
    },
    # --- Fitness & Gyms (High spending on marketing) ---
    {
        "category": "Gym / Fitness",
        "osm_tag": ("leisure", "fitness_centre"),
        "city": "Manchester",
        "country": "GB",
        "enabled": True,
    },
    # --- Legal / Law Firms ---
    {
        "category": "Law Firm",
        "osm_tag": ("office", "lawyer"),
        "city": "Vancouver",
        "country": "CA",
        "enabled": True,
    },
    # --- Car Dealerships ---
    {
        "category": "Car Dealership",
        "osm_tag": ("shop", "car"),
        "city": "Miami",
        "country": "US",
        "enabled": True,
    }
]

DIRECTORY_QUERIES = []
