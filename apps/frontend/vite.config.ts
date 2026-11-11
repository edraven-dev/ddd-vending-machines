/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/atm': {
        target: 'http://localhost:3100',
        changeOrigin: true,
      },
      '/api/management': {
        target: 'http://localhost:3200',
        changeOrigin: true,
      },
      '/api/snack-machine': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    sveltekit(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './coverage',
    },
    reporters: ['default', 'junit'],
    outputFile: './test-results/test-results.xml',
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
