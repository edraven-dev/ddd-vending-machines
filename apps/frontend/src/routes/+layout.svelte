<script>
  import { title } from '$lib/title';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import '../app.css';
  import Header from '../components/header.svelte';

  const options = { pausable: true, reversed: true, intro: { y: 192 } };
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="dark min-h-screen bg-black text-gray-200 p-10">
  <Header />
  <slot />
</div>
<SvelteToast {options} />

<style lang="postcss">
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 8rem;
    --toastContainerLeft: calc(50vw - 8rem);
  }
</style>
