<script lang="ts">
  import SnackMachine from '$components/snack-machine.svelte';
  import { title } from '$lib/title';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<SnackMachine />
