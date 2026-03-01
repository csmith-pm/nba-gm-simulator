import { eq, and, sql, gte, lte, ilike, asc, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { drafts, draftParticipants, draftPicks } from '../db/schema/drafts.js';
import { players, playerSeasonStats } from '../db/schema/players.js';
import { users } from '../db/schema/users.js';
import { nanoid } from 'nanoid';
import type { DraftCriteria, Position, PlayerWithStats } from '@nba-gm/shared';
import { PICKS_PER_TEAM } from '@nba-gm/shared';

export async function createDraft(userId: number, name: string, criteria: DraftCriteria) {
  const shareCode = nanoid();

  const [draft] = await db.insert(drafts).values({
    name,
    createdBy: userId,
    criteria,
    shareCode,
  }).returning();

  // Creator is participant #1 (pick order 1)
  await db.insert(draftParticipants).values({
    draftId: draft.id,
    userId,
    pickOrder: 1,
  });

  return draft;
}

export async function joinDraft(draftId: number, userId: number) {
  // Count existing participants
  const existing = await db.select().from(draftParticipants).where(eq(draftParticipants.draftId, draftId));

  if (existing.some(p => p.userId === userId)) {
    return { alreadyJoined: true };
  }

  if (existing.length >= 2) {
    throw new Error('Draft is full');
  }

  await db.insert(draftParticipants).values({
    draftId,
    userId,
    pickOrder: existing.length + 1,
  });

  // If we now have 2 participants, start the draft
  if (existing.length + 1 === 2) {
    await db.update(drafts)
      .set({ status: 'drafting', currentPickNumber: 1 })
      .where(eq(drafts.id, draftId));
  }

  return { alreadyJoined: false };
}

export async function getDraftById(draftId: number) {
  const [draft] = await db.select().from(drafts).where(eq(drafts.id, draftId));
  return draft;
}

export async function getDraftByShareCode(shareCode: string) {
  const [draft] = await db.select().from(drafts).where(eq(drafts.shareCode, shareCode));
  return draft;
}

export async function getDraftParticipants(draftId: number) {
  return db
    .select({
      draftId: draftParticipants.draftId,
      userId: draftParticipants.userId,
      pickOrder: draftParticipants.pickOrder,
      displayName: users.displayName,
    })
    .from(draftParticipants)
    .innerJoin(users, eq(draftParticipants.userId, users.id))
    .where(eq(draftParticipants.draftId, draftId));
}

export async function getDraftPicks(draftId: number) {
  return db
    .select({
      draftId: draftPicks.draftId,
      userId: draftPicks.userId,
      playerId: draftPicks.playerId,
      pickNumber: draftPicks.pickNumber,
      assignedPosition: draftPicks.assignedPosition,
      playerName: players.name,
      primaryPosition: players.primaryPosition,
    })
    .from(draftPicks)
    .innerJoin(players, eq(draftPicks.playerId, players.id))
    .where(eq(draftPicks.draftId, draftId))
    .orderBy(asc(draftPicks.pickNumber));
}

// Snake draft: 1-2-2-1-2-2-1-2-2-1 for 2 players, 5 picks each
function getPickUserId(pickNumber: number, participants: { userId: number; pickOrder: number }[]): number {
  const round = Math.ceil(pickNumber / 2); // which round (1-5)
  const posInRound = ((pickNumber - 1) % 2) + 1; // 1 or 2 within the round

  // Snake: odd rounds go 1→2, even rounds go 2→1
  const isReversed = round % 2 === 0;
  const order = isReversed ? (3 - posInRound) : posInRound; // flip for even rounds

  return participants.find(p => p.pickOrder === order)!.userId;
}

export function getCurrentTurn(currentPickNumber: number, participants: { userId: number; pickOrder: number }[]) {
  if (currentPickNumber > PICKS_PER_TEAM * 2) return null;
  return {
    userId: getPickUserId(currentPickNumber, participants),
    pickNumber: currentPickNumber,
  };
}

export async function makePick(draftId: number, userId: number, playerId: number, position: Position) {
  const draft = await getDraftById(draftId);
  if (!draft || draft.status !== 'drafting') throw new Error('Draft is not active');

  const participants = await getDraftParticipants(draftId);
  const turn = getCurrentTurn(draft.currentPickNumber, participants);
  if (!turn || turn.userId !== userId) throw new Error('Not your turn');

  // Check player not already drafted
  const existingPicks = await getDraftPicks(draftId);
  if (existingPicks.some(p => p.playerId === playerId)) throw new Error('Player already drafted');

  // Check user hasn't already assigned this position
  const userPicks = existingPicks.filter(p => p.userId === userId);
  if (userPicks.some(p => p.assignedPosition === position)) throw new Error('Position already filled');

  await db.insert(draftPicks).values({
    draftId,
    userId,
    playerId,
    pickNumber: draft.currentPickNumber,
    assignedPosition: position,
  });

  const nextPick = draft.currentPickNumber + 1;
  const totalPicks = PICKS_PER_TEAM * 2;

  if (nextPick > totalPicks) {
    await db.update(drafts)
      .set({ status: 'complete', currentPickNumber: nextPick })
      .where(eq(drafts.id, draftId));
  } else {
    await db.update(drafts)
      .set({ currentPickNumber: nextPick })
      .where(eq(drafts.id, draftId));
  }

  return { pickNumber: draft.currentPickNumber, nextPick: nextPick > totalPicks ? null : nextPick };
}

export async function getPlayerPool(criteria: DraftCriteria, options: {
  search?: string;
  position?: Position;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  excludePlayerIds?: number[];
} = {}) {
  const { search, position, page = 1, limit = 25, sortBy = 'name', sortOrder = 'asc', excludePlayerIds = [] } = options;

  const conditions: any[] = [];

  if (criteria.activeYearRange) {
    conditions.push(lte(players.careerStartYear, criteria.activeYearRange.end));
    conditions.push(gte(players.careerEndYear, criteria.activeYearRange.start));
  }
  if (criteria.draftClassYear) {
    conditions.push(eq(players.draftYear, criteria.draftClassYear));
  }
  if (position) {
    conditions.push(eq(players.primaryPosition, position));
  }
  if (search) {
    conditions.push(ilike(players.name, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(players)
    .where(where);

  // Get players with career averages
  const offset = (page - 1) * limit;

  const result = await db
    .select({
      id: players.id,
      nbaId: players.nbaId,
      name: players.name,
      draftYear: players.draftYear,
      draftRound: players.draftRound,
      draftNumber: players.draftNumber,
      careerStartYear: players.careerStartYear,
      careerEndYear: players.careerEndYear,
      primaryPosition: players.primaryPosition,
      ppg: sql<number>`coalesce(avg(${playerSeasonStats.ppg}), 0)`,
      rpg: sql<number>`coalesce(avg(${playerSeasonStats.rpg}), 0)`,
      apg: sql<number>`coalesce(avg(${playerSeasonStats.apg}), 0)`,
      spg: sql<number>`coalesce(avg(${playerSeasonStats.spg}), 0)`,
      bpg: sql<number>`coalesce(avg(${playerSeasonStats.bpg}), 0)`,
      fgPct: sql<number>`coalesce(avg(${playerSeasonStats.fgPct}), 0)`,
      ftPct: sql<number>`coalesce(avg(${playerSeasonStats.ftPct}), 0)`,
      threePct: sql<number>`coalesce(avg(${playerSeasonStats.threePct}), 0)`,
      minutesPg: sql<number>`coalesce(avg(${playerSeasonStats.minutesPg}), 0)`,
      gamesPlayed: sql<number>`coalesce(sum(${playerSeasonStats.gamesPlayed}), 0)::int`,
    })
    .from(players)
    .leftJoin(playerSeasonStats, eq(players.id, playerSeasonStats.playerId))
    .where(where)
    .groupBy(players.id)
    .orderBy(sortOrder === 'asc' ? asc(players.name) : desc(players.name))
    .limit(limit)
    .offset(offset);

  return {
    data: result.map(r => ({
      id: r.id,
      nbaId: r.nbaId,
      name: r.name,
      draftYear: r.draftYear,
      draftRound: r.draftRound,
      draftNumber: r.draftNumber,
      careerStartYear: r.careerStartYear,
      careerEndYear: r.careerEndYear,
      primaryPosition: r.primaryPosition as Position | null,
      careerStats: {
        ppg: Number(r.ppg),
        rpg: Number(r.rpg),
        apg: Number(r.apg),
        spg: Number(r.spg),
        bpg: Number(r.bpg),
        fgPct: Number(r.fgPct),
        ftPct: Number(r.ftPct),
        threePct: Number(r.threePct),
        minutesPg: Number(r.minutesPg),
        gamesPlayed: Number(r.gamesPlayed),
      },
    })),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

export async function getUserDrafts(userId: number) {
  return db
    .select({
      id: drafts.id,
      name: drafts.name,
      status: drafts.status,
      createdAt: drafts.createdAt,
      shareCode: drafts.shareCode,
    })
    .from(drafts)
    .innerJoin(draftParticipants, eq(drafts.id, draftParticipants.draftId))
    .where(eq(draftParticipants.userId, userId))
    .orderBy(desc(drafts.createdAt));
}
