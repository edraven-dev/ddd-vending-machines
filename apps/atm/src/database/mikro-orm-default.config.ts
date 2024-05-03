import { Options } from '@mikro-orm/postgresql';

const defaultConfig: Options = {
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.NODE_ENV !== 'test' ? process.env.DB_NAME || 'vending_machines_atm' : 'vending_machines_atm_test',
};

export default defaultConfig;
