const BASE_STYLES = `
  :root {
    --bg: #0b0d10;
    --surface: #14171b;
    --surface-2: #1b1f24;
    --border: #262b31;
    --text: #f2f2f0;
    --text-sec: #b8bcc2;
    --text-muted: #7d838c;
    --accent: #f57c00;
    --accent-dark: #d96a00;
    --danger: #e0524d;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
  }
  a { color: var(--accent); }
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
    transition: border-color 0.15s, color 0.15s;
  }
  button:hover { border-color: var(--accent); color: var(--accent); }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  button.primary:hover { background: var(--accent-dark); border-color: var(--accent-dark); color: #fff; }
  input, select {
    font-family: inherit;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 7px;
    padding: 8px 10px;
    font-size: 13px;
  }
  input:focus, select:focus { outline: none; border-color: var(--accent); }
`;

export function loginPageHtml(error?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Vantage Solutions — Access</title>
<style>
  ${BASE_STYLES}
  .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card {
    width: 100%; max-width: 340px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 32px;
  }
  h1 { font-size: 17px; margin: 0 0 4px; }
  .sub { color: var(--text-muted); font-size: 13px; margin: 0 0 24px; }
  label { display: block; font-size: 12px; color: var(--text-sec); margin-bottom: 6px; }
  .field { margin-bottom: 16px; }
  input { width: 100%; }
  button.primary { width: 100%; padding: 10px; margin-top: 4px; }
  .error {
    background: rgba(224, 82, 77, 0.12); border: 1px solid var(--danger); color: var(--danger);
    border-radius: 7px; padding: 8px 10px; font-size: 12px; margin-bottom: 16px;
  }
</style>
</head>
<body>
  <div class="wrap">
    <form class="card" id="login-form">
      <h1>Vantage Solutions</h1>
      <p class="sub">Contact database — sign in to continue.</p>
      ${error ? `<div class="error">${error}</div>` : ''}
      <div class="field">
        <label for="username">Username</label>
        <input id="username" name="username" autocomplete="username" required>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <button class="primary" type="submit">Sign in</button>
    </form>
  </div>
  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        window.location.href = '/access/master?error=1';
      }
    });
  </script>
