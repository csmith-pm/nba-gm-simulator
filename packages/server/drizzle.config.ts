import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://nbagm:nbagm_dev@localhost:5432/nba_gm_simulator',
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  },
});
