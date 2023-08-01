<script>
  import '../app.css';
  import Header from './header.svelte';
  import Nav from './nav.svelte';
</script>

<div class="min-h-full">
  <Nav />
  <Header />
  <main>
    <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <slot />
    </div>
  </main>
</div>