</body>
</html>`;
}

export function dashboardPageHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Vantage Solutions — Contacts</title>
<style>
  ${BASE_STYLES}
  header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid var(--border);
  }
  header h1 { font-size: 15px; margin: 0; }
  .toolbar {
    display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
    padding: 16px 24px; border-bottom: 1px solid var(--border);
  }
  .toolbar .spacer { flex: 1; }
  main { padding: 0 24px 40px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td {
    text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border);
    font-size: 13px; vertical-align: top;
  }
  th { color: var(--text-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  td.name { font-weight: 600; }
  td .muted { color: var(--text-muted); font-size: 12px; }
  td a { word-break: break-all; }
  .emails { display: flex; flex-direction: column; gap: 2px; }
  .badge {
    display: inline-block; font-size: 11px; padding: 2px 7px; border-radius: 4px;
    background: var(--surface-2); color: var(--text-sec); border: 1px solid var(--border);
  }
  .badge.reachable { color: #6bcf7f; border-color: rgba(107,207,127,0.4); }
  .badge.unreachable { color: var(--danger); border-color: rgba(224,82,77,0.4); }
  .pagination { display: flex; align-items: center; gap: 10px; margin-top: 20px; justify-content: center; }
  .pagination span { color: var(--text-muted); font-size: 12px; }
  .empty { text-align: center; color: var(--text-muted); padding: 60px 0; }
  .loading { text-align: center; color: var(--text-muted); padding: 60px 0; }
</style>
</head>
<body>
  <header>
    <h1>Vantage Solutions — Contact Database</h1>
    <button id="logout-btn">Sign out</button>
  </header>

  <div class="toolbar">
    <input id="search" placeholder="Search name, website, email…" style="width:240px">
    <select id="status-filter">
      <option value="new">Active</option>
      <option value="excluded">Excluded</option>
      <option value="all">All</option>
    </select>
    <input id="category-filter" placeholder="Category (exact)" style="width:160px">
    <div class="spacer"></div>
    <button id="export-page-btn">Export page (CSV)</button>
    <button id="export-all-btn" class="primary">Export all (CSV)</button>
  </div>

  <main>
    <div id="content" class="loading">Loading…</div>
    <div class="pagination" id="pagination" style="display:none">
      <button id="prev-btn">&larr; Prev</button>
      <span id="page-info"></span>
      <button id="next-btn">Next &rarr;</button>
    </div>
  </main>

  <script>
    const state = { page: 1, pageSize: 25, status: 'new', category: '', q: '' };

    function qs(params) {
      const usp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== '' && v !== undefined && v !== null) usp.set(k, v); });
      return usp.toString();
    }

    function esc(str) {
      const div = document.createElement('div');
      div.textContent = str ?? '';
      return div.innerHTML;
    }

    async function fetchBusinesses() {
      const content = document.getElementById('content');
      content.className = 'loading';
      content.textContent = 'Loading…';

      const query = qs({ page: state.page, pageSize: state.pageSize, status: state.status, category: state.category, q: state.q });
      const res = await fetch('/api/businesses?' + query);
      if (res.status === 401) { window.location.reload(); return; }
      const data = await res.json();
      render(data);
    }

    function render(data) {
      const content = document.getElementById('content');
      const pagination = document.getElementById('pagination');

      if (!data.results.length) {
        content.className = 'empty';
        content.textContent = 'No businesses match this filter yet.';
        pagination.style.display = 'none';
        return;
      }

      content.className = '';
      const rows = data.results.map((b) => {
        const emails = JSON.parse(b.emails || '[]');
        const reachBadge = b.site_reachable === 1
          ? '<span class="badge reachable">reachable' + (b.site_status_code ? ' · ' + b.site_status_code : '') + '</span>'
          : b.site_reachable === 0
            ? '<span class="badge unreachable">unreachable</span>'
            : '<span class="badge">not checked</span>';

        return \`<tr data-id="\${esc(b.place_id)}">
          <td class="name">\${esc(b.name)}<div class="muted">\${esc(b.category || '')}</div></td>
          <td>\${b.website ? \`<a href="\${esc(b.website)}" target="_blank" rel="noopener noreferrer">\${esc(b.website)}</a>\` : '<span class="muted">—</span>'}<div>\${reachBadge}</div></td>
          <td class="emails">\${emails.length ? emails.map((e) => esc(e)).join('<br>') : '<span class="muted">none found</span>'}</td>
          <td>\${esc(b.phone || '—')}</td>
          <td class="muted">\${esc(b.address || '—')}</td>
          <td>\${b.status === 'excluded'
            ? '<button data-action="include">Restore</button>'
            : '<button data-action="exclude">Exclude</button>'}</td>
        </tr>\`;
      }).join('');

      content.innerHTML = \`<table>
        <thead><tr><th>Business</th><th>Website</th><th>Emails</th><th>Phone</th><th>Address</th><th></th></tr></thead>
        <tbody>\${rows}</tbody>
      </table>\`;

      content.querySelectorAll('button[data-action]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const tr = btn.closest('tr');
          const id = tr.getAttribute('data-id');
          const newStatus = btn.dataset.action === 'exclude' ? 'excluded' : 'new';
          btn.disabled = true;
          await fetch('/api/businesses/' + encodeURIComponent(id) + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          });
          fetchBusinesses();
        });
      });

      pagination.style.display = 'flex';
      document.getElementById('page-info').textContent = \`Page \${data.page} of \${data.totalPages} · \${data.total} total\`;
      document.getElementById('prev-btn').disabled = data.page <= 1;
      document.getElementById('next-btn').disabled = data.page >= data.totalPages;
    }

    document.getElementById('prev-btn').addEventListener('click', () => { state.page = Math.max(1, state.page - 1); fetchBusinesses(); });
    document.getElementById('next-btn').addEventListener('click', () => { state.page += 1; fetchBusinesses(); });

    document.getElementById('status-filter').addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; fetchBusinesses(); });
    document.getElementById('category-filter').addEventListener('input', debounce((e) => { state.category = e.target.value; state.page = 1; fetchBusinesses(); }, 400));
    document.getElementById('search').addEventListener('input', debounce((e) => { state.q = e.target.value; state.page = 1; fetchBusinesses(); }, 400));

    function debounce(fn, ms) {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    }

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST' });
      window.location.reload();
    });

    document.getElementById('export-page-btn').addEventListener('click', () => {
      const query = qs({ page: state.page, pageSize: state.pageSize, status: state.status, category: state.category, q: state.q, scope: 'page' });
      window.location.href = '/api/businesses/export?' + query;
    });

    document.getElementById('export-all-btn').addEventListener('click', () => {
      const query = qs({ status: state.status, category: state.category, q: state.q, scope: 'all' });
      window.location.href = '/api/businesses/export?' + query;
    });

    fetchBusinesses();
  </script>
</body>
</html>`;
}
