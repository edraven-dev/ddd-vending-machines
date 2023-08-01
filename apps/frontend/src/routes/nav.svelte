<script lang="ts">
  import { title } from '$lib/title';
  import Icon from '@iconify/svelte';
</script>

<nav class="bg-gradient-to-r from-cyan-500 to-blue-500">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <Icon icon="game-icons:vending-machine" class="h-8 w-8 text-gray-300" />
        </div>
        <div>
          <div class="ml-1 flex items-baseline space-x-4">
            <span class="text-gray-300 rounded-md px-3 py-2 text-lg font-medium">{title}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>
