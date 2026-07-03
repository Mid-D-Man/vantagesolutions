<!--
  Articles — no database. Articles live in content/articles.json in this repo
  and are fetched at runtime from raw.githubusercontent.com, so publishing a
  new article is just editing that file and pushing to `main` — no rebuild,
  no redeploy.

  Note: raw.githubusercontent.com sits behind Fastly's CDN, so a push can take
  a few minutes to show up here. That's expected, not a bug.

  To point this at a different repo/branch/path, change FEED_URL below.
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Article, ArticlesFeed } from '$lib/types/article';

  const FEED_URL =
    'https://raw.githubusercontent.com/Mid-D-Man/vantagesolutions/main/content/articles.json';

  type LoadState = 'loading' | 'success' | 'error' | 'empty';

  let state: LoadState = 'loading';
  let articles: Article[] = [];
  let activeArticle: Article | null = null;

  async function loadFeed() {
    state = 'loading';
    try {
      const res = await fetch(FEED_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Feed responded ${res.status}`);

      const data = (await res.json()) as ArticlesFeed;
      const list = Array.isArray(data?.articles) ? data.articles : [];

      articles = [...list].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
      state = articles.length ? 'success' : 'empty';
    } catch (err) {
      console.error('Failed to load articles feed:', err);
      state = 'error';
    }
  }

  onMount(loadFeed);

  function openArticle(article: Article) {
    activeArticle = article;
    document.body.style.overflow = 'hidden';
  }

  function closeArticle() {
    activeArticle = null;
    document.body.style.overflow = '';
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && activeArticle) closeArticle();
  }

  function formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  }

  function paragraphs(content: string): string[] {
    return content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }

  $: bodyParagraphs = activeArticle ? paragraphs(activeArticle.content) : [];

  onDestroy(() => {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  });
</script>

<svelte:window on:keydown={handleKey} />

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
      <div class="articles-grid">
        {#each articles as article (article.id)}
          <button class="card" on:click={() => openArticle(article)} aria-haspopup="dialog">
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
                {#if article.category}<span class="cat">{article.category}</span>{/if}
                {#if article.date}<span class="date">{formatDate(article.date)}</span>{/if}
              </div>
              <h3>{article.title}</h3>
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
          </button>
        {/each}
      </div>
    {/if}

  </div>
</section>

{#if activeArticle}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class="modal-backdrop" on:click={closeArticle} role="presentation">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      on:click|stopPropagation
    >
      <button class="modal-close" on:click={closeArticle} aria-label="Close article">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>

      {#if activeArticle.image}
        {#if activeArticle.link}
          
            class="modal-media"
            href={activeArticle.link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${activeArticle.link.label ?? 'Open link'} (opens in a new tab)`}
          >
            <img src={activeArticle.image} alt={activeArticle.title} />
          </a>
        {:else}
          <div class="modal-media">
            <img src={activeArticle.image} alt={activeArticle.title} />
          </div>
        {/if}
      {/if}

      <div class="modal-body">
        <div class="card-meta">
          {#if activeArticle.category}<span class="cat">{activeArticle.category}</span>{/if}
          {#if activeArticle.date}<span class="date">{formatDate(activeArticle.date)}</span>{/if}
        </div>

        <h2 id="article-modal-title">{activeArticle.title}</h2>

        <div class="modal-copy">
          {#each bodyParagraphs as para}
            <p>{para}</p>
          {/each}
        </div>

        {#if activeArticle.link}
          
            class="modal-link"
            href={activeArticle.link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {activeArticle.link.label ?? 'Read Full Article'}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 7.5h9M8.5 3.5l4 4-4 4"
                    stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}

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

  /* ── Grid ── */
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    background: var(--bg);
    transition: background 0.18s;
  }

  .card:hover { background: var(--surface); }

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

  .cat {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-glow);
    padding: 4px 9px;
    border-radius: 4px;
  }

  .date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
  }

  .card-body h3 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 18px;
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

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 15, 15, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1000;
  }

  .modal {
    position: relative;
    width: 100%;
    max-width: 640px;
    max-height: 88vh;
    overflow-y: auto;
    background: var(--bg);
    border-radius: 14px;
    border: 1px solid var(--border);
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text-sec);
    z-index: 2;
    transition: color 0.15s, border-color 0.15s;
  }

  .modal-close:hover { color: var(--accent); border-color: var(--accent); }

  .modal-media {
    display: block;
    aspect-ratio: 16 / 9;
    background: var(--surface);
    overflow: hidden;
  }

  .modal-media img { width: 100%; height: 100%; object-fit: cover; }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 36px 36px 40px;
  }

  .modal-body h2 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: clamp(22px, 3vw, 28px);
    letter-spacing: -0.025em;
    line-height: 1.2;
    color: var(--text);
  }

  .modal-copy {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .modal-copy p {
    font-size: 15px;
    line-height: 1.75;
    color: var(--text-sec);
  }

  .modal-link {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    align-self: flex-start;
    background: var(--accent);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 20px;
    border-radius: 8px;
    margin-top: 6px;
    transition: background 0.15s;
  }

  .modal-link:hover { background: var(--accent-dark); }

  @media (max-width: 880px) {
    .articles-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    section { padding: 72px 0; }
    .articles-grid { grid-template-columns: 1fr; border-radius: 8px; }
    .modal-body { padding: 28px 22px 32px; }
  }
</style>
