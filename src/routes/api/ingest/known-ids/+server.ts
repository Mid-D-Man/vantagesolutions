import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safeEqual } from '$lib/server/auth';
import { getAllPlaceIds } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (!env) return error(500, 'Platform bindings unavailable');

	const auth = event.request.headers.get('Authorization') ?? '';
	if (!safeEqual(auth, `Bearer ${env.INGEST_SECRET}`)) {
		return error(401, 'Unauthorized');
	}

	const ids = await getAllPlaceIds(env.DB);
	return json({ ids });
};
