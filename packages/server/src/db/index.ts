import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://nbagm:nbagm_dev@localhost:5432/nba_gm_simulator';

const useSSL = process.env.DATABASE_SSL === 'true' || (process.env.NODE_ENV === 'production' && !connectionString.includes('.railway.internal'));

const client = postgres(connectionString, {
  ssl: useSSL ? 'require' : false,
  max: parseInt(process.env.DB_POOL_SIZE || '20'),
});
export const db = drizzle(client, { schema });
export type Database = typeof db;
