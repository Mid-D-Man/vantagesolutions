<footer id="contact">
  <div class="container">

    <div class="cta-block">
      <p class="eyebrow">// Let's work together</p>
      <h2>Ready to monetize<br />your audience?</h2>
      <p class="sub">Tell us what you've built. We'll tell you how we can help.</p>
      <a href="mailto:hello@vantagesolutions.io" class="btn">
        Get Started
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
          <path d="M3.5 8.5h10M9.5 4.5l4 4-4 4"
                stroke="currentColor" stroke-width="1.7"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </div>

    <div class="divider" aria-hidden="true"></div>

    <div class="bottom">
      <a href="/" class="bottom-logo" aria-label="Vantage Solutions home">
        <svg width="24" height="22" viewBox="0 0 200 180" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="footer-og" x1="36" y1="6" x2="100" y2="175"
                            gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stop-color="#FFA726"/>
              <stop offset="100%" stop-color="#E65100"/>
            </linearGradient>
          </defs>
          <polygon points="6,6 66,6 100,175 42,175" fill="url(#footer-og)"/>
          <polygon points="134,6 194,6 172,90 113,90" fill="#0F0F0F"/>
          <polygon points="110,108 167,108 158,175 100,175" fill="#0F0F0F"/>
        </svg>
        <span class="footer-wordmark">Vantage <strong>Solutions</strong></span>
      </a>

      <nav class="footer-nav" aria-label="Footer links">
        <a href="#services">Services</a>
        <a href="#free-tools">Free Tools</a>
        <a href="#raffle">Raffle</a>
        <a href="#follow">Follow</a>
      </nav>

      <p class="copy">© {new Date().getFullYear()} Vantage Solutions</p>
    </div>

  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--border);
    background: var(--bg);
    padding: 80px 0 40px;
  }

  /* ── CTA block ── */
  .cta-block {
    text-align: center;
    padding: 48px 0 64px;
  }

  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.1em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  h2 {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: clamp(40px, 7vw, 72px);
    letter-spacing: -0.04em;
    line-height: 1.06;
    color: var(--text);
    margin-bottom: 18px;
  }

  .sub {
    font-size: 17px;
    color: var(--text-sec);
    margin-bottom: 36px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    background: var(--accent);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 16px;
    padding: 15px 28px;
    border-radius: 8px;
    transition: background 0.15s, transform 0.15s;
  }

  .btn:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
  }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 32px;
  }

  /* ── Bottom bar ── */
  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  .bottom-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    color: var(--text);
  }

  .footer-wordmark {
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--text-sec);
  }

  .footer-wordmark strong {
    font-weight: 700;
    color: var(--text);
  }

  .footer-nav {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .footer-nav a {
    font-size: 13px;
    color: var(--text-muted);
    padding: 6px 12px;
    border-radius: 5px;
    transition: color 0.15s, background 0.15s;
  }

  .footer-nav a:hover {
    color: var(--text);
    background: var(--surface);
  }

  .copy {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
  }

  @media (max-width: 640px) {
    footer { padding: 56px 0 32px; }
    .bottom { flex-direction: column; align-items: flex-start; gap: 16px; }
    .footer-nav { display: none; }
  }
</style>
