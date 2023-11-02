<script lang="ts">
  import SnackMachine from '$components/snack-machine.svelte';
  import { title } from '$lib/title';

  export let data;
  const { snackMachine } = data;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<SnackMachine {snackMachine} />
