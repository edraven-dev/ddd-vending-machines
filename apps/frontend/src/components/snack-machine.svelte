<script lang="ts">
  import { PUBLIC_API_HOST } from '$env/static/public';
  import type { HttpMethod } from '@sveltejs/kit';
  import axios from 'axios';

  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.baseURL = `${PUBLIC_API_HOST}/api/snack-machine`;

  export let moneyInserted: string;
  export let moneyInside: string;

  const callApi = async (method: HttpMethod, url: string, data?: any): Promise<void> => {
    const response = await axios.request({
      method,
      url,
      data,
    });

    moneyInserted = response.data.moneyInTransaction.amount;
    moneyInside = response.data.moneyInside.amount;
  };

  const insertMoney = (money: [number, number, number, number, number, number]) => {
    callApi('PUT', 'insert-money', { money });
  };

  const buySnack = () => {
    callApi('POST', 'buy-snack');
  };

  const returnMoney = () => {
    callApi('POST', 'return-money');
  };
</script>

<div class="bg-gray-700 shadow shadow-slate-500 rounded-md m-5 p-6 text-white">
  <div class="my-3">
    <button class="btn btn-blue w-full" on:click={buySnack}>Buy a snack</button>
  </div>
  <div class="my-3"><span>Money inserted:</span> <span>{moneyInserted}</span></div>
  <div class="my-3">
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
  <div class="my-3"><span>Money inside:</span> <span>{moneyInside}</span></div>
</div>
