# NBA GM Simulator

Multiplayer web-based NBA GM draft simulator. Draft 5 historical NBA players, assign positions, simulate a best-of-7 Finals series.

## Tech Stack
- **Monorepo**: pnpm workspaces
- **Frontend**: Vue 3 + Vite + TypeScript + PrimeVue (Aura theme) + Pinia + Vue Router v4
- **Backend**: Fastify + TypeScript
- **ORM/DB**: Drizzle ORM + postgres-js → PostgreSQL 16 (docker-compose)
- **Validation**: Zod (shared package)
- **Auth**: Email/password (bcrypt + JWT httpOnly cookies)
- **Testing**: Vitest
- **Data**: Python `nba_api` scripts for player data ingestion

## Project Structure
```
packages/shared/   — Types, Zod schemas, constants (positions, simulation constants)
packages/server/   — Fastify API (routes, services, db schema, middleware)
packages/client/   — Vue 3 SPA (views, components, stores, API client)
scripts/           — Python data ingestion (nba_api → Postgres)
```

## Commands
- `npx pnpm install` — install all deps
- `npx pnpm dev` — run server + client concurrently
- `npx pnpm dev:server` / `npx pnpm dev:client` — run individually
- `npx pnpm db:generate` — generate Drizzle migrations
- `npx pnpm db:migrate` — run migrations
- `docker compose up -d` — start PostgreSQL 16
- `pip install -r scripts/requirements.txt && python scripts/ingest_players.py` — ingest player data

## Database
- Connection: `postgresql://nbagm:nbagm_dev@localhost:5432/nba_gm_simulator`
- Tables: users, players, player_season_stats, drafts, draft_participants, draft_picks, series, series_games
- Schema defined in `packages/server/src/db/schema/`

## Key Design Decisions
- Snake draft order (1-2-2-1...) for 2-player drafts
- 5 picks per team, one per position (PG/SG/SF/PF/C)
- Simulation uses career average stats with position fit bonuses/penalties
- Home court pattern: 2-2-1-1-1 for best-of-7
- Polling (3s interval) for real-time draft updates (SSE upgrade planned)
- Draft share codes use nanoid

## Current Status
- Phase 1-6 scaffolded: project structure, shared types, DB schema, server routes/services, client views/stores, Python ingestion script
- Next: `npx pnpm install`, run docker-compose, generate+run migrations, ingest data, verify end-to-end flow
