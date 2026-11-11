import { existsSync } from 'node:fs';
import { join } from 'node:path';

// The MikroORM CLI no longer loads .env files, so load the app's .env like `node --env-file-if-exists=.env` does.
const envFile = join(import.meta.dirname, '../../.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);
