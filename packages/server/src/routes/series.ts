import type { FastifyInstance } from 'fastify';
import { authGuard } from '../middleware/auth.js';
import * as seriesService from '../services/series.js';
import * as draftService from '../services/draft.js';

function parseId(raw: string): number {
  const id = parseInt(raw, 10);
  if (Number.isNaN(id)) throw { statusCode: 400, message: 'Invalid ID parameter' };
  return id;
}

export async function seriesRoutes(app: FastifyInstance) {
  // Start a series (simulate immediately)
  app.post<{ Params: { draftId: string } }>(
    '/api/drafts/:draftId/series',
    { preHandler: authGuard },
    async (request, reply) => {
      const draftId = parseId(request.params.draftId);
      const draft = await draftService.getDraftById(draftId);
      if (!draft) return reply.status(404).send({ error: 'Not found', message: 'Draft not found' });
      if (draft.status !== 'complete') {
        return reply.status(400).send({ error: 'Bad request', message: 'Draft must be complete' });
      }

      const participants = await draftService.getDraftParticipants(draftId);
      if (participants.length !== 2) {
        return reply.status(400).send({ error: 'Bad request', message: 'Need exactly 2 participants' });
      }

      try {
        const result = await seriesService.createAndSimulateSeries(
          draftId,
          participants[0].userId,
          participants[1].userId,
        );
        return { data: result };
      } catch (e: any) {
        return reply.status(400).send({ error: 'Simulation error', message: e.message });
      }
    }
  );

  // Get series details
  app.get<{ Params: { id: string } }>('/api/series/:id', { preHandler: authGuard }, async (request, reply) => {
    try {
      const seriesId = parseId(request.params.id);
      const s = await seriesService.getSeriesById(seriesId);
      if (!s) return reply.status(404).send({ error: 'Not found', message: 'Series not found' });

      const games = await seriesService.getSeriesGames(s.id);
      return { data: { series: s, games } };
    } catch (e: any) {
      if (e.statusCode) return reply.status(e.statusCode).send({ error: 'Bad request', message: e.message });
      request.log.error(e);
      return reply.status(500).send({ error: 'Internal server error', message: 'Failed to load series' });
    }
  });

  // Get all series for a draft
  app.get<{ Params: { draftId: string } }>(
    '/api/drafts/:draftId/series',
    { preHandler: authGuard },
    async (request, reply) => {
      try {
        const draftId = parseId(request.params.draftId);
        const seriesList = await seriesService.getSeriesForDraft(draftId);
        return { data: seriesList };
      } catch (e: any) {
        if (e.statusCode) return reply.status(e.statusCode).send({ error: 'Bad request', message: e.message });
        request.log.error(e);
        return reply.status(500).send({ error: 'Internal server error', message: 'Failed to load series list' });
      }
    }
  );

  // Leaderboard
  app.get('/api/leaderboard', async (request, reply) => {
    try {
      const leaderboard = await seriesService.getLeaderboard();
      return { data: leaderboard };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'Internal server error', message: 'Failed to load leaderboard' });
    }
  });

  // User series history
  app.get<{ Params: { userId: string } }>('/api/users/:userId/series', { preHandler: authGuard }, async (request, reply) => {
    try {
      const userId = parseId(request.params.userId);
      const history = await seriesService.getUserSeriesHistory(userId);
      return { data: history };
    } catch (e: any) {
      if (e.statusCode) return reply.status(e.statusCode).send({ error: 'Bad request', message: e.message });
      request.log.error(e);
      return reply.status(500).send({ error: 'Internal server error', message: 'Failed to load series history' });
    }
  });
}
