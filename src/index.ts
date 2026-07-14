import type { Env, IngestRecord, BusinessStatus } from './types';
import {
  isAuthenticated,
  createSessionToken,
  sessionCookieHeader,
  clearSessionCookieHeader,
  safeEqual,
} from './auth';
import { listBusinesses, listAllForExport, updateStatus, upsertBusinesses, getAllPlaceIds } from './db';
import { businessesToCsv } from './csv';
import { loginPageHtml, dashboardPageHtml } from './admin-ui';

const MAX_INGEST_BATCH = 200;

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}

function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, { status: 401 });
}

function isValidStatus(value: unknown): value is BusinessStatus | 'all' {
  return value === 'new' || value === 'excluded' || value === 'all';
}

// ── /api/ingest — called by scripts/scrape_contacts.py, bearer-auth via INGEST_SECRET ──
async function handleIngest(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('Authorization') ?? '';
  if (!safeEqual(auth, `Bearer ${env.INGEST_SECRET}`)) return unauthorized();

  let records: unknown;
  try {
    records = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!Array.isArray(records)) {
    return json({ error: 'Body must be a JSON array' }, { status: 400 });
  }
  if (records.length > MAX_INGEST_BATCH) {
    return json({ error: `Batch too large (max ${MAX_INGEST_BATCH})` }, { status: 400 });
  }

  const { inserted, failed } = await upsertBusinesses(env, records as IngestRecord[]);
  return json({
    results: [
      ...Array.from({ length: inserted }, () => ({ ok: true, inserted: true })),
      ...failed.map((f) => ({ ok: false, item: f.place_id, reason: f.reason })),
    ],
    inserted,
    failed: failed.length,
  });
}

// ── /api/ingest/known-ids — lets the scraper skip re-crawling sites it already has ──
async function handleKnownIds(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('Authorization') ?? '';
  if (!safeEqual(auth, `Bearer ${env.INGEST_SECRET}`)) return unauthorized();

  const ids = await getAllPlaceIds(env);
  return json({ ids });
}

// ── /api/login ──
async function handleLogin(request: Request, env: Env): Promise<Response> {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const username = body.username ?? '';
  const password = body.password ?? '';
  const validUser = safeEqual(username, env.ADMIN_USERNAME);
  const validPass = safeEqual(password, env.ADMIN_PASSWORD);

  if (!validUser || !validPass) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await createSessionToken(username, env.SESSION_SECRET);
  return json({ ok: true }, { headers: { 'Set-Cookie': sessionCookieHeader(token) } });
}

function handleLogout(): Response {
  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookieHeader() } });
}

// ── /api/businesses ──
async function handleListBusinesses(request: Request, env: Env): Promise<Response> {
  if (!(await isAuthenticated(request, env))) return unauthorized();

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '25', 10) || 25));
  const statusParam = url.searchParams.get('status') ?? 'new';
  const status = isValidStatus(statusParam) ? statusParam : 'new';
  const category = url.searchParams.get('category') || undefined;
  const q = url.searchParams.get('q') || undefined;

  const result = await listBusinesses(env, { page, pageSize, status, category, q });
  return json(result);
}

// ── /api/businesses/:id/status — the prune action ──
async function handleUpdateStatus(request: Request, env: Env, placeId: string): Promise<Response> {
  if (!(await isAuthenticated(request, env))) return unauthorized();

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (body.status !== 'new' && body.status !== 'excluded') {
    return json({ error: "status must be 'new' or 'excluded'" }, { status: 400 });
  }

  const ok = await updateStatus(env, placeId, body.status);
  if (!ok) return json({ error: 'Not found' }, { status: 404 });
  return json({ ok: true });
}

// ── /api/businesses/export ──
async function handleExport(request: Request, env: Env): Promise<Response> {
  if (!(await isAuthenticated(request, env))) return unauthorized();

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status') ?? 'new';
  const status = isValidStatus(statusParam) ? statusParam : 'new';
  const category = url.searchParams.get('category') || undefined;
  const q = url.searchParams.get('q') || undefined;
  const scope = url.searchParams.get('scope') === 'all' ? 'all' : 'page';

  let rows;
  if (scope === 'all') {
    rows = await listAllForExport(env, { status, category, q });
  } else {
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '25', 10) || 25));
    const result = await listBusinesses(env, { page, pageSize, status, category, q });
    rows = result.results;
  }

  const csv = businessesToCsv(rows);
  const filename = `vantage-contacts-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

// ── /access/master — login form or dashboard, depending on session ──
async function handleAdminPage(request: Request, env: Env): Promise<Response> {
  const authed = await isAuthenticated(request, env);
  const url = new URL(request.url);
  const showError = url.searchParams.get('error') === '1';
  const html = authed ? dashboardPageHtml() : loginPageHtml(showError ? 'Invalid username or password.' : undefined);
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    try {
      if (pathname === '/api/ingest' && method === 'POST') {
        return await handleIngest(request, env);
      }
      if (pathname === '/api/ingest/known-ids' && method === 'GET') {
        return await handleKnownIds(request, env);
      }
      if (pathname === '/api/login' && method === 'POST') {
        return await handleLogin(request, env);
      }
      if (pathname === '/api/logout' && method === 'POST') {
        return handleLogout();
      }
      if (pathname === '/api/businesses' && method === 'GET') {
        return await handleListBusinesses(request, env);
      }
      if (pathname === '/api/businesses/export' && method === 'GET') {
        return await handleExport(request, env);
      }
      const statusMatch = pathname.match(/^\/api\/businesses\/([^/]+)\/status$/);
      if (statusMatch && method === 'PATCH') {
        return await handleUpdateStatus(request, env, decodeURIComponent(statusMatch[1]));
      }
      if ((pathname === '/access/master' || pathname === '/access/master/') && method === 'GET') {
        return await handleAdminPage(request, env);
      }

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return json({ error: 'Internal error' }, { status: 500 });
    }
  },
};
