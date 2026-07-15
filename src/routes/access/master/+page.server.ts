import type { PageServerLoad } from './$types';
import { isAuthenticated } from '$lib/server/auth';

// Session-dependent - can't be prerendered like the rest of the site.
export const prerender = false;

export const load: PageServerLoad = async (event) => {
	const env = event.platform?.env;
	if (!env) return { authenticated: false };

	const authenticated = await isAuthenticated(event.cookies, env.SESSION_SECRET);
	return { authenticated };
};
