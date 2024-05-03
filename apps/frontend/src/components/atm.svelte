<script lang="ts">
  import type { HttpMethod } from '@sveltejs/kit';
  import axios from 'axios';
  import currency from 'currency.js';
  import { failure, success } from '../utils/actions';

  const id = localStorage.getItem('id');
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.baseURL = `/api/atm/${id}`;

  export let atm: any; // eslint-disable-line
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
    } catch (err: any) /* eslint-disable-line */ {
      failure(err.response.data.message);
    }
  };
</script>

<main>
  <div class="card bg-gray-800 p-4 rounded-lg">
    <div class="flex flex-col items-center">
      <div class="mb-10">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-700 p-2 rounded-md">
            <p class="text-white text-center">Money Inside</p>
            <p class="text-white text-xl font-bold text-center">{atm.moneyInside.amount}</p>
          </div>
          <div class="bg-gray-700 p-2 rounded-md">
            <p class="text-white text-center">Money Charged</p>
            <p class="text-white text-xl font-bold text-center">{atm.moneyCharged.amount}</p>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label for="amount" class="block text-sm font-medium text-white">Enter Amount</label>
        <input
          id="amount"
          class="take-money-input"
          placeholder="Enter amount here..."
          type="number"
          name="amount"
          bind:value={amount}
        />
      </div>
      <button
        class="primary-btn w-full"
        on:click={async () => await takeMoney(new currency(amount).format({ symbol: '' }))}
      >
        Take Money
      </button>
    </div>
  </div>
</main>
