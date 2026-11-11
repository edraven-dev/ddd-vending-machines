<script lang="ts">
  import { page } from '$app/state';
  import Nav from './nav.svelte';

  const subpage = $derived(page.url.pathname);
  const componentName = $derived.by(() => {
    switch (page.url.pathname) {
      case '/atm':
        return 'ATM';
      case '/snack-machine':
        return 'Snack Machine';
      default:
        return 'Management';
    }
  });
</script>

<header class="mb-10">
  <Nav {subpage} {componentName} />
  <h1 class="text-4xl font-bold">
    {componentName}
  </h1>
</header>
