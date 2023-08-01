/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/frontend',
  server: {
    fs: {
      allow: ['../..'],
    },
  },
  plugins: [
    sveltekit(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    coverage: {
      provider: 'istanbul',
      reportsDirectory: '../../coverage/apps/frontend',
    },
    reporters: ['default', 'junit'],
    outputFile: '../../test-results/apps/frontend/test-results.xml',
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
