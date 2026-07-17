<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// ── Login ──
	let username = '';
	let password = '';
	let loginError = '';
	let loggingIn = false;

	async function handleLogin() {
		loginError = '';
		loggingIn = true;
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			if (res.ok) {
				window.location.reload();
			} else {
				loginError = 'Invalid username or password.';
			}
		} finally {
			loggingIn = false;
		}
	}

	async function handleLogout() {
		await fetch('/api/logout', { method: 'POST' });
		window.location.reload();
	}

	// ── Dashboard ──
	interface Business {
		source_id: string;
		name: string;
		category: string | null;
		website: string | null;
		phone: string | null;
		address: string | null;
		emails: string;
		site_reachable: number | null;
		site_status_code: number | null;
		status: 'new' | 'excluded';
	}
	interface ListResult {
		results: Business[];
		total: number;
		page: number;
		totalPages: number;
	}

	let state: 'loading' | 'ready' | 'empty' = 'loading';
	let businesses: Business[] = [];
	let page = 1;
	let totalPages = 1;
	let total = 0;
	let statusFilter: 'new' | 'excluded' | 'all' = 'new';
	let categoryFilter = '';
	let search = '';
	let pendingIds = new Set<string>();

	function buildQuery(extra: Record<string, string | number> = {}): string {
		const params = new URLSearchParams({
			page: String(page),
			pageSize: '25',
			status: statusFilter,
			...(categoryFilter ? { category: categoryFilter } : {}),
			...(search ? { q: search } : {}),
			...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)]))
		});
		return params.toString();
	}

	async function loadBusinesses() {
		state = 'loading';
		const res = await fetch(`/api/businesses?${buildQuery()}`);
		if (res.status === 401) {
			window.location.reload();
			return;
		}
		const data: ListResult = await res.json();
		businesses = data.results;
		total = data.total;
		totalPages = data.totalPages;
		state = businesses.length ? 'ready' : 'empty';
	}

	let searchDebounce: ReturnType<typeof setTimeout>;
	function onSearchInput() {
		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(() => {
			page = 1;
			loadBusinesses();
		}, 400);
	}

	function onFilterChange() {
		page = 1;
		loadBusinesses();
	}

	async function toggleStatus(business: Business) {
		pendingIds.add(business.source_id);
		pendingIds = pendingIds;
		const newStatus = business.status === 'excluded' ? 'new' : 'excluded';
		await fetch(`/api/businesses/${encodeURIComponent(business.source_id)}/status`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: newStatus })
		});
		pendingIds.delete(business.source_id);
		pendingIds = pendingIds;
		await loadBusinesses();
	}

	function exportPage() {
		window.location.href = `/api/businesses/export?${buildQuery({ scope: 'page' })}`;
	}

	function exportAll() {
		const params = new URLSearchParams({
			status: statusFilter,
			...(categoryFilter ? { category: categoryFilter } : {}),
			...(search ? { q: search } : {}),
			scope: 'all'
		});
		window.location.href = `/api/businesses/export?${params.toString()}`;
	}

	function formatEmails(json: string): string[] {
		try {
			return JSON.parse(json);
		} catch {
			return [];
		}
	}

	$: if (data.authenticated) loadBusinesses();
</script>

