<header>
  <div class="container">
    <a href="/" class="logo" aria-label="Vantage Solutions home">
      <!--
        V-mark SVG: orange-gradient left arm + dark right arm (two pieces with diagonal cut).
        Right arm uses currentColor so it adapts: set color:#0F0F0F on light bg,
        color:#fff if ever used on dark surface.
      -->
      <svg
        class="mark"
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="vs-og" x1="36" y1="6" x2="100" y2="175"
                          gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stop-color="#FFA726"/>
            <stop offset="100%" stop-color="#E65100"/>
          </linearGradient>
        </defs>
        <!-- Left arm — orange gradient parallelogram -->
        <polygon points="6,6 66,6 100,175 42,175" fill="url(#vs-og)"/>
        <!-- Right arm — upper piece (dark, adapts via currentColor) -->
        <polygon points="134,6 194,6 172,90 113,90" fill="currentColor"/>
        <!-- Right arm — lower piece -->
        <polygon points="110,108 167,108 158,175 100,175" fill="currentColor"/>
      </svg>

      <div class="wordmark">
        <span class="wm-top">VANTAGE</span>
        <span class="wm-btm">SOLUTIONS</span>
      </div>
    </a>

    <nav aria-label="Main navigation">
      <a href="/#services">Services</a>
      <a href="/#free-tools">Free Tools</a>
      <a href="/#articles">Articles</a>
      <a href="/#contact" class="cta">Get Started</a>
    </nav>
  </div>
</header>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(18, 18, 18, 0.88);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 68px;
  }

  /* ── Logo ── */
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text); /* currentColor for right arm */
  }

  .mark {
    width: 30px;
    height: 27px;
    flex-shrink: 0;
  }

  .wordmark {
    display: flex;
    flex-direction: column;
    line-height: 1;
    gap: 2px;
  }

  .wm-top {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0.06em;
    color: var(--text);
  }

  .wm-btm {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    color: var(--accent);
  }

  /* ── Nav ── */
  nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  nav a {
    font-size: 14px;
    color: var(--text-sec);
    padding: 8px 14px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
  }

  nav a:hover:not(.cta) {
    color: var(--text);
    background: var(--surface);
  }

  .cta {
    background: var(--accent);
    color: #fff !important;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    margin-left: 8px;
    transition: background 0.15s !important;
  }

  .cta:hover { background: var(--accent-dark) !important; }

  @media (max-width: 640px) {
    nav a:not(.cta) { display: none; }
  }
</style>
