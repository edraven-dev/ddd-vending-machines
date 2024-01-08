<script lang="ts">
  export let subpage: string;
  export let componentName: string;
</script>

<nav class="mb-4">
  <ul class="flex space-x-2 text-sm">
    <li>
      <a class="text-gray-400 hover:text-white" href="/" rel="ugc">Home</a>
    </li>
    {#if subpage !== '/'}
      <li>/</li>
      <li>
        <a class="text-gray-400 hover:text-white" href={subpage} rel="ugc">
          {componentName}
        </a>
      </li>
    {/if}
  </ul>
</nav>
