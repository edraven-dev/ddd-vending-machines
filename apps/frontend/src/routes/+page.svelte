<script lang="ts">
  import Management from '$components/management.svelte';

  export let data;
  const { headOffice } = data;
</script>

<Management {headOffice} />
