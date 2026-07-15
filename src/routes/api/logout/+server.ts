import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	event.cookies.delete(SESSION_COOKIE, { path: '/' });
	return json({ ok: true });
};
