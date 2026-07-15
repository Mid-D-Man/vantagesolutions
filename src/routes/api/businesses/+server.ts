import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isAuthenticated } from '$lib/server/auth';
import { listBusinesses } from '$lib/server/db';
import type { BusinessStatus } from '$lib/types/business';

function isValidStatus(value: unknown): value is BusinessStatus | 'all' {
	return value === 'new' || value === 'excluded' || value === 'all';
}

export const GET: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (!env) return error(500, 'Platform bindings unavailable');
	if (!(await isAuthenticated(event.cookies, env.SESSION_SECRET))) return error(401, 'Unauthorized');

	const url = event.url;
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
	const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '25', 10) || 25));
	const statusParam = url.searchParams.get('status') ?? 'new';
	const status = isValidStatus(statusParam) ? statusParam : 'new';
	const category = url.searchParams.get('category') || undefined;
	const q = url.searchParams.get('q') || undefined;

	const result = await listBusinesses(env.DB, { page, pageSize, status, category, q });
	return json(result);
};
