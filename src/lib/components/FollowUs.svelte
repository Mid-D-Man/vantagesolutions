<section id="follow">
  <div class="container">
    <p class="eyebrow">// Follow Along</p>
    <h2>Stay in the loop.</h2>
    <p class="sub">
      Tools, content drops, and business insights — follow us wherever you spend your time.
    </p>

    <div class="socials">

      <a href="https://x.com/VantageSolutions" target="_blank" rel="noopener noreferrer"
         class="social-link" aria-label="Follow on X (Twitter)">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3L9 9.5M9 9.5L3 15.5M9 9.5L15.5 3M9 9.5L15.5 15.5"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="label">
          <span class="name">X · Twitter</span>
          <span class="handle">@VantageSolutions</span>
        </span>
        <svg class="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </a>

      <a href="https://tiktok.com/@VantageSolutions" target="_blank" rel="noopener noreferrer"
         class="social-link" aria-label="Follow on TikTok">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M8 3v8.5a2.5 2.5 0 1 1-2-2.45" stroke="currentColor" stroke-width="1.7"
                  stroke-linecap="round"/>
            <path d="M8 7a5 5 0 0 0 4 2" stroke="currentColor" stroke-width="1.7"
                  stroke-linecap="round"/>
          </svg>
        </span>
        <span class="label">
          <span class="name">TikTok</span>
          <span class="handle">@VantageSolutions</span>
        </span>
        <svg class="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </a>

      <a href="https://instagram.com/VantageSolutions" target="_blank" rel="noopener noreferrer"
         class="social-link" aria-label="Follow on Instagram">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2.5" y="2.5" width="13" height="13" rx="4" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="13" cy="5" r="0.8" fill="currentColor"/>
          </svg>
        </span>
        <span class="label">
          <span class="name">Instagram</span>
          <span class="handle">@VantageSolutions</span>
        </span>
        <svg class="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </a>

      <a href="https://linkedin.com/company/vantage-solutions" target="_blank" rel="noopener noreferrer"
         class="social-link" aria-label="Follow on LinkedIn">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2.5" y="2.5" width="13" height="13" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M6 8v4.5M6 6v.01M9.5 12.5v-2.8c0-1 .6-1.7 1.5-1.7s1.5.7 1.5 1.7v2.8"
                  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="label">
          <span class="name">LinkedIn</span>
          <span class="handle">Vantage Solutions</span>
        </span>
        <svg class="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </a>

    </div>
  </div>
</section>

<style>
  section {
    padding: 112px 0;
    border-top: 1px solid var(--border);
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
    margin-bottom: 14px;
  }

  .sub {
    font-size: 16px;
    line-height: 1.7;
    color: var(--text-sec);
    max-width: 440px;
    margin-bottom: 52px;
  }

  .socials {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--border);
    max-width: 780px;
  }

  .social-link {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--surface);
    padding: 24px 28px;
    transition: background 0.15s;
  }

  .social-link:hover {
    background: var(--surface-2);
  }

  .social-link:hover .arrow {
    transform: translate(2px, -2px);
  }

  .icon {
    width: 42px;
    height: 42px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-sec);
    flex-shrink: 0;
    transition: color 0.15s, border-color 0.15s;
  }

  .social-link:hover .icon {
    color: var(--accent);
    border-color: rgba(34, 211, 238, 0.25);
  }

  .label {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
  }

  .name {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: var(--text);
  }

  .handle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
  }

  .arrow {
    color: var(--text-muted);
    flex-shrink: 0;
    transition: transform 0.15s, color 0.15s;
  }

  .social-link:hover .arrow { color: var(--accent); }

  @media (max-width: 620px) {
    section { padding: 72px 0; }
    .socials { grid-template-columns: 1fr; max-width: 100%; border-radius: 8px; }
  }
</style>
