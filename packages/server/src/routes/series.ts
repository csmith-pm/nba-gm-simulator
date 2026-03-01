import type { FastifyInstance } from 'fastify';
import { authGuard } from '../middleware/auth.js';
import * as seriesService from '../services/series.js';
import * as draftService from '../services/draft.js';

export async function seriesRoutes(app: FastifyInstance) {
  // Start a series (simulate immediately)
  app.post<{ Params: { draftId: string } }>(
    '/api/drafts/:draftId/series',
    { preHandler: authGuard },
    async (request, reply) => {
      const draftId = parseInt(request.params.draftId);
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
    const s = await seriesService.getSeriesById(parseInt(request.params.id));
    if (!s) return reply.status(404).send({ error: 'Not found', message: 'Series not found' });

    const games = await seriesService.getSeriesGames(s.id);
    return { data: { series: s, games } };
  });

  // Get all series for a draft
  app.get<{ Params: { draftId: string } }>(
    '/api/drafts/:draftId/series',
    { preHandler: authGuard },
    async (request) => {
      const seriesList = await seriesService.getSeriesForDraft(parseInt(request.params.draftId));
      return { data: seriesList };
    }
  );

  // Leaderboard
  app.get('/api/leaderboard', async () => {
    const leaderboard = await seriesService.getLeaderboard();
    return { data: leaderboard };
  });

  // User series history
  app.get('/api/users/:userId/series', { preHandler: authGuard }, async (request) => {
    const userId = parseInt((request.params as any).userId);
    const history = await seriesService.getUserSeriesHistory(userId);
    return { data: history };
  });
}
