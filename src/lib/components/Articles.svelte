<!--
  Articles — no database. Categories + articles live in content/articles.json
  in this repo and are fetched at runtime from raw.githubusercontent.com, so
  publishing a new article (or a whole new category) is just editing that
  file and pushing to `main` — no rebuild, no redeploy.

  Note: raw.githubusercontent.com sits behind Fastly's CDN, so a push can take
  a few minutes to show up here. That's expected, not a bug.

  Each category renders as its own block with a "View Articles" toggle.
  Clicking an article navigates to its own permalink page (/articles/{id}/)
  instead of opening a modal, so every article has a real, shareable URL.

  To point this at a different repo/branch/path, change FEED_URL below.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Article, ArticlesFeed, Category } from '$lib/types/article';

  const FEED_URL =
    'https://raw.githubusercontent.com/Mid-D-Man/vantagesolutions/main/content/articles.json';

  type LoadState = 'loading' | 'success' | 'error' | 'empty';

  let state: LoadState = 'loading';
  let categories: Category[] = [];
  let expanded: Record<string, boolean> = {};

  async function loadFeed() {
    state = 'loading';
    try {
      const res = await fetch(FEED_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Feed responded ${res.status}`);

      const data = (await res.json()) as ArticlesFeed;
      const list = Array.isArray(data?.categories) ? data.categories : [];

      categories = list;
      const totalArticles = list.reduce((sum, c) => sum + (c.articles?.length ?? 0), 0);
      state = list.length && totalArticles ? 'success' : 'empty';
    } catch (err) {
      console.error('Failed to load articles feed:', err);
      state = 'error';
    }
  }

  onMount(loadFeed);

  function toggleCategory(id: string) {
    expanded = { ...expanded, [id]: !expanded[id] };
  }

  function sortedArticles(articles: Article[]): Article[] {
    return [...(articles ?? [])].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }

  function formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  }
</script>

<section id="articles">
  <div class="container">

    <div class="section-head">
      <p class="eyebrow">// Articles</p>
      <h2>Insights &amp; Updates</h2>
      <p class="intro">
        Notes on growth, offers, and the systems behind them — pulled straight from what we're
        building.
      </p>
    </div>

    {#if state === 'loading'}
      <div class="status-card" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <p>Loading articles…</p>
      </div>

    {:else if state === 'error'}
      <div class="status-card">
        <p class="status-title">Couldn't load articles right now.</p>
        <p class="status-sub">Check your connection and try again.</p>
        <button class="retry" on:click={loadFeed}>Retry</button>
      </div>

    {:else if state === 'empty'}
      <div class="status-card">
        <p class="status-title">No articles yet.</p>
        <p class="status-sub">Check back soon — new posts land here as they're published.</p>
      </div>

    {:else}
      <div class="categories">
        {#each categories as category (category.id)}
          <div class="category-block">
            <div class="category-head">
              <div class="category-heading">
                <h3>{category.name}</h3>
                {#if category.description}<p class="category-desc">{category.description}</p>{/if}
              </div>

              {#if category.articles?.length}
                <button
                  class="toggle-btn"
                  aria-expanded={!!expanded[category.id]}
                  on:click={() => toggleCategory(category.id)}
                >
                  {expanded[category.id] ? 'Hide Articles' : `View Articles (${category.articles.length})`}
                  <svg
                    class="chev"
                    class:open={expanded[category.id]}
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.6"
                          stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              {:else}
                <span class="coming-soon">Coming soon</span>
              {/if}
            </div>

            {#if expanded[category.id] && category.articles?.length}
              <div class="articles-grid">
                {#each sortedArticles(category.articles) as article (article.id)}
                  <a class="card" href={`/articles/${article.id}/`}>
                    <div class="card-media">
                      {#if article.image}
                        <img src={article.image} alt={article.title} loading="lazy" />
                      {:else}
                        <div class="card-placeholder" aria-hidden="true">
                          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                            <rect x="5" y="3" width="20" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M10 10h10M10 15h10M10 20h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                          </svg>
                        </div>
                      {/if}
                    </div>

                    <div class="card-body">
                      <div class="card-meta">
                        {#if article.date}<span class="date">{formatDate(article.date)}</span>{/if}
                      </div>
                      <h4>{article.title}</h4>
                      <p class="excerpt">{article.excerpt}</p>
                      <span class="read-cta" aria-hidden="true">
                        Read Article
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                          <path d="M3 7.5h9M8.5 3.5l4 4-4 4"
                                stroke="currentColor" stroke-width="1.6"
                                stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

  </div>
</section>

<style>
  section {
    padding: 112px 0;
    border-top: 1px solid var(--border);
    background: var(--bg);
  }

  .section-head { margin-bottom: 52px; }

  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.1em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  h2 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: clamp(28px, 4vw, 46px);
    letter-spacing: -0.035em;
    line-height: 1.12;
    margin-bottom: 16px;
    color: var(--text);
  }

  .intro {
    font-size: 17px;
    line-height: 1.7;
    color: var(--text-sec);
    max-width: 480px;
  }

  /* ── Status states (loading / error / empty) ── */
  .status-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 64px 24px;
    border: 1px dashed var(--border);
    border-radius: 12px;
    background: var(--surface);
  }

  .status-card p { color: var(--text-muted); font-size: 14px; }

  .status-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: var(--text-sec) !important;
  }

  .retry {
    margin-top: 6px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 13px;
    padding: 9px 18px;
    border-radius: 7px;
    transition: border-color 0.15s, color 0.15s;
  }

  .retry:hover { border-color: var(--accent); color: var(--accent); }

  .spinner {
    width: 22px;
    height: 22px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Categories ── */
  .categories {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .category-block {
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    overflow: hidden;
  }

  .category-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 26px;
  }

  .category-heading h3 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 19px;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .category-desc {
    font-size: 13.5px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .toggle-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 13px;
    padding: 10px 16px;
    border-radius: 8px;
    white-space: nowrap;
    transition: border-color 0.15s, color 0.15s;
  }

  .toggle-btn:hover { border-color: var(--accent); color: var(--accent); }

  .chev { transition: transform 0.2s; }
  .chev.open { transform: rotate(180deg); }

  .coming-soon {
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    white-space: nowrap;
  }

  /* ── Grid ── */
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border-top: 1px solid var(--border);
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    background: var(--bg);
    transition: background 0.18s;
  }

  .card:hover { background: var(--surface-2); }

  .card-media {
    aspect-ratio: 16 / 10;
    background: var(--surface);
    overflow: hidden;
  }

  .card-media img { width: 100%; height: 100%; object-fit: cover; }

  .card-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 24px 24px 26px;
    flex: 1;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
  }

  .card-body h4 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--text);
  }

  .excerpt {
    font-size: 14px;
    line-height: 1.65;
    color: var(--text-sec);
    flex: 1;
  }

  .read-cta {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--accent);
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 13px;
    margin-top: 4px;
    transition: gap 0.15s;
  }

  .card:hover .read-cta { gap: 11px; }

  @media (max-width: 880px) {
    .articles-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    section { padding: 72px 0; }
    .category-head { flex-direction: column; align-items: flex-start; gap: 14px; }
    .articles-grid { grid-template-columns: 1fr; }
  }
</style>
