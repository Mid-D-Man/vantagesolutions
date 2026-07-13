<script>
  export let title = 'Welcome';
</script>

<section class="hero">
  <h1>{title}</h1>
  <slot />
</section>

<style>
  .hero { padding: 4rem 2rem; text-align: center; }
</style>
