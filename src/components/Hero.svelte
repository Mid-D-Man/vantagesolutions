<section class="hero">
  <div class="glow" aria-hidden="true"></div>
  <div class="grid-lines" aria-hidden="true"></div>

  <div class="container">
    <p class="eyebrow">// Digital Growth Specialists</p>

    <h1>
      Vantage<br />
      <em>Solutions</em>
    </h1>

    <p class="sub">
      We build, create, protect, and grow digital businesses — combining real human work
      with powerful AI tools to handle the parts of your business you don't have time for.
    </p>

    <div class="actions">
      <a href="#services" class="btn-primary">
        See What We Do
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
      <a href="#contact" class="btn-ghost">Get in touch</a>
    </div>

    <div class="stats" aria-label="Key stats">
      <div class="stat">
        <span class="stat-value">6</span>
        <span class="stat-label">Service areas</span>
      </div>
      <div class="stat-divider" aria-hidden="true"></div>
      <div class="stat">
        <span class="stat-value">AI+</span>
        <span class="stat-label">Human-first delivery</span>
      </div>
      <div class="stat-divider" aria-hidden="true"></div>
      <div class="stat">
        <span class="stat-value">Free</span>
        <span class="stat-label">Monthly content drop</span>
      </div>
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
  }

  .glow {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 50% -5%, rgba(34, 211, 238, 0.1) 0%, transparent 60%),
      radial-gradient(ellipse 40% 35% at 85% 65%, rgba(129, 140, 248, 0.07) 0%, transparent 55%);
    pointer-events: none;
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 80px 80px;
    opacity: 0.25;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 80%);
    pointer-events: none;
  }

  .container {
    position: relative;
    z-index: 1;
    padding-top: 88px;
    padding-bottom: 96px;
  }

  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  h1 {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: clamp(56px, 10vw, 104px);
    letter-spacing: -0.045em;
    line-height: 0.92;
    margin-bottom: 30px;
  }

  h1 em {
    font-style: normal;
    color: var(--accent);
  }

  .sub {
    font-size: clamp(16px, 1.8vw, 19px);
    line-height: 1.72;
    color: var(--text-sec);
    max-width: 540px;
    margin-bottom: 44px;
  }

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
    gap: 8px;
    background: var(--accent);
    color: #080C14;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 15px;
    padding: 14px 24px;
    border-radius: 7px;
    transition: opacity 0.15s, transform 0.15s;
  }

  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

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
    background: rgba(255, 255, 255, 0.02);
  }

  /* stats bar */
  .stats {
    display: flex;
    align-items: center;
    gap: 32px;
    flex-wrap: wrap;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-value {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 24px;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .stat-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .stat-divider {
    width: 1px;
    height: 36px;
    background: var(--border);
  }

  @media (max-width: 640px) {
    .container { padding-top: 56px; padding-bottom: 64px; }
    .actions { flex-direction: column; align-items: stretch; }
    .btn-primary, .btn-ghost { justify-content: center; }
    .stat-divider { display: none; }
    .stats { gap: 20px; }
  }
</style>
