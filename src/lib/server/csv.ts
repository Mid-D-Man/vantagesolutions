import type { Business } from '$lib/types/business';

const COLUMNS: (keyof Business)[] = [
	'place_id',
	'name',
	'category',
	'search_query',
	'address',
	'phone',
	'website',
	'rating',
	'user_rating_count',
	'emails',
	'contact_page_url',
	'site_reachable',
	'site_status_code',
	'status',
	'discovered_at',
	'last_scraped_at'
];

function escapeCsvValue(value: unknown): string {
	if (value === null || value === undefined) return '';
	const str = String(value);
	if (/[",\n]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function businessesToCsv(rows: Business[]): string {
	const header = COLUMNS.join(',');
	const lines = rows.map((row) => COLUMNS.map((col) => escapeCsvValue(row[col])).join(','));
	return [header, ...lines].join('\r\n') + '\r\n';
}
