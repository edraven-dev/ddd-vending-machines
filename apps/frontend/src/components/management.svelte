<script lang="ts">
  import axios from 'axios';
  axios.defaults.baseURL = `/api`;

  export let headOffice: any; // eslint-disable-line

  let atm: any; // eslint-disable-line
  let snackMachine:
    | { moneyInside: { amount: string }; slots: { position: number; snackPile: { quantity: number } }[] }
    | undefined;

  const getHeadOffice = async (): Promise<void> => {
    const response = await axios.get(`/management/${headOffice.id}`);
    headOffice = response.data;
  };

  const getAtm = async (): Promise<void> => {
    resetData();
    const response = await axios.get(`/atm/${headOffice.id}`);
    atm = response.data;
  };

  const getSnackMachine = async (): Promise<void> => {
    resetData();
    const response = await axios.get(`/snack-machine/${headOffice.id}`);
    snackMachine = response.data;
  };

  const resetData = (): void => {
    atm = undefined;
    snackMachine = undefined;
  };

  const loadCashToAtm = async (): Promise<void> => {
    await axios.post(`management/${headOffice.id}/load-cash-to-atm`);
    await Promise.all([getAtm(), getHeadOffice()]);
  };

  const unloadCashFromSnackMachine = async (): Promise<void> => {
    await axios.post(`management/${headOffice.id}/unload-cash-from-snack-machine`);
    await Promise.all([getSnackMachine(), getHeadOffice()]);
  };

  const loadSnacks = async (position: number): Promise<void> => {
    await axios.patch(`snack-machine/${headOffice.id}/load-snacks`, { position, quantity: 10 });
    await getSnackMachine();
  };
</script>

<main>
  <div class="card bg-gray-800 p-4 rounded-lg">
    <div class="flex flex-col items-center">
      <div class="mb-10">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-700 p-2 rounded-md">
            <p class="text-white text-center">Balance</p>
            <p class="text-white text-xl font-bold text-center">{headOffice.balance.amount}</p>
          </div>
          <div class="bg-gray-700 p-2 rounded-md">
            <p class="text-white text-center">Cash</p>
            <p class="text-white text-xl font-bold text-center">{headOffice.cash.amount}</p>
          </div>
        </div>
      </div>
      <div class="mb-4 w-full flex space-x-4">
        <div class="w-1/2">
          <h2 class="text-lg font-bold text-white mb-2">ATMs</h2>
          <ul class="bg-gray-700 p-2 rounded-md text-white divide-y divide-gray-600">
            <li>
              <button
                tabindex="0"
                class="w-full text-left focus:outline-none focus:bg-gray-600 p-2 rounded-md"
                on:click={async () => await getAtm()}>ATM 1</button
              >
            </li>
            <li class="cursor-not-allowed">
              <button
                tabindex="0"
                disabled
                class="w-full text-left focus:outline-none focus:bg-gray-600 p-2 rounded-md disabled:pointer-events-none disabled:opacity-50"
                >Add ATM...</button
              >
            </li>
          </ul>
        </div>
        <div class="w-1/2">
          <h2 class="text-lg font-bold text-white mb-2">Snack Machines</h2>
          <ul class="bg-gray-700 p-2 rounded-md text-white divide-y divide-gray-600">
            <li>
              <button
                tabindex="0"
                class="w-full text-left focus:outline-none focus:bg-gray-600 p-2 rounded-md"
                on:click={async () => await getSnackMachine()}>Snack Machine 1</button
              >
            </li>
            <li class="cursor-not-allowed">
              <button
                tabindex="0"
                disabled
                class="w-full cursor-not-allowed text-left focus:outline-none focus:bg-gray-600 p-2 rounded-md disabled:pointer-events-none disabled:opacity-50"
                >Add Snack Machine...</button
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="mb-4 w-full">
        <h2 class="text-lg font-bold text-white mb-2">Machine Info</h2>
        <div class="bg-gray-700 p-2 rounded-md text-white">
          {#if !atm && !snackMachine}
            <p class="text-slate-400">Select a machine to view info...</p>
          {:else if atm}
            <table class="w-full text-left">
              <thead>
                <tr>
                  <th class="text-white">Name</th>
                  <th class="text-white">Money Inside</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ATM 1</td>
                  <td>{atm.moneyInside.amount}</td>
                </tr>
              </tbody>
            </table>
            <hr class="my-4 bg-gray-600 border-gray-600" />
            <div class="flex space-x-2 mt-2">
              <a href="/atm" class="primary-btn w-1/2">Go to ATM</a>
              <button class="primary-btn w-1/2" on:click={async () => await loadCashToAtm()}>Load cash</button>
            </div>
          {:else if snackMachine}
            <table class="w-full text-left">
              <thead>
                <tr>
                  <th class="text-white">Name</th>
                  <th class="text-white">Money Inside</th>
                  <th class="text-white">Slot #1 quantity</th>
                  <th class="text-white">Slot #2 quantity</th>
                  <th class="text-white">Slot #3 quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Snack Machine 1</td>
                  <td>{snackMachine.moneyInside.amount}</td>
                  <td>{snackMachine.slots.find((slot) => slot.position === 1)?.snackPile.quantity}</td>
                  <td>{snackMachine.slots.find((slot) => slot.position === 2)?.snackPile.quantity}</td>
                  <td>{snackMachine.slots.find((slot) => slot.position === 3)?.snackPile.quantity}</td>
                </tr>
              </tbody>
            </table>
            <hr class="my-4 bg-gray-600 border-gray-600" />
            <div class="flex space-x-2 mt-2">
              <a href="/snack-machine" class="primary-btn w-1/5">Go to Snack Machine</a>
              <button class="primary-btn w-1/5" on:click={async () => await unloadCashFromSnackMachine()}
                >Unload cash</button
              >
              <button class="primary-btn w-1/5" on:click={async () => await loadSnacks(1)}
                >Load snacks into slot #1</button
              >
              <button class="primary-btn w-1/5" on:click={async () => await loadSnacks(2)}
                >Load snacks into slot #2</button
              >
              <button class="primary-btn w-1/5" on:click={async () => await loadSnacks(3)}
                >Load snacks into slot #3</button
              >
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>
