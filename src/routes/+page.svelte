<script lang="ts">
  import { Header, Footer } from '$lib';
  import type { PageData } from './$types';

  export let data: PageData;

  const SITE_URL = 'https://vantagesolutions.pages.dev';

  function formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
  }

  function paragraphs(content: string): string[] {
    return content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }

  $: article = data.article;
  $: bodyParagraphs = article ? paragraphs(article.content) : [];
  $: pageUrl = article ? `${SITE_URL}/articles/${article.id}/` : SITE_URL;
</script>

<svelte:head>
  {#if data.status === 'success' && article}
    <title>{article.title} — Vantage Solutions</title>
    <meta name="description" content={article.excerpt} />

    <meta property="og:type" content="article" />
    <meta property="og:title" content={article.title} />
    <meta property="og:description" content={article.excerpt} />
    <meta property="og:url" content={pageUrl} />
    {#if article.image}<meta property="og:image" content={article.image} />{/if}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={article.title} />
    <meta name="twitter:description" content={article.excerpt} />
    {#if article.image}<meta name="twitter:image" content={article.image} />{/if}
  {:else if data.status === 'notfound'}
    <title>Article Not Found — Vantage Solutions</title>
    <meta name="robots" content="noindex" />
  {:else}
    <title>Article — Vantage Solutions</title>
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

<Header />

<main>
  <article>
    <div class="container">
      <a class="back-link" href="/#articles">
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path d="M12 7.5H3M6.5 3.5l-4 4 4 4"
                stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Articles
      </a>

      {#if data.status === 'success' && article}
        <div class="meta">
          {#if data.categoryName}
            <a class="cat" href="/#articles">{data.categoryName}</a>
          {/if}
          {#if article.date}<span class="date">{formatDate(article.date)}</span>{/if}
        </div>

        <h1>{article.title}</h1>
        <p class="excerpt">{article.excerpt}</p>

        {#if article.image}
          <div class="cover">
            <img src={article.image} alt={article.title} />
          </div>
        {/if}

        <div class="copy">
          {#each bodyParagraphs as para}
            <p>{para}</p>
          {/each}
        </div>

        {#if article.link}
          <a class="cta-link" href={article.link.url} target="_blank" rel="noopener noreferrer">
            {article.link.label ?? 'Read Full Article'}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 7.5h9M8.5 3.5l4 4-4 4"
                    stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        {/if}

      {:else if data.status === 'notfound'}
        <div class="status-card">
          <p class="status-title">Couldn't find that article.</p>
          <p class="status-sub">It may have been moved or the link is out of date.</p>
          <a class="retry" href="/#articles">Browse All Articles</a>
        </div>

      {:else}
        <div class="status-card">
          <p class="status-title">Couldn't load this article right now.</p>
          <p class="status-sub">Check your connection and try again.</p>
          <a class="retry" href="/articles/{data.article?.id ?? ''}/">Retry</a>
        </div>
      {/if}
    </div>
  </article>
</main>

<Footer />

<style>
  main { display: flex; flex-direction: column; }

  article { padding: 64px 0 112px; background: var(--bg); }

  .container { max-width: 720px; }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 13px;
    color: var(--text-sec);
    margin-bottom: 32px;
    transition: color 0.15s;
  }

  .back-link:hover { color: var(--accent); }

  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .cat {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-glow);
    padding: 5px 10px;
    border-radius: 4px;
    transition: background 0.15s;
  }

  .cat:hover { background: rgba(245, 124, 0, 0.18); }

  .date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--text-muted);
  }

  h1 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: clamp(30px, 5vw, 44px);
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: var(--text);
    margin-bottom: 18px;
  }

  .excerpt {
    font-size: 18px;
    line-height: 1.6;
    color: var(--text-sec);
    margin-bottom: 32px;
  }

  .cover {
    aspect-ratio: 16 / 9;
    background: var(--surface);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 36px;
  }

  .cover img { width: 100%; height: 100%; object-fit: cover; }

  .copy {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .copy p {
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-sec);
  }

  .cta-link {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    align-self: flex-start;
    background: var(--accent);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 14px;
    padding: 13px 22px;
    border-radius: 8px;
    margin-top: 36px;
    transition: background 0.15s;
  }

  .cta-link:hover { background: var(--accent-dark); }

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
    display: inline-block;
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

  @media (max-width: 640px) {
    article { padding: 44px 0 72px; }
  }
</style>
