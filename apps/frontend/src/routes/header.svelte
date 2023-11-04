<script lang="ts">
  import { page } from '$app/stores';
  let subpage = '';
  page.subscribe((value) => {
    subpage = value.url.pathname;
  });
</script>

<header class="bg-gray-900 shadow">
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold tracking-tight text-gray-100">
      <a href="/">Home</a>
      {#if subpage !== '/'}
        / {subpage
          .slice(1)
          .split('-')
          .map((word) => (word === 'atm' ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
          .join(' ')}
      {/if}
    </h1>
  </div>
</header>
