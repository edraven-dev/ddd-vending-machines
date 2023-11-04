<script lang="ts">
  import Atm from '$components/atm.svelte';

  export let data;
  const { atm } = data;
</script>

<Atm {atm} />
