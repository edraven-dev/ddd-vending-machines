import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Migrator } from '@mikro-orm/migrations';
import type { Options } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';

// Shared by the app and CLI configs.
const defaultConfig: Options = {
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName:
    process.env.NODE_ENV !== 'test'
      ? process.env.DB_NAME || 'vending_machines_event_store'
      : 'vending_machines_event_store_test',
  // The legacy decorators get property types from emitted decorator metadata, which MikroORM 7 ignores by default.
  metadataProvider: ReflectMetadataProvider,
  extensions: [Migrator, SeedManager],
};

export default defaultConfig;
