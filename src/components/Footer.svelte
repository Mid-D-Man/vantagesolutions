<footer id="contact">
  <div class="container">

    <div class="cta-block">
      <p class="eyebrow">// Ready?</p>
      <h2>Ready to build<br />something real?</h2>
      <p class="sub">
        Tell us what you need. We'll tell you how we can help.
      </p>
      <a href="mailto:hello@vantagesolutions.io" class="btn-cta">
        Get Started
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </div>

    <div class="divider" aria-hidden="true"></div>

    <div class="bottom">
      <div class="bottom-logo">
        <div class="logo-mark" aria-hidden="true">VS</div>
        <span class="wordmark">Vantage <span>Solutions</span></span>
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
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
    padding: 80px 0 40px;
    position: relative;
    overflow: hidden;
  }

  footer::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 300px;
    background: radial-gradient(ellipse at center bottom, rgba(34, 211, 238, 0.05) 0%, transparent 65%);
    pointer-events: none;
  }

  .cta-block {
    text-align: center;
    padding: 48px 0 60px;
    position: relative;
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
    font-weight: 800;
    font-size: clamp(36px, 6vw, 68px);
    letter-spacing: -0.04em;
    line-height: 1.06;
    margin-bottom: 18px;
  }

  .sub {
    font-size: 17px;
    color: var(--text-sec);
    margin-bottom: 36px;
  }

  .btn-cta {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    background: var(--accent);
    color: #080C14;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 16px;
    padding: 15px 28px;
    border-radius: 8px;
    transition: opacity 0.15s, transform 0.15s;
  }

  .btn-cta:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 32px;
  }

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
  }

  .logo-mark {
    width: 30px;
    height: 30px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 11px;
    color: var(--accent);
    letter-spacing: -0.04em;
  }

  .wordmark {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: -0.02em;
    color: var(--text-sec);
  }

  .wordmark span { color: var(--text); }

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
    background: rgba(255, 255, 255, 0.04);
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
