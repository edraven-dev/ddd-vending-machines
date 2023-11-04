<script lang="ts">
  import SnackMachine from '$components/snack-machine.svelte';

  export let data;
  const { snackMachine } = data;
</script>

<SnackMachine {snackMachine} />
