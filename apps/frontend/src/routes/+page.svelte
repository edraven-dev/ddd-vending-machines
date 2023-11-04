<script lang="ts">
  import { title } from '$lib/title';
  import Icon from '@iconify/svelte';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="grid-cols-1 sm:grid md:grid-cols-3">
  <div
    class="mx-3 mt-6 flex flex-col rounded-lg bg-gray-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:shrink-0 sm:grow sm:basis-0"
  >
    <a href="#!">
      <Icon icon="eos-icons:cluster-management-outlined" class="mt-10 h-64 w-full text-neutral-300" />

      <div class="p-6">
        <h5 class="mb-2 text-xl text-center font-medium leading-tight text-neutral-50">Management</h5>
      </div>
    </a>
  </div>
  <div
    class="mx-3 mt-6 flex flex-col rounded-lg bg-gray-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:shrink-0 sm:grow sm:basis-0"
  >
    <a href="/snack-machine">
      <Icon icon="game-icons:vending-machine" class="mt-10 h-64 w-full text-neutral-300" />

      <div class="p-6">
        <h5 class="mb-2 text-xl text-center font-medium leading-tight text-neutral-50">Snack Machine</h5>
      </div>
    </a>
  </div>
  <div
    class="mx-3 mt-6 flex flex-col rounded-lg bg-gray-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:shrink-0 sm:grow sm:basis-0"
  >
    <a href="/atm">
      <Icon icon="map:atm" class="mt-10 h-64 w-full text-neutral-300" />

      <div class="p-6">
        <h5 class="mb-2 text-xl text-center font-medium leading-tight text-neutral-50">ATM</h5>
      </div>
    </a>
  </div>
</div>
