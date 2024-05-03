<script lang="ts">
  // eslint-disable-next-line
  // @ts-nocheck
  import Icon from '@iconify/svelte';
  import type { HttpMethod } from '@sveltejs/kit';
  import axios from 'axios';
  import { failure, success } from '../utils/actions';

  const id = localStorage.getItem('id');
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.baseURL = `/api/snack-machine/${id}`;

  export let snackMachine: any; // eslint-disable-line

  const callApi = async (method: HttpMethod, url: string, data?: Record<string, unknown>): Promise<void> => {
    const response = await axios.request({
      method,
      url,
      data,
    });

    snackMachine = response.data;
  };

  const insertMoney = async (money: [number, number, number, number, number, number]) => {
    await callApi('PUT', 'insert-money', { money });
  };

  const buySnack = async (position: number) => {
    try {
      await callApi('POST', 'buy-snack', { position });
      success(`Snack bought!`);
    } catch (err: any) /* eslint-disable-line */ {
      failure(
        Array.isArray(err.response.data.message) ? err.response.data.message.join('\r\n') : err.response.data.message,
      );
    }
  };

  const returnMoney = async () => {
    try {
      await callApi('POST', 'return-money');
      success(`Money returned!`);
    } catch (err: any) /* eslint-disable-line */ {
      failure(err.response.data.message);
    }
  };
</script>

<main>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
    {#each snackMachine.slots.sort((a, b) => a.position - b.position) as slot, i (slot.id)}
      <div class="card bg-gray-800 p-4 rounded-lg">
        <div class="flex flex-col items-center">
          {#if slot.snackPile.snack.name === 'Chocolate'}
            <Icon icon="noto-v1:chocolate-bar" width="100" height="100" style="aspect-ratio:100/100;object-fit:cover" />
          {:else if slot.snackPile.snack.name === 'Soda'}
            <Icon icon="noto:bubble-tea" width="100" height="100" style="aspect-ratio:100/100;object-fit:cover" />
          {:else if slot.snackPile.snack.name === 'Gum'}
            <Icon icon="noto-v1:candy" width="100" height="100" style="aspect-ratio:100/100;object-fit:cover" />
          {/if}
          <p class="mb-2 text-white">{slot.snackPile.snack.name}</p>
          <p class="mb-2 text-white">{slot.snackPile.price}</p>
          <p class="mb-4 text-slate-300">Left: {slot.snackPile.quantity}</p>
          <button class="primary-btn mb-4" on:click={() => buySnack(i + 1)}>Buy</button>
        </div>
      </div>
    {/each}
  </div>
  <div class="mt-10">
    <div class="mb-10">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-gray-700 p-2 rounded-md">
          <p class="text-white text-center">Money Inside</p>
          <p class="text-white text-xl font-bold text-center">{snackMachine.moneyInside.amount}</p>
        </div>
        <div class="bg-gray-700 p-2 rounded-md">
          <p class="text-white text-center">Money Inserted</p>
          <p class="text-white text-xl font-bold text-center">{snackMachine.moneyInTransaction.amount}</p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-2 mb-2">
      <button class="secondary-btn" on:click={() => insertMoney([1, 0, 0, 0, 0, 0])}> Insert ¢1 </button>
      <button class="secondary-btn" on:click={() => insertMoney([0, 1, 0, 0, 0, 0])}> Insert ¢10 </button>
      <button class="secondary-btn" on:click={() => insertMoney([0, 0, 1, 0, 0, 0])}> Insert ¢25 </button>
    </div>
    <div class="grid grid-cols-3 gap-2 mb-4">
      <button class="secondary-btn" on:click={() => insertMoney([0, 0, 0, 1, 0, 0])}> Insert $1 </button>
      <button class="secondary-btn" on:click={() => insertMoney([0, 0, 0, 0, 1, 0])}> Insert $5 </button>
      <button class="secondary-btn" on:click={() => insertMoney([0, 0, 0, 0, 0, 1])}> Insert $20 </button>
    </div>
    <button class="secondary-btn w-full" on:click={async () => await returnMoney()}> Return Money </button>
  </div>
</main>
