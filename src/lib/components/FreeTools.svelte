<section id="free-tools">
  <div class="container">

    <div class="section-head">
      <p class="eyebrow">// Free Tools</p>
      <h2>Free Tools —<br />Supported by Vantage Solutions</h2>
      <p class="intro">
        Some of what we build, we give away. If it helps you grow, it's worth sharing.
      </p>
    </div>

    <div class="tools-grid">

      <a
        href="https://midmanpulse.pages.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="tool-card featured"
        aria-label="Try MidMan Pulse — free post generator"
      >
        <div class="tool-header">
          <div class="tool-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 4.5L10 11.5M10 11.5L4 18.5M10 11.5L18 4.5M10 11.5L18 18.5"
                    stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="tool-badge">Free · No signup</span>
        </div>

        <h3>MidMan Pulse</h3>
        <p>
          Five ready posts from your niche, generated automatically, every single day.
          Completely free.
        </p>

        <div class="tool-cta" aria-hidden="true">
          Try It Free
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M3 7.5h9M8.5 3.5l4 4-4 4"
                  stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </a>

      <div class="tool-card placeholder" aria-label="More tools coming soon">
        <div class="ph-inner">
          <div class="ph-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12"
                    stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="ph-label">More free tools coming</p>
          <p class="ph-sub">
            We build new tools as they become useful.<br />
            Follow along to catch them when they drop.
          </p>
        </div>
      </div>

    </div>
  </div>
</section>

<style>
  section {
    padding: 112px 0;
    border-top: 1px solid var(--border);
    background: var(--surface);
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

  /* ── Grid ── */
  .tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  /* ── Featured card ── */
  .tool-card {
    background: var(--bg);
    padding: 44px 40px;
  }

  .featured {
    display: flex;
    flex-direction: column;
    gap: 0;
    cursor: pointer;
    transition: background 0.18s;
  }

  .featured:hover { background: var(--surface); }

  .tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .tool-icon {
    width: 46px;
    height: 46px;
    background: var(--accent-glow);
    border: 1px solid rgba(245, 124, 0, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
  }

  .tool-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid rgba(245, 124, 0, 0.25);
    background: var(--accent-glow);
    padding: 5px 11px;
    border-radius: 4px;
  }

  .featured h3 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 26px;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 12px;
  }

  .featured p {
    font-size: 15px;
    line-height: 1.72;
    color: var(--text-sec);
    flex: 1;
    margin-bottom: 32px;
  }

  .tool-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--accent);
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 15px;
    transition: gap 0.15s;
  }

  .featured:hover .tool-cta { gap: 13px; }

  /* ── Placeholder card ── */
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
  }

  .ph-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    max-width: 260px;
  }

  .ph-icon {
    width: 48px;
    height: 48px;
    border: 1px dashed var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .ph-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: var(--text-muted);
  }

  .ph-sub {
    font-size: 13px;
    line-height: 1.65;
    color: var(--text-muted);
  }

  @media (max-width: 700px) {
    section { padding: 72px 0; }
    .tools-grid { grid-template-columns: 1fr; border-radius: 8px; }
    .tool-card  { padding: 32px 24px; }
    .placeholder { min-height: 200px; }
  }
</style>
