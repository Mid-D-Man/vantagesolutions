<script lang="ts">
  let email = '';
  let state: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  let errorMsg = '';

  function valid(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  async function submit() {
    if (!valid(email)) {
      errorMsg = 'Please enter a valid email address.';
      state = 'error';
      return;
    }
    state = 'loading';
    errorMsg = '';
    // TODO: wire to Cloudflare Worker / Formspree endpoint
    await new Promise(r => setTimeout(r, 800));
    state = 'success';
  }

  function onKey(e: KeyboardEvent) { if (e.key === 'Enter') submit(); }
  function clearErr() { if (state === 'error') { state = 'idle'; errorMsg = ''; } }
</script>

<section id="raffle">
  <div class="container">
    <div class="inner">

      <!-- ── Left copy ── -->
      <div class="copy">
        <p class="eyebrow">// Monthly Content Raffle</p>

        <h2>We'll Create Your Content.<br />Free. Once a Month.</h2>

        <div class="body-copy">
          <p>
            Each month, we pick one business at random to receive a free package of
            5 to 10 pieces of marketing content and scripts, custom-built around
            your actual product or service. No charge, no catch.
          </p>
          <p>
            We study your business, find the angle, and create content designed to
            genuinely move the needle. If you like what we create, that's exactly
            the kind of work we can keep doing for you — at scale.
          </p>
        </div>

        <ul class="perks" aria-label="What's included">
          <li>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8l3 3 7-7" stroke="var(--accent)" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            5–10 pieces of custom content &amp; scripts
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8l3 3 7-7" stroke="var(--accent)" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            No charge, no strings attached
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8l3 3 7-7" stroke="var(--accent)" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Winner announced monthly
          </li>
        </ul>
      </div>

      <!-- ── Right form ── -->
      <div class="form-side">
        <div class="form-card">
          {#if state === 'success'}
            <div class="success" role="alert">
              <div class="success-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 14l6 6L23 8" stroke="var(--accent)" stroke-width="2.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3>You're in the draw.</h3>
              <p>We'll announce the winner at the start of next month. Good luck.</p>
            </div>

          {:else}
            <p class="form-heading">Enter Your Email</p>
            <p class="form-sub">Winner Announced Monthly — no spam, ever.</p>

            <div class="field">
              <input
                type="email"
                bind:value={email}
                on:keydown={onKey}
                on:input={clearErr}
                placeholder="you@yourbusiness.com"
                autocomplete="email"
                aria-label="Email address"
                class:has-error={state === 'error'}
                disabled={state === 'loading'}
              />
              {#if state === 'error' && errorMsg}
                <p class="err" role="alert">{errorMsg}</p>
              {/if}
            </div>

            <button
              on:click={submit}
              disabled={state === 'loading'}
              class:loading={state === 'loading'}
            >
              {#if state === 'loading'}
                <span class="spinner" aria-hidden="true"></span>
                Entering…
              {:else}
                Enter the Raffle
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M3 7.5h9M8.5 3.5l4 4-4 4"
                        stroke="currentColor" stroke-width="1.6"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              {/if}
            </button>

            <p class="disclaimer">
              By entering you agree to receive occasional emails from Vantage Solutions.
              Unsubscribe any time.
            </p>
          {/if}
        </div>
      </div>

    </div>
  </div>
</section>

<style>
  section {
    padding: 112px 0;
    border-top: 1px solid var(--border);
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }

  /* Subtle orange tint bottom-right */
  section::after {
    content: '';
    position: absolute;
    bottom: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(245,124,0,0.06) 0%, transparent 60%);
    pointer-events: none;
  }

  .inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  /* ── Eyebrow — LARGER and more visible as requested ── */
  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;             /* was 11px */
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  /* ── Headline — bigger ── */
  h2 {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: clamp(32px, 4vw, 52px);
    letter-spacing: -0.04em;
    line-height: 1.08;
    color: var(--text);
    margin-bottom: 28px;
  }

  /* ── Body copy — larger and higher contrast ── */
  .body-copy {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }

  .body-copy p {
    font-size: 17px;            /* was 15px */
    line-height: 1.75;
    color: var(--text-sec);
  }

  /* ── Perks ── */
  .perks {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .perks li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;            /* was 14px */
    color: var(--text-sec);
    font-weight: 500;
  }

  /* ── Form card ── */
  .form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 44px 40px;
  }

  .form-heading {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 6px;
  }

  .form-sub {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 28px;
  }

  .field { margin-bottom: 14px; }

  input {
    width: 100%;
    background: var(--bg);
    border: 1.5px solid var(--border);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    padding: 14px 16px;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  input::placeholder { color: var(--text-muted); }

  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  input.has-error {
    border-color: #DC2626;
    box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
  }

  input:disabled { opacity: 0.5; cursor: not-allowed; }

  .err {
    font-size: 13px;
    color: #DC2626;
    margin-top: 7px;
  }

  /* ── Submit button ── */
  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    background: var(--accent);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 16px;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 18px;
    transition: background 0.15s, transform 0.1s;
  }

  button:hover:not(:disabled) { background: var(--accent-dark); }
  button:active:not(:disabled) { transform: scale(0.99); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  button.loading { cursor: wait; }

  .spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .disclaimer {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.6;
    text-align: center;
  }

  /* ── Success state ── */
  .success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 14px;
    padding: 20px 0;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    background: var(--accent-glow);
    border: 1px solid rgba(245,124,0,0.25);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
  }

  .success h3 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 24px;
    letter-spacing: -0.025em;
    color: var(--text);
  }

  .success p {
    font-size: 15px;
    color: var(--text-sec);
    line-height: 1.65;
  }

  /* ── Responsive ── */
  @media (max-width: 880px) {
    .inner { grid-template-columns: 1fr; gap: 48px; }
  }

  @media (max-width: 580px) {
    section { padding: 72px 0; }
    .form-card { padding: 30px 22px; }
  }
</style>
