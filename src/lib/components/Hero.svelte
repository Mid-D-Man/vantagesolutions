<section class="hero">
  <!-- Decorative orange glow — top-right, ambient only -->
  <div class="glow" aria-hidden="true"></div>

  <div class="container">
    <div class="inner">
      <p class="eyebrow">// Digital Growth Specialists</p>

      <!-- Editorial headline: each line breaks deliberately -->
      <h1>
        Turn Your<br />
        Audience<br />
        Into <em>Income.</em>
      </h1>

      <p class="sub">
        Vantage Solutions helps niche creators and solopreneurs monetize the audience
        they've already built — through outreach, offers, content, and the systems behind it.
      </p>

      <div class="actions">
        <a href="#contact" class="btn-primary">
          Let's Build Your Offer
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a href="#services" class="btn-ghost">See What We Do</a>
      </div>

      <dl class="stats" aria-label="What we offer at a glance">
        <div class="stat">
          <dt>7</dt>
          <dd>Service areas</dd>
        </div>
        <div class="divider" aria-hidden="true"></div>
        <div class="stat">
          <dt>AI + Human</dt>
          <dd>Delivery model</dd>
        </div>
        <div class="divider" aria-hidden="true"></div>
        <div class="stat">
          <dt>Free</dt>
          <dd>Monthly content drop</dd>
        </div>
      </dl>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: calc(100vh - 68px);
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--bg);
  }

  .glow {
    position: absolute;
    top: -160px;
    right: -180px;
    width: 640px;
    height: 640px;
    background: radial-gradient(circle, rgba(245,124,0,0.12) 0%, transparent 65%);
    pointer-events: none;
  }

  .inner {
    position: relative;
    z-index: 1;
    padding: 80px 0 96px;
    max-width: 740px;
  }

  /* ── Eyebrow ── */
  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.1em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  /* ── Editorial headline ── */
  h1 {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: clamp(52px, 9vw, 96px);
    letter-spacing: -0.04em;
    line-height: 1.0;
    color: var(--text);
    margin-bottom: 28px;
  }

  h1 em {
    font-style: normal;
    color: var(--accent);
  }

  /* ── Sub ── */
  .sub {
    font-size: clamp(16px, 1.8vw, 19px);
    line-height: 1.72;
    color: var(--text-sec);
    max-width: 560px;
    margin-bottom: 44px;
  }

  /* ── CTAs ── */
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 64px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    background: var(--accent);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 15px;
    padding: 14px 24px;
    border-radius: 7px;
    transition: background 0.15s, transform 0.15s;
  }

  .btn-primary:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    color: var(--text-sec);
    font-size: 15px;
    padding: 14px 20px;
    border-radius: 7px;
    border: 1px solid var(--border);
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }

  .btn-ghost:hover {
    color: var(--text);
    border-color: var(--text-muted);
    background: var(--surface);
  }

  /* ── Stats ── */
  .stats {
    display: flex;
    align-items: center;
    gap: 28px;
    flex-wrap: wrap;
  }

  .stat { display: flex; flex-direction: column; gap: 4px; }

  .stat dt {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .stat dd {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .divider {
    width: 1px;
    height: 32px;
    background: var(--border);
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .inner { padding: 56px 0 64px; }
    .actions { flex-direction: column; align-items: stretch; }
    .btn-primary, .btn-ghost { justify-content: center; }
    .divider { display: none; }
    .stats { gap: 18px; }
  }
</style>
