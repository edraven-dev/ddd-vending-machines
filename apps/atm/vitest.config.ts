import { defineConfig, mergeConfig } from 'vitest/config';
import nest from '../../tools/vitest/nest.ts';

export default mergeConfig(nest, defineConfig({ test: { name: 'atm' } }));
