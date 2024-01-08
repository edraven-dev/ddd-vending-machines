<script lang="ts">
  import { page } from '$app/stores';
  import Nav from './nav.svelte';
  let subpage = '';
  let componentName = '';
  page.subscribe((value) => {
    subpage = value.url.pathname;
    componentName = (function () {
      switch (value.url.pathname) {
        case '/atm':
          return 'ATM';
        case '/snack-machine':
          return 'Snack Machine';
        default:
          return 'Management';
      }
    })();
  });
</script>

<header class="mb-10">
  <Nav {subpage} {componentName} />
  <h1 class="text-4xl font-bold">
    {componentName}
  </h1>
</header>
