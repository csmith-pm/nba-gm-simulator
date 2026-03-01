import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Series, SeriesGame, LeaderboardEntry } from '@nba-gm/shared';
import * as api from '@/api';

export const useSeriesStore = defineStore('series', () => {
  const currentSeries = ref<Series | null>(null);
  const currentGames = ref<SeriesGame[]>([]);
  const leaderboard = ref<LeaderboardEntry[]>([]);
  const loading = ref(false);

  async function simulate(draftId: number) {
    loading.value = true;
    try {
      const res = await api.startSeries(draftId);
      currentSeries.value = res.data.data.series;
      currentGames.value = res.data.data.games;
      return res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSeries(id: number) {
    const res = await api.getSeries(id);
    currentSeries.value = res.data.data.series;
    currentGames.value = res.data.data.games;
  }

  async function fetchLeaderboard() {
    const res = await api.getLeaderboard();
    leaderboard.value = res.data.data;
  }

  return { currentSeries, currentGames, leaderboard, loading, simulate, fetchSeries, fetchLeaderboard };
});
