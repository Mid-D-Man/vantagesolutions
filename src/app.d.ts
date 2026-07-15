/// <reference types="@cloudflare/workers-types" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// This file adds typing for the bindings adapter-cloudflare exposes on
// event.platform at runtime once they're configured on the Cloudflare Pages
// project (Settings -> Functions -> Bindings / Environment variables).
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				// D1 binding - variable name "DB" in the Pages dashboard
				DB: D1Database;
				// Environment variables (mark as "Secret"/encrypted in the dashboard)
				INGEST_SECRET: string;
				ADMIN_USERNAME: string;
				ADMIN_PASSWORD: string;
				SESSION_SECRET: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
