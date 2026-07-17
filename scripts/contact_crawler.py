# scripts/contact_crawler.py
#
# Stage 2 of the pipeline, shared by every discovery source: given a
# business's own website, visit the homepage and a few likely contact-page
# paths and pull whatever email address it has already published there.
# Nothing in this file talks to OSM, a directory, or any other discovery
# source — this only ever touches a site the business itself runs.

import re
import time
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests

CONTACT_PATHS = ["", "contact", "contact-us", "about", "about-us", "team"]
REQUEST_TIMEOUT = 12
POLITE_DELAY_SECS = 0.4
USER_AGENT = "VantageSolutionsContactBot/1.0 (+https://vantagesolutions.pages.dev)"

# Preferred: emails published as a mailto: link. A raw regex over page text
# throws false positives on things like name@2x.png sitting in an image path.
MAILTO_RE = re.compile(r'href=["\']mailto:([^"\'?]+)', re.IGNORECASE)

# Fallback for pages that publish an email as plain text with no mailto link.
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

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


def _clean(email: str):
    email = email.strip().rstrip(".,;:")
    lower = email.lower()
    if lower.endswith(EMAIL_BLOCKLIST_SUFFIXES):
        return None
    if any(bad in lower for bad in EMAIL_BLOCKLIST_SUBSTR):
        return None
    return email


def extract_emails(html: str) -> list:
    found = set()

    for match in MAILTO_RE.findall(html):
        cleaned = _clean(match)
        if cleaned:
            found.add(cleaned)

    # Only fall back to the whole-page regex if mailto: links didn't turn up
    # anything — it's noisier, so it's a backstop, not the first pass.
    if not found:
        for match in EMAIL_RE.findall(html):
            cleaned = _clean(match)
            if cleaned:
                found.add(cleaned)

    return sorted(found)


def check_site(website: str) -> dict:
    """Visits a business's own homepage + a few likely contact-page paths and
    pulls whatever email address it has already published there. Stops as
    soon as an email is found rather than checking every path.
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
