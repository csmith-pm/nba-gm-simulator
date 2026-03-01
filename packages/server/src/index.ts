import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { draftRoutes } from './routes/drafts.js';
import { seriesRoutes } from './routes/series.js';

const app = Fastify({ logger: true });

await app.register(cookie);
await app.register(cors, {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
});

await app.register(authRoutes);
await app.register(draftRoutes);
await app.register(seriesRoutes);

const port = parseInt(process.env.PORT || '3000');

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Server running on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
