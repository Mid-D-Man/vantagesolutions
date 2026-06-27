<section id="free-tools">
  <div class="container">

    <div class="section-header">
      <p class="eyebrow">// Free Tools</p>
      <h2>Free Tools — Supported by<br />Vantage Solutions</h2>
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
        aria-label="Try MidMan Pulse — free tweet generator"
      >
        <div class="tool-header">
          <div class="tool-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M4 4.5L10 11.5M10 11.5L4 18.5M10 11.5L18 4.5M10 11.5L18 18.5"
                    stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="tool-badge">Free · No signup</span>
        </div>

        <h3>MidMan Pulse</h3>
        <p>
          Five ready-to-post tweets from your niche, generated automatically, every single day.
          Completely free.
        </p>

        <div class="tool-cta">
          Try It Free
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M3 7.5h9M8.5 3.5l4 4-4 4"
                  stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </a>

      <div class="tool-card placeholder">
        <div class="placeholder-inner">
          <div class="placeholder-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="placeholder-label">More free tools coming</p>
          <p class="placeholder-sub">
            We build new tools as they become useful. Follow along to catch them when they drop.
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
  }

  .section-header {
    margin-bottom: 56px;
  }

  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  h2 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: clamp(30px, 4vw, 48px);
    letter-spacing: -0.035em;
    line-height: 1.12;
    margin-bottom: 18px;
  }

  .intro {
    font-size: 17px;
    line-height: 1.7;
    color: var(--text-sec);
    max-width: 480px;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--border);
  }

  .tool-card {
    background: var(--surface);
    padding: 44px 40px;
    transition: background 0.18s;
  }

  /* featured card */
  .featured {
    display: flex;
    flex-direction: column;
    gap: 0;
    cursor: pointer;
    transition: background 0.18s;
  }

  .featured:hover { background: var(--surface-2); }

  .tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .tool-icon {
    width: 44px;
    height: 44px;
    background: var(--accent-glow);
    border: 1px solid rgba(34, 211, 238, 0.22);
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
    border: 1px solid rgba(34, 211, 238, 0.25);
    background: var(--accent-glow);
    padding: 4px 10px;
    border-radius: 4px;
  }

  .featured h3 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 26px;
    letter-spacing: -0.03em;
    margin-bottom: 12px;
  }

  .featured p {
    font-size: 15px;
    line-height: 1.7;
    color: var(--text-sec);
    margin-bottom: 32px;
    flex: 1;
  }

  .tool-cta {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--accent);
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 15px;
    transition: gap 0.15s;
  }

  .featured:hover .tool-cta { gap: 11px; }

  /* placeholder card */
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    max-width: 260px;
  }

  .placeholder-icon {
    width: 44px;
    height: 44px;
    border: 1px dashed var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .placeholder-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: var(--text-muted);
  }

  .placeholder-sub {
    font-size: 13px;
    line-height: 1.65;
    color: var(--text-muted);
  }

  @media (max-width: 700px) {
    section { padding: 72px 0; }
    .tools-grid { grid-template-columns: 1fr; border-radius: 8px; }
    .tool-card { padding: 32px 24px; }
    .placeholder { min-height: 200px; }
  }
</style>
