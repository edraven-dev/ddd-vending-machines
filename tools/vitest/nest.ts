import { defineConfig } from 'vitest/config';

/** Shared Vitest config for the NestJS apps and libs, merged by each package's vitest.config.ts. */
export default defineConfig({
  // Also read from tsconfig; explicit so Nest DI and MikroORM metadata never silently disappear.
  oxc: { decorator: { legacy: true, emitDecoratorMetadata: true } },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts', 'src/**/*.e2e-spec.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.module.ts', 'src/main.ts', 'src/**/index.ts', 'src/database/**', 'src/test/**'],
    },
  },
});
