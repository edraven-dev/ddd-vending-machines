import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html',
      assets: '../../dist/apps/frontend',
      pages: '../../dist/apps/frontend',
    }),
    alias: {
      $components: './src/components',
      '$components/*': './src/components/*',
    },
  },
};

export default config;