<svelte:head>
	<title>Vantage Solutions — Contacts</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if !data.authenticated}
	<div class="login-wrap">
		<form class="login-card" on:submit|preventDefault={handleLogin}>
			<h1>Vantage Solutions</h1>
			<p class="sub">Contact database — sign in to continue.</p>

			{#if loginError}<div class="error">{loginError}</div>{/if}

			<div class="field">
				<label for="username">Username</label>
				<input id="username" bind:value={username} autocomplete="username" required />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input id="password" type="password" bind:value={password} autocomplete="current-password" required />
			</div>
			<button class="primary" type="submit" disabled={loggingIn}>
				{loggingIn ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
	</div>
{:else}
	<div class="dashboard">
		<header>
			<h1>Vantage Solutions — Contact Database</h1>
			<button on:click={handleLogout}>Sign out</button>
		</header>

		<div class="toolbar">
			<input placeholder="Search name, website, email…" bind:value={search} on:input={onSearchInput} />
			<select bind:value={statusFilter} on:change={onFilterChange}>
				<option value="new">Active</option>
				<option value="excluded">Excluded</option>
				<option value="all">All</option>
			</select>
			<input placeholder="Category (exact)" bind:value={categoryFilter} on:input={onSearchInput} />
			<div class="spacer"></div>
			<button on:click={exportPage}>Export page (CSV)</button>
			<button class="primary" on:click={exportAll}>Export all (CSV)</button>
		</div>

		<main>
			{#if state === 'loading'}
				<div class="status-msg">Loading…</div>
			{:else if state === 'empty'}
				<div class="status-msg">No businesses match this filter yet.</div>
			{:else}
				<table>
					<thead>
						<tr>
							<th>Business</th>
							<th>Website</th>
							<th>Emails</th>
							<th>Phone</th>
							<th>Address</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each businesses as business (business.source_id)}
							<tr>
								<td class="name">
									{business.name}
									<div class="muted">{business.category ?? ''}</div>
								</td>
								<td>
									{#if business.website}
										<a href={business.website} target="_blank" rel="noopener noreferrer">{business.website}</a>
									{:else}
										<span class="muted">—</span>
									{/if}
									<div>
										{#if business.site_reachable === 1}
											<span class="badge reachable">reachable{business.site_status_code ? ` · ${business.site_status_code}` : ''}</span>
										{:else if business.site_reachable === 0}
											<span class="badge unreachable">unreachable</span>
										{:else}
											<span class="badge">not checked</span>
										{/if}
									</div>
								</td>
								<td class="emails">
									{#each formatEmails(business.emails) as email}
										<div>{email}</div>
									{:else}
										<span class="muted">none found</span>
									{/each}
								</td>
								<td>{business.phone ?? '—'}</td>
								<td class="muted">{business.address ?? '—'}</td>
								<td>
									<button disabled={pendingIds.has(business.source_id)} on:click={() => toggleStatus(business)}>
										{business.status === 'excluded' ? 'Restore' : 'Exclude'}
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<div class="pagination">
					<button disabled={page <= 1} on:click={() => { page -= 1; loadBusinesses(); }}>&larr; Prev</button>
					<span>Page {page} of {totalPages} · {total} total</span>
					<button disabled={page >= totalPages} on:click={() => { page += 1; loadBusinesses(); }}>Next &rarr;</button>
				</div>
			{/if}
		</main>
	</div>
{/if}

<style>
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	button {
		font-family: inherit;
		cursor: pointer;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text);
		border-radius: 7px;
		padding: 8px 14px;
		font-size: 13px;
		font-weight: 600;
		transition:
			border-color 0.15s,
			color 0.15s;
	}
	button:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	button.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	button.primary:hover {
		background: var(--accent-dark);
		border-color: var(--accent-dark);
		color: #fff;
	}

	input,
	select {
		font-family: inherit;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 7px;
		padding: 8px 10px;
		font-size: 13px;
	}
	input:focus,
	select:focus {
		outline: none;
		border-color: var(--accent);
	}

	/* ── Login ── */
	.login-wrap {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}
	.login-card {
		width: 100%;
		max-width: 340px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 32px;
	}
	.login-card h1 {
		font-family: 'Outfit', sans-serif;
		font-size: 17px;
		margin: 0 0 4px;
	}
	.sub {
		color: var(--text-muted);
		font-size: 13px;
		margin: 0 0 24px;
	}
	.field {
		margin-bottom: 16px;
	}
	.field label {
		display: block;
		font-size: 12px;
		color: var(--text-sec);
		margin-bottom: 6px;
	}
	.field input {
		width: 100%;
	}
	.login-card button.primary {
		width: 100%;
		padding: 10px;
		margin-top: 4px;
	}
	.error {
		background: rgba(224, 82, 77, 0.12);
		border: 1px solid #e0524d;
		color: #e0524d;
		border-radius: 7px;
		padding: 8px 10px;
		font-size: 12px;
		margin-bottom: 16px;
	}

	/* ── Dashboard ── */
	.dashboard header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px;
		border-bottom: 1px solid var(--border);
	}
	.dashboard header h1 {
		font-family: 'Outfit', sans-serif;
		font-size: 15px;
		margin: 0;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
		padding: 16px 24px;
		border-bottom: 1px solid var(--border);
	}
	.toolbar .spacer {
		flex: 1;
	}
	main {
		padding: 0 24px 40px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 16px;
	}
	th,
	td {
		text-align: left;
		padding: 10px 12px;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
		vertical-align: top;
	}
	th {
		color: var(--text-muted);
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	td.name {
		font-weight: 600;
	}
	td .muted {
		color: var(--text-muted);
		font-size: 12px;
	}
	td a {
		word-break: break-all;
	}
	.emails div {
		font-size: 13px;
	}
	.badge {
		display: inline-block;
		font-size: 11px;
		padding: 2px 7px;
		border-radius: 4px;
		background: var(--surface-2);
		color: var(--text-sec);
		border: 1px solid var(--border);
	}
	.badge.reachable {
		color: #6bcf7f;
		border-color: rgba(107, 207, 127, 0.4);
	}
	.badge.unreachable {
		color: #e0524d;
		border-color: rgba(224, 82, 77, 0.4);
	}
	.pagination {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 20px;
		justify-content: center;
	}
	.pagination span {
		color: var(--text-muted);
		font-size: 12px;
	}
	.status-msg {
		text-align: center;
		color: var(--text-muted);
		padding: 60px 0;
	}
</style>
