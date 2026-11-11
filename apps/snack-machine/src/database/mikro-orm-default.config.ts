import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Migrator } from '@mikro-orm/migrations';
import type { Options } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';

const defaultConfig: Options = {
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName:
    process.env.NODE_ENV !== 'test' ? process.env.DB_NAME || 'vending_machines_snack' : 'vending_machines_snack_test',
  metadataProvider: ReflectMetadataProvider,
  extensions: [Migrator, SeedManager],
};

export default defaultConfig;
