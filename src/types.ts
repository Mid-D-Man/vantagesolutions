export interface Env {
  DB: D1Database;
  INGEST_SECRET: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}

export type BusinessStatus = 'new' | 'excluded';

/** A row as stored in / read from D1. */
export interface Business {
  place_id: string;
  name: string;
  category: string | null;
  search_query: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  user_rating_count: number | null;
  emails: string; // JSON-encoded string[] — D1 has no native array/JSON column type
  contact_page_url: string | null;
  site_reachable: number | null; // 0 / 1 / null
  site_status_code: number | null;
  status: BusinessStatus;
  discovered_at: string;
  last_scraped_at: string | null;
}

/** What scripts/scrape_contacts.py sends to POST /api/ingest. */
export interface IngestRecord {
  place_id: string;
  name: string;
  category?: string;
  search_query?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_rating_count?: number;
  emails?: string[];
  contact_page_url?: string;
  site_reachable?: boolean;
  site_status_code?: number;
}
