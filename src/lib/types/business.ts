export type BusinessStatus = 'new' | 'excluded';

/** A row as stored in / read from D1. */
export interface Business {
	source_id: string;
	source: string; // 'osm' | 'directory'
	name: string;
	category: string | null;
	search_query: string | null;
	country: string | null; // ISO 3166-1 alpha-2
	address: string | null;
	phone: string | null;
	website: string | null;
	emails: string; // JSON-encoded string[] - D1 has no native array/JSON column type
	contact_page_url: string | null;
	site_reachable: number | null; // 0 / 1 / null
	site_status_code: number | null;
	status: BusinessStatus;
	discovered_at: string;
	last_scraped_at: string | null;
}

/** What scripts/scrape_contacts.py sends to POST /api/ingest. */
export interface IngestRecord {
	source_id: string;
	source: string;
	name: string;
	category?: string;
	search_query?: string;
	country?: string;
	address?: string;
	phone?: string;
	website?: string;
	emails?: string[];
	contact_page_url?: string;
	site_reachable?: boolean;
	site_status_code?: number;
}
