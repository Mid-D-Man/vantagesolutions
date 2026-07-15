import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isAuthenticated } from '$lib/server/auth';
import { updateStatus } from '$lib/server/db';

export const PATCH: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (!env) return error(500, 'Platform bindings unavailable');
	if (!(await isAuthenticated(event.cookies, env.SESSION_SECRET))) return error(401, 'Unauthorized');

	let body: { status?: string };
	try {
		body = await event.request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}
	if (body.status !== 'new' && body.status !== 'excluded') {
		return error(400, "status must be 'new' or 'excluded'");
	}

	const ok = await updateStatus(env.DB, event.params.id, body.status);
	if (!ok) return error(404, 'Not found');
	return json({ ok: true });
};
