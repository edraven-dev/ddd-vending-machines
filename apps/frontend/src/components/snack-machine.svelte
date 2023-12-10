<script lang="ts">
  // eslint-disable-next-line
  // @ts-nocheck
  import Icon from '@iconify/svelte';
  import type { HttpMethod } from '@sveltejs/kit';
  import axios from 'axios';
  import { failure, success } from '../utils/actions';

  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.baseURL = '/api/snack-machine';

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
      failure(err.response.data.message);
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

<div class="bg-gray-700 shadow shadow-slate-500 rounded-md m-5 p-6 text-white">
  <div>
    <div class="grid grid-cols-2 gap-2 my-3">
      <div>
        <div class="grid grid-cols-2 gap-y-2 gap-x-8 my-3">
          {#each snackMachine.slots.sort((a, b) => a.position - b.position) as slot (slot.id)}
            <div class="flex justify-end">
              {#if slot.snackPile.snack.name === 'Chocolate'}
                <Icon icon="noto-v1:chocolate-bar" class="h-20 w-20" />
              {:else if slot.snackPile.snack.name === 'Soda'}
                <Icon icon="noto:bubble-tea" class="h-20 w-20" />
              {:else if slot.snackPile.snack.name === 'Gum'}
                <Icon icon="noto-v1:candy" class="h-20 w-20" />
              {/if}
            </div>
            <div class="grid grid-cols-1 grid-rows-2">
              <div><strong>{slot.snackPile.price}</strong></div>
              <div><strong>{slot.snackPile.quantity}</strong> <span>left</span></div>
            </div>
          {/each}
        </div>
      </div>
      <div>
        <div class="grid grid-cols-3 gap-3 my-3">
          <button class="btn btn-blue w-full" on:click={() => buySnack(1)}>Buy #1</button>
          <button class="btn btn-blue w-full" on:click={() => buySnack(2)}>Buy #2</button>
          <button class="btn btn-blue w-full" on:click={() => buySnack(3)}>Buy #3</button>
        </div>
        <div class="my-3 text-center">
          <span>Money inserted:</span> <strong>{snackMachine.moneyInTransaction.amount}</strong>
        </div>
        <div class="grid grid-cols-3 gap-3 my-3">
          <button class="btn btn-blue" on:click={() => insertMoney([1, 0, 0, 0, 0, 0])}>Put ¢1</button>
          <button class="btn btn-blue" on:click={() => insertMoney([0, 1, 0, 0, 0, 0])}>Put ¢10</button>
          <button class="btn btn-blue" on:click={() => insertMoney([0, 0, 1, 0, 0, 0])}>Put ¢25</button>
          <button class="btn btn-blue" on:click={() => insertMoney([0, 0, 0, 1, 0, 0])}>Put $1</button>
          <button class="btn btn-blue" on:click={() => insertMoney([0, 0, 0, 0, 1, 0])}>Put $5</button>
          <button class="btn btn-blue" on:click={() => insertMoney([0, 0, 0, 0, 0, 1])}>Put $20</button>
        </div>
        <div class="my-3">
          <button class="btn btn-blue w-full" on:click={returnMoney}>Return money</button>
        </div>
      </div>
    </div>
  </div>
  <div class="my-3 text-center"><span>Money inside:</span> <strong>{snackMachine.moneyInside.amount}</strong></div>
</div>
