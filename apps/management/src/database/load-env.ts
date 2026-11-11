import { existsSync } from 'node:fs';
import { join } from 'node:path';

const envFile = join(import.meta.dirname, '../../.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);
