<script>
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import '../app.css';
  import Header from './header.svelte';
  import Nav from './nav.svelte';

  const options = { pausable: true, reversed: true, intro: { y: 192 } };
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
<SvelteToast {options} />

<style>
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 8rem;
    --toastContainerLeft: calc(50vw - 8rem);
  }
</style>
