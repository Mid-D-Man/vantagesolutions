<header>
  <div class="container">
    <a href="/" class="logo" aria-label="Vantage Solutions home">
      <div class="logo-mark">VS</div>
      <span class="wordmark">Vantage <span>Solutions</span></span>
    </a>
    <nav>
      <a href="#services">Services</a>
      <a href="#free-tools">Free Tools</a>
      <a href="#contact" class="btn-cta">Get Started</a>
    </nav>
  </div>
</header>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(8, 12, 20, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 68px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-mark {
    width: 34px;
    height: 34px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 13px;
    color: var(--accent);
    letter-spacing: -0.04em;
    flex-shrink: 0;
  }

  .wordmark {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: -0.025em;
  }

  .wordmark span { color: var(--accent); }

  nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  nav a {
    color: var(--text-sec);
    font-size: 14px;
    padding: 8px 14px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
  }

  nav a:hover:not(.btn-cta) {
    color: var(--text);
    background: rgba(255, 255, 255, 0.04);
  }

  .btn-cta {
    background: var(--accent);
    color: #080C14 !important;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    margin-left: 6px;
    transition: opacity 0.15s !important;
  }

  .btn-cta:hover { opacity: 0.85; background: var(--accent); }

  @media (max-width: 640px) {
    nav a:not(.btn-cta) { display: none; }
    .wordmark { font-size: 15px; }
  }
</style>
