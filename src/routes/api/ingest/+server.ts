import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safeEqual } from '$lib/server/auth';
import { upsertBusinesses } from '$lib/server/db';
import type { IngestRecord } from '$lib/types/business';

const MAX_INGEST_BATCH = 200;

export const POST: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (!env) return error(500, 'Platform bindings unavailable');

	const auth = event.request.headers.get('Authorization') ?? '';
	if (!safeEqual(auth, `Bearer ${env.INGEST_SECRET}`)) {
		return error(401, 'Unauthorized');
	}

	let records: unknown;
	try {
		records = await event.request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}
	if (!Array.isArray(records)) {
		return error(400, 'Body must be a JSON array');
	}
	if (records.length > MAX_INGEST_BATCH) {
		return error(400, `Batch too large (max ${MAX_INGEST_BATCH})`);
	}

	const { inserted, failed } = await upsertBusinesses(env.DB, records as IngestRecord[]);

	return json({
		results: [
			...Array.from({ length: inserted }, () => ({ ok: true, inserted: true })),
			...failed.map((f) => ({ ok: false, item: f.place_id, reason: f.reason }))
		],
		inserted,
		failed: failed.length
	});
};
