import { LoadStrategy, type MigrationObject } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { basename } from 'node:path';
import defaultConfig from './mikro-orm-default.config';

// The migrations are bundled into the app: tsdown and Vitest both resolve import.meta.glob at build time.
const migrations = import.meta.glob<Record<string, MigrationObject['class']>>('./migrations/Migration*.ts', {
  eager: true,
});
const migrationsList: MigrationObject[] = Object.keys(migrations)
  .sort()
  .map((path) => ({ name: basename(path, '.ts'), class: Object.values(migrations[path])[0] }));

export default defineConfig({
  ...defaultConfig,
  debug: process.env.NODE_ENV === 'development',
  discovery: { warnWhenNoEntities: false },
  loadStrategy: LoadStrategy.JOINED,
  highlighter: new SqlHighlighter(),
  migrations: { migrationsList },
  allowGlobalContext: true,
});
