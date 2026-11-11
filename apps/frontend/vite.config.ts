import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

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
  ssr: {
    // Kit 3's server runtime imports cookie@2, but the hoisted node_modules/cookie is express's CommonJS 0.7.
    // Vite would leave the import external (it resolves from the app root), so the build-time route analysis
    // and fallback rendering would load the wrong copy; bundling makes Vite resolve Kit's own cookie@2.
    noExternal: ['cookie'],
  },
  plugins: [
    // SvelteKit 3 no longer reads svelte.config.js: Kit options and vite-plugin-svelte options go here
    sveltekit({
      adapter: adapter({ fallback: 'index.html' }),
      preprocess: vitePreprocess(),
    }),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      // Vitest 4+ only reports files the tests import unless coverage.include is set
      include: ['src/**/*.{ts,svelte}'],
    },
  },
});
