<script lang="ts">
  let email = '';
  let state: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  let errorMsg = '';

  function validate(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  async function handleSubmit() {
    if (!validate(email)) {
      errorMsg = 'Please enter a valid email address.';
      state = 'error';
      return;
    }

    state = 'loading';
    errorMsg = '';

    // TODO: replace with your actual endpoint (Cloudflare Worker / Formspree / etc.)
    await new Promise((r) => setTimeout(r, 800));

    // Swap to 'error' here if fetch fails
    state = 'success';
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  function clearError() {
    if (state === 'error') { state = 'idle'; errorMsg = ''; }
  }
</script>

<section id="raffle">
  <div class="container">
    <div class="inner">

      <div class="left">
        <p class="eyebrow">// Monthly Content Raffle</p>
        <h2>We'll Create Your Content.<br />Free. Once a Month.</h2>
        <div class="body-copy">
          <p>
            Each month, we pick one business at random to receive a free content package —
            5 to 10 pieces of marketing content, custom-built around your actual product or service.
            No charge, no catch.
          </p>
          <p>
            We study your business, find the angle, and create content designed to genuinely move
            the needle. If you like what we create, that's exactly the kind of work we can keep
            doing for you — at scale.
          </p>
        </div>
        <div class="perks">
          <div class="perk">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7l3 3 6-6" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>5–10 pieces of custom content</span>
          </div>
          <div class="perk">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7l3 3 6-6" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>No charge, no strings</span>
          </div>
          <div class="perk">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7l3 3 6-6" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Winner announced monthly</span>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="form-card">
          {#if state === 'success'}
            <div class="success-state" role="alert">
              <div class="success-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="var(--accent)" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3>You're in the draw.</h3>
              <p>We'll announce the winner at the start of next month. Good luck.</p>
            </div>
          {:else}
            <p class="form-label">Enter your email to join</p>
            <p class="form-sub">Winner announced monthly — no spam, ever.</p>

            <div class="input-wrap">
              <input
                type="email"
                bind:value={email}
                on:keydown={handleKey}
                on:input={clearError}
                placeholder="you@yourbusiness.com"
                autocomplete="email"
                aria-label="Email address"
                class:has-error={state === 'error'}
                disabled={state === 'loading'}
              />
            </div>

            {#if state === 'error' && errorMsg}
              <p class="error-msg" role="alert">{errorMsg}</p>
            {/if}

            <button
              on:click={handleSubmit}
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
    position: relative;
    overflow: hidden;
  }

  section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 80% 50%, rgba(129, 140, 248, 0.07) 0%, transparent 60%);
    pointer-events: none;
  }

  .inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    position: relative;
  }

  /* left */
  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--accent2);
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  h2 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: clamp(28px, 3.5vw, 44px);
    letter-spacing: -0.035em;
    line-height: 1.12;
    margin-bottom: 24px;
  }

  .body-copy {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 28px;
  }

  .body-copy p {
    font-size: 15px;
    line-height: 1.72;
    color: var(--text-sec);
  }

  .perks {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .perk {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-sec);
  }

  /* right — form card */
  .form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 40px 36px;
  }

  .form-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 20px;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .form-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 24px;
  }

  .input-wrap {
    margin-bottom: 10px;
  }

  input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    padding: 13px 16px;
    border-radius: 7px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  input::placeholder { color: var(--text-muted); }

  input:focus {
    border-color: var(--accent2);
    box-shadow: 0 0 0 3px var(--accent2-glow);
  }

  input.has-error {
    border-color: #EF4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
  }

  input:disabled { opacity: 0.5; cursor: not-allowed; }

  .error-msg {
    font-size: 12px;
    color: #EF4444;
    margin-bottom: 10px;
  }

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--accent2);
    color: #F8FAFC;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 15px;
    padding: 14px 20px;
    border-radius: 7px;
    margin-top: 4px;
    margin-bottom: 16px;
    transition: opacity 0.15s, transform 0.1s;
  }

  button:hover:not(:disabled) { opacity: 0.88; }
  button:active:not(:disabled) { transform: scale(0.99); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  button.loading { cursor: wait; }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(248, 250, 252, 0.3);
    border-top-color: #F8FAFC;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .disclaimer {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.6;
    text-align: center;
  }

  /* success state */
  .success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 16px 0;
  }

  .success-icon {
    width: 52px;
    height: 52px;
    background: var(--accent-glow);
    border: 1px solid rgba(34, 211, 238, 0.25);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  .success-state h3 {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.025em;
  }

  .success-state p {
    font-size: 14px;
    color: var(--text-sec);
    line-height: 1.65;
  }

  @media (max-width: 880px) {
    .inner { grid-template-columns: 1fr; gap: 48px; }
  }

  @media (max-width: 580px) {
    section { padding: 72px 0; }
    .form-card { padding: 28px 22px; }
  }
</style>
