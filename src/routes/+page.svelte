<script lang="ts">
  import {
    Header,
    Hero,
    ImageGallery,
    WhatWeDo,
    FreeTools,
    Raffle,
    Articles,
    FollowUs,
    Footer,
  } from '$lib';

  export const prerender = true;
  export const trailingSlash = 'always';
</script>

<svelte:head>
  <title>Vantage Solutions — Turn Your Audience Into Income</title>
  <meta
    name="description"
    content="Vantage Solutions helps niche creators and solopreneurs monetize the audience they've already built — through outreach, offers, content, and the systems behind it."
  />
</svelte:head>

<Header />
<main>
  <Hero />
  <ImageGallery />
  <WhatWeDo />
  <FreeTools />
  <Raffle />
  <Articles />
  <FollowUs />
</main>
<Footer />
