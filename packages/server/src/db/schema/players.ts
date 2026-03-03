import { pgTable, serial, integer, varchar, real, index } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  nbaId: integer('nba_id').notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  draftYear: integer('draft_year'),
  draftRound: integer('draft_round'),
  draftNumber: integer('draft_number'),
  careerStartYear: integer('career_start_year').notNull(),
  careerEndYear: integer('career_end_year').notNull(),
  primaryPosition: varchar('primary_position', { length: 2 }),
});

export const playerSeasonStats = pgTable('player_season_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  season: varchar('season', { length: 10 }).notNull(), // e.g. "2023-24"
  gamesPlayed: integer('games_played').notNull(),
  ppg: real('ppg').notNull(),
  rpg: real('rpg').notNull(),
  apg: real('apg').notNull(),
  spg: real('spg').notNull(),
  bpg: real('bpg').notNull(),
  fgPct: real('fg_pct').notNull(),
  ftPct: real('ft_pct').notNull(),
  threePct: real('three_pct').notNull(),
  minutesPg: real('minutes_pg').notNull(),
}, (table) => [
  index('idx_player_season_stats_player_id').on(table.playerId),
]);
