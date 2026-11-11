import './load-env';
import { defineConfig } from '@mikro-orm/postgresql';
import defaultConfig from './mikro-orm-default.config';

export default defineConfig({
  ...defaultConfig,
  debug: true,
  baseDir: import.meta.dirname,
  discovery: { warnWhenNoEntities: false },
  entities: ['.'],
  entitiesTs: ['../app/**/*.entity.ts'],
  migrations: {
    snapshotName: '.snapshot-vending_machines_snack',
    fileName: (timestamp: string, name?: string) => {
      if (!name) {
        throw new Error('Please specify migration name!');
      }
      return `Migration${timestamp}_${name}`;
    },
  },
  preferTs: true,
});
