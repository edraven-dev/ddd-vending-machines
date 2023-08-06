import { defineConfig } from '@mikro-orm/postgresql';
import defaultConfig from './mikro-orm-default.config';

export default defineConfig({
  ...defaultConfig,
  debug: true,
  baseDir: __dirname,
  entities: ['.'],
  entitiesTs: ['../app/**/*.entity.ts'],
  migrations: {
    fileName: (timestamp: string, name?: string) => {
      if (!name) {
        throw new Error('Please specify migration name!');
      }
      return `Migration${timestamp}_${name}`;
    },
  },
  tsNode: true,
});
