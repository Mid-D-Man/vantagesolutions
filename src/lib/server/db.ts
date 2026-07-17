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

export async function upsertBusinesses(
	db: D1Database,
	records: IngestRecord[]
): Promise<{ inserted: number; failed: { source_id: string; reason: string }[] }> {
	const now = new Date().toISOString();
	const failed: { source_id: string; reason: string }[] = [];
	const statements: D1PreparedStatement[] = [];

	for (const rec of records) {
		if (!rec.source_id || !rec.name) {
			failed.push({ source_id: rec.source_id ?? '(missing)', reason: 'missing source_id or name' });
			continue;
		}

		// status is intentionally absent from the UPDATE SET clause below - an admin's
		// "excluded" decision must survive the business being rediscovered on a later run.
		statements.push(
			db
				.prepare(
					`INSERT INTO businesses (
             source_id, source, name, category, search_query, country, address, phone,
             website, emails, contact_page_url, site_reachable, site_status_code,
             status, discovered_at, last_scraped_at
           )
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'new', ?14, ?14)
           ON CONFLICT(source_id) DO UPDATE SET
             source             = excluded.source,
             name              = excluded.name,
             category          = excluded.category,
             search_query      = excluded.search_query,
             country            = excluded.country,
             address           = excluded.address,
             phone             = excluded.phone,
             website           = excluded.website,
             emails            = excluded.emails,
             contact_page_url  = excluded.contact_page_url,
             site_reachable    = excluded.site_reachable,
             site_status_code  = excluded.site_status_code,
             last_scraped_at   = excluded.last_scraped_at`
				)
				.bind(
					rec.source_id,
					rec.source,
					rec.name,
					rec.category ?? null,
					rec.search_query ?? null,
					rec.country ?? null,
					rec.address ?? null,
					rec.phone ?? null,
					rec.website ?? null,
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
