name: Scrape and Ingest Business Contacts

on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    if: ${{ vars.AUTO_RUN_ENABLED != 'false' || github.event_name == 'workflow_dispatch' }}
    defaults:
      run:
        working-directory: scripts
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install requests

      - name: Run scraper
        env:
          INGEST_URL: ${{ secrets.INGEST_URL }}
          INGEST_SECRET: ${{ secrets.INGEST_SECRET }}
          GOOGLE_PLACES_API_KEY: ${{ secrets.GOOGLE_PLACES_API_KEY }}
        run: python scrape_contacts.py
