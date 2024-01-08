<script lang="ts">
  import Management from '$components/management.svelte';
  import { title } from '$lib/title';

  export let data;
  const { headOffice } = data;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Management {headOffice} />
