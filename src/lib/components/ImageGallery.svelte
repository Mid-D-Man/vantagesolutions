<!--
  ImageGallery — full-width scroll-through image section.
  Each panel is a placeholder: swap src/content when real images are ready.
  Usage: add an `images` prop later and replace the placeholder markup.
-->
<section class="gallery" aria-label="Work samples">
  <div class="container">
    <p class="section-label">// Our Work</p>
  </div>

  <div class="panels">

    <article class="panel panel--tall">
      <div class="placeholder">
        <span class="panel-num" aria-hidden="true">01</span>
        <div class="icon-wrap" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="2" y="6" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="12" cy="16" r="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 26l8-6 6 5 6-8 12 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="placeholder-label">Campaign</p>
        <p class="placeholder-hint">Image coming soon</p>
      </div>
      <div class="panel-meta">
        <span class="cat">Brand Campaign</span>
        <span class="tag">Audience Growth</span>
      </div>
    </article>

    <div class="panel-row">
      <article class="panel panel--mid">
        <div class="placeholder">
          <span class="panel-num" aria-hidden="true">02</span>
          <div class="icon-wrap" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="2" y="6" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.6"/>
              <circle cx="12" cy="16" r="3" stroke="currentColor" stroke-width="1.4"/>
              <path d="M2 26l8-6 6 5 6-8 12 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="placeholder-label">Brand Identity</p>
          <p class="placeholder-hint">Image coming soon</p>
        </div>
        <div class="panel-meta">
          <span class="cat">Visual Identity</span>
          <span class="tag">Design & Branding</span>
        </div>
      </article>

      <article class="panel panel--mid">
        <div class="placeholder">
          <span class="panel-num" aria-hidden="true">03</span>
          <div class="icon-wrap" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="2" y="6" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.6"/>
              <circle cx="12" cy="16" r="3" stroke="currentColor" stroke-width="1.4"/>
              <path d="M2 26l8-6 6 5 6-8 12 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="placeholder-label">Content Production</p>
          <p class="placeholder-hint">Image coming soon</p>
        </div>
        <div class="panel-meta">
          <span class="cat">Human Content</span>
          <span class="tag">Video & Image</span>
        </div>
      </article>
    </div>

    <article class="panel panel--tall">
      <div class="placeholder">
        <span class="panel-num" aria-hidden="true">04</span>
        <div class="icon-wrap" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="2" y="6" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="12" cy="16" r="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 26l8-6 6 5 6-8 12 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="placeholder-label">Web & Funnel</p>
        <p class="placeholder-hint">Image coming soon</p>
      </div>
      <div class="panel-meta">
        <span class="cat">Web Development</span>
        <span class="tag">Conversion Funnel</span>
      </div>
    </article>

  </div>
</section>

<style>
  section {
    padding: 72px 0 0;
    background: var(--bg);
  }

  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.1em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 40px;
  }

  .panels {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .panel-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px;
  }

  /* ── Individual panel ── */
  .panel {
    position: relative;
    background: var(--surface);
    overflow: hidden;
    cursor: default;
  }

  .panel--tall { height: 520px; }
  .panel--mid  { height: 380px; }

  /* Accent rule at top of each panel */
  .panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 48px;
    height: 3px;
    background: var(--accent);
    z-index: 2;
  }

  /* ── Placeholder interior ── */
  .placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding-bottom: 56px; /* space for meta bar */
    color: var(--text-muted);
  }

  .panel-num {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 80px;
    letter-spacing: -0.06em;
    color: var(--border);
    line-height: 1;
    user-select: none;
  }

  .icon-wrap {
    width: 64px;
    height: 64px;
    border: 1px solid var(--border);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .placeholder-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 17px;
    color: var(--text-muted);
  }

  .placeholder-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--border);
    text-transform: uppercase;
  }

  /* ── Meta bar ── */
  .panel-meta {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border);
    background: var(--bg);
  }

  .cat {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 13px;
    color: var(--text-sec);
  }

  .tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    background: var(--surface-2);
    padding: 4px 9px;
    border-radius: 4px;
  }

  @media (max-width: 640px) {
    .panel-row { grid-template-columns: 1fr; }
    .panel--tall { height: 380px; }
    .panel--mid  { height: 300px; }
    .panel-num   { font-size: 56px; }
  }
</style>
