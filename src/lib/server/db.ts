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
export async function updateStatus(db: D1Database, placeId: string, status: BusinessStatus): Promise<boolean> {
	const result = await db.prepare('UPDATE businesses SET status = ? WHERE place_id = ?').bind(status, placeId).run();
	return (result.meta?.changes ?? 0) > 0;
}

/** Used by the scraper to skip re-crawling a business's website once it's already known. */
export async function getAllPlaceIds(db: D1Database): Promise<string[]> {
	const { results } = await db.prepare('SELECT place_id FROM businesses').all<{ place_id: string }>();
	return (results ?? []).map((r) => r.place_id);
}

export async function upsertBusinesses(
	db: D1Database,
	records: IngestRecord[]
): Promise<{ inserted: number; failed: { place_id: string; reason: string }[] }> {
	const now = new Date().toISOString();
	const failed: { place_id: string; reason: string }[] = [];
	const statements: D1PreparedStatement[] = [];

	for (const rec of records) {
		if (!rec.place_id || !rec.name) {
			failed.push({ place_id: rec.place_id ?? '(missing)', reason: 'missing place_id or name' });
			continue;
		}

		// status is intentionally absent from the UPDATE SET clause below - an admin's
		// "excluded" decision must survive the business being rediscovered on a later run.
		statements.push(
			db
				.prepare(
					`INSERT INTO businesses (
             place_id, name, category, search_query, address, phone, website,
             rating, user_rating_count, emails, contact_page_url,
             site_reachable, site_status_code, status, discovered_at, last_scraped_at
           )
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'new', ?14, ?14)
           ON CONFLICT(place_id) DO UPDATE SET
             name              = excluded.name,
             category          = excluded.category,
             search_query      = excluded.search_query,
             address           = excluded.address,
             phone             = excluded.phone,
             website           = excluded.website,
             rating            = excluded.rating,
             user_rating_count = excluded.user_rating_count,
             emails            = excluded.emails,
             contact_page_url  = excluded.contact_page_url,
             site_reachable    = excluded.site_reachable,
             site_status_code  = excluded.site_status_code,
             last_scraped_at   = excluded.last_scraped_at`
				)
				.bind(
					rec.place_id,
					rec.name,
					rec.category ?? null,
					rec.search_query ?? null,
					rec.address ?? null,
					rec.phone ?? null,
					rec.website ?? null,
					rec.rating ?? null,
					rec.user_rating_count ?? null,
					JSON.stringify(rec.emails ?? []),
					rec.contact_page_url ?? null,
					rec.site_reachable === undefined ? null : rec.site_reachable ? 1 : 0,
					rec.site_status_code ?? null,
					now
				)
		);
	}

	if (statements.length) {
		await db.batch(statements);
	}

	return { inserted: statements.length, failed };
}
