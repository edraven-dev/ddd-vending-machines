<script lang="ts">
  import type { HttpMethod } from '@sveltejs/kit';
  import axios from 'axios';
  import currency from 'currency.js';
  import { failure, success } from '../utils/actions';

  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.baseURL = '/api/atm';

  export let atm: any;
  let amount: number;

  const callApi = async (method: HttpMethod, url: string, data?: Record<string, unknown>): Promise<void> => {
    const response = await axios.request({
      method,
      url,
      data,
    });

    atm = response.data;
  };

  const takeMoney = async (amount: string) => {
    try {
      await callApi('POST', 'take-money', { amount });
      success(`Money withdrawn!`);
    } catch (err: any) {
      failure(err.response.data.message);
    }
  };
</script>

<div class="bg-gray-700 shadow shadow-slate-500 rounded-md m-5 p-6 text-white">
  <div class="my-3 text-center">
    <span class="mr-5">
      <span>Money inside:</span> <strong>{atm.moneyInside.amount}</strong>
    </span>
    <span class="ml-3">
      <span>Money charged:</span> <strong>{atm.moneyCharged.amount}</strong>
    </span>
  </div>
  <div>
    <input
      bind:value={amount}
      type="number"
      class="rounded-md p-2 w-full text-right text-neutral-600"
      placeholder="0.01"
    />
  </div>
  <div class="my-3">
    <button class="btn btn-blue w-full" on:click={() => takeMoney(new currency(amount).toString())}>Take money</button>
  </div>
</div>
