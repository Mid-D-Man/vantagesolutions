import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safeEqual, createSessionToken, sessionCookieOptions, SESSION_COOKIE, SESSION_TTL_SECONDS } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (!env) return error(500, 'Platform bindings unavailable');

	let body: { username?: string; password?: string };
	try {
		body = await event.request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}

	const username = body.username ?? '';
	const password = body.password ?? '';
	const validUser = safeEqual(username, env.ADMIN_USERNAME);
	const validPass = safeEqual(password, env.ADMIN_PASSWORD);

	if (!validUser || !validPass) {
		return error(401, 'Invalid credentials');
	}

	const token = await createSessionToken(username, env.SESSION_SECRET);
	event.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_TTL_SECONDS));

	return json({ ok: true });
};
