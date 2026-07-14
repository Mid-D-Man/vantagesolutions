# scripts/search_queries.py
#
# Registry of Google Places Text Search queries used to discover businesses.
# Only entries with enabled=True are run.
#
# Add a new query by adding a new dict here — no other code changes needed.
# "query" is passed straight to Places API Text Search, so phrase it the way
# you'd type it into Google Maps: "<type of business> in <place>".

SEARCH_QUERIES = [
    {
        "query": "dentists in London, UK",
        "category": "Dental",
        "enabled": True,
    },
    {
        "query": "independent coffee shops in Austin, TX",
        "category": "Coffee",
        "enabled": True,
    },
    {
        "query": "boutique marketing agencies in Lagos, Nigeria",
        "category": "Marketing Agency",
        "enabled": True,
    },
    # Add more {query, category, enabled} entries here.
]
