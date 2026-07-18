import type { Business, IngestRecord, BusinessStatus } from '$lib/types/business';

export interface ListParams {
	page: number;
	pageSize: number;
	status: BusinessStatus | 'all';
	category?: string;
	q?: string;
}

export interface ListResult {
	results: Business[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

function buildWhereClause(params: Omit<ListParams, 'page' | 'pageSize'>): {
	clause: string;
	bindings: unknown[];
} {
	const conditions: string[] = [];
	const bindings: unknown[] = [];

	if (params.status !== 'all') {
		conditions.push('status = ?');
		bindings.push(params.status);
	}
	if (params.category) {
		conditions.push('category = ?');
		bindings.push(params.category);
	}
	if (params.q) {
		conditions.push('(name LIKE ? OR website LIKE ? OR emails LIKE ? OR address LIKE ?)');
		const like = `%${params.q}%`;
		bindings.push(like, like, like, like);
	}

	const clause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
	return { clause, bindings };
}

export async function listBusinesses(db: D1Database, params: ListParams): Promise<ListResult> {
	const { clause, bindings } = buildWhereClause(params);

	const countRow = await db
		.prepare(`SELECT COUNT(*) as count FROM businesses ${clause}`)
		.bind(...bindings)
		.first<{ count: number }>();
	const total = countRow?.count ?? 0;

	const offset = (params.page - 1) * params.pageSize;
	const { results } = await db
		.prepare(`SELECT * FROM businesses ${clause} ORDER BY discovered_at DESC LIMIT ? OFFSET ?`)
		.bind(...bindings, params.pageSize, offset)
		.all<Business>();

	return {
		results: results ?? [],
		total,
		page: params.page,
		pageSize: params.pageSize,
		totalPages: Math.max(1, Math.ceil(total / params.pageSize))
	};
}

export async function listAllForExport(
	db: D1Database,
	params: Omit<ListParams, 'page' | 'pageSize'>
): Promise<Business[]> {
	const { clause, bindings } = buildWhereClause(params);
	const { results } = await db
		.prepare(`SELECT * FROM businesses ${clause} ORDER BY discovered_at DESC`)
		.bind(...bindings)
		.all<Business>();
	return results ?? [];
}

/** The "prune" action from the admin panel - toggling a row out of (or back into) the default view. */
export async function updateStatus(db: D1Database, sourceId: string, status: BusinessStatus): Promise<boolean> {
	const result = await db
		.prepare('UPDATE businesses SET status = ? WHERE source_id = ?')
		.bind(status, sourceId)
		.run();
	return (result.meta?.changes ?? 0) > 0;
}

/** Used by the scraper to skip re-crawling a business's website once it's already known. */
export async function getAllSourceIds(db: D1Database): Promise<string[]> {
	const { results } = await db.prepare('SELECT source_id FROM businesses').all<{ source_id: string }>();
	return (results ?? []).map((r) => r.source_id);
}

// Reasonable ceiling for a lead-gen list at this scale, not a technical D1 limit —
// D1's free tier has room for far more than this. The cap exists so the list stays
// a manageable, actionable thing to work through rather than growing forever.
// Raise it any time by changing this constant.
export const MAX_BUSINESSES = 5000;

/** Reduces a website URL to a bare, lowercased hostname with no "www." — good enough
 * to recognize "the same business" showing up under two different source_ids (e.g.
 * found via both OSM and a directory) without being so loose it merges unrelated
 * businesses that just happen to share a path or query string.
 */
function normalizeWebsiteKey(website: string | null | undefined): string | null {
	if (!website) return null;
	try {
		const url = new URL(website.includes('://') ? website : `https://${website}`);
		const host = url.hostname.toLowerCase().replace(/^www\./, '');
		return host || null;
	} catch {
		return null;
	}
}

export async function upsertBusinesses(
	db: D1Database,
	records: IngestRecord[]
): Promise<{
	inserted: number;
	updated: number;
	merged: number;
	capped: number;
	failed: { source_id: string; reason: string }[];
}> {
	const now = new Date().toISOString();
	const failed: { source_id: string; reason: string }[] = [];
	const statements: D1PreparedStatement[] = [];

	const valid = records.filter((rec) => {
		if (!rec.source_id || !rec.name) {
			failed.push({ source_id: rec.source_id ?? '(missing)', reason: 'missing source_id or name' });
			return false;
		}
		return true;
	});
	if (!valid.length) return { inserted: 0, updated: 0, merged: 0, capped: 0, failed };

	// Already-known source_ids (rediscovered businesses) — always updated, never
	// counted against the cap since they don't grow the table.
	const existingBySourceId = new Set<string>();
	{
		const placeholders = valid.map(() => '?').join(',');
		const { results } = await db
			.prepare(`SELECT source_id FROM businesses WHERE source_id IN (${placeholders})`)
			.bind(...valid.map((r) => r.source_id))
			.all<{ source_id: string }>();
		for (const row of results ?? []) existingBySourceId.add(row.source_id);
	}

	// Same business under a *different* source_id (e.g. also found via a directory) —
	// merged into the row that already exists instead of becoming a second row.
	const websiteKeys = [...new Set(valid.map((r) => normalizeWebsiteKey(r.website)).filter((k): k is string => !!k))];
	const existingByWebsiteKey = new Map<string, string>(); // website_key -> source_id
	if (websiteKeys.length) {
		const placeholders = websiteKeys.map(() => '?').join(',');
		const { results } = await db
			.prepare(`SELECT source_id, website_key FROM businesses WHERE website_key IN (${placeholders})`)
			.bind(...websiteKeys)
			.all<{ source_id: string; website_key: string }>();
		for (const row of results ?? []) existingByWebsiteKey.set(row.website_key, row.source_id);
	}

	const countRow = await db.prepare('SELECT COUNT(*) as count FROM businesses').first<{ count: number }>();
	let currentTotal = countRow?.count ?? 0;

	// status is intentionally absent from the UPDATE SET clause below - an admin's
	// "excluded" decision must survive the business being rediscovered on a later run.
	function upsertStatement(sourceId: string, rec: IngestRecord, websiteKey: string | null) {
		return db
			.prepare(
				`INSERT INTO businesses (
             source_id, source, name, category, search_query, country, address, phone,
             website, website_key, emails, contact_page_url, site_reachable, site_status_code,
             status, discovered_at, last_scraped_at
           )
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, 'new', ?15, ?15)
           ON CONFLICT(source_id) DO UPDATE SET
             source             = excluded.source,
             name              = excluded.name,
             category          = excluded.category,
             search_query      = excluded.search_query,
             country            = excluded.country,
             address           = excluded.address,
             phone             = excluded.phone,
             website           = excluded.website,
             website_key       = excluded.website_key,
             emails            = excluded.emails,
             contact_page_url  = excluded.contact_page_url,
             site_reachable    = excluded.site_reachable,
             site_status_code  = excluded.site_status_code,
             last_scraped_at   = excluded.last_scraped_at`
			)
			.bind(
				sourceId,
				rec.source,
				rec.name,
				rec.category ?? null,
				rec.search_query ?? null,
				rec.country ?? null,
				rec.address ?? null,
				rec.phone ?? null,
				rec.website ?? null,
				websiteKey,
				JSON.stringify(rec.emails ?? []),
				rec.contact_page_url ?? null,
				rec.site_reachable === undefined ? null : rec.site_reachable ? 1 : 0,
				rec.site_status_code ?? null,
				now
			);
	}

	let insertedCount = 0;
	let updatedCount = 0;
	let mergedCount = 0;
	let cappedCount = 0;

	for (const rec of valid) {
		const websiteKey = normalizeWebsiteKey(rec.website);

		if (existingBySourceId.has(rec.source_id)) {
			statements.push(upsertStatement(rec.source_id, rec, websiteKey));
			updatedCount++;
			continue;
		}

		const dupeSourceId = websiteKey ? existingByWebsiteKey.get(websiteKey) : undefined;
		if (dupeSourceId) {
			statements.push(upsertStatement(dupeSourceId, rec, websiteKey));
			mergedCount++;
			continue;
		}

		// Genuinely new business - only add it if there's room under the cap.
		if (currentTotal >= MAX_BUSINESSES) {
			cappedCount++;
			continue;
		}
		statements.push(upsertStatement(rec.source_id, rec, websiteKey));
		currentTotal++;
		insertedCount++;

		// So a second new record in the same batch with the same source_id or website
		// (both are possible if the scraper's own dedup missed something) is caught too.
		existingBySourceId.add(rec.source_id);
		if (websiteKey) existingByWebsiteKey.set(websiteKey, rec.source_id);
	}

	if (statements.length) {
		await db.batch(statements);
	}

	return { inserted: insertedCount, updated: updatedCount, merged: mergedCount, capped: cappedCount, failed };
		}
