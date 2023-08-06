import { LoadStrategy, MigrationObject } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { basename } from 'path';
import defaultConfig from './mikro-orm-default.config';

//#region
// to consider - build each migration as separate entry file: https://stackoverflow.com/a/61218909
let migrationsList: MigrationObject[];
if (process.env.NODE_ENV === 'test') {
  migrationsList = [];
}
// @ts-expect-error using webpack's require#context
const migrationsCtx = require.context('./migrations', false, /\.ts$/);
migrationsList = migrationsCtx
  .keys()
  .reduce((acc, key) => [...acc, { name: basename(key), class: Object.values(migrationsCtx(key))[0] }], []);
//#endregion

export default defineConfig({
  ...defaultConfig,
  debug: process.env.NODE_ENV !== 'production',
  discovery: { disableDynamicFileAccess: true },
  loadStrategy: LoadStrategy.JOINED,
  highlighter: new SqlHighlighter(),
  extensions: [Migrator, SeedManager],
  migrations: { migrationsList },
  // @ts-expect-error nestjs adapter options
  autoLoadEntities: true,
  registerRequestContext: false,
});
