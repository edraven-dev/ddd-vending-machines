<script lang="ts">
  import SnackMachine from '$components/snack-machine.svelte';
  import { title } from '$lib/title';

  export let data;
  const { moneyInMachine } = data;
  const { moneyInTransaction, moneyInside } = moneyInMachine;
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<SnackMachine moneyInserted={moneyInTransaction.amount} moneyInside={moneyInside.amount} />
