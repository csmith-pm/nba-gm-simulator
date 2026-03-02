import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://nbagm:nbagm_dev@localhost:5432/nba_gm_simulator';

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});
export const db = drizzle(client, { schema });
export type Database = typeof db;
