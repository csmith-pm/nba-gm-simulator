<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSeriesStore } from '@/stores/series';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const route = useRoute();
const seriesStore = useSeriesStore();
const seriesId = parseInt(route.params.id as string);
const selectedGameIdx = ref(0);

onMounted(() => seriesStore.fetchSeries(seriesId));

const s = computed(() => seriesStore.currentSeries);
const games = computed(() => seriesStore.currentGames);

const team1Wins = computed(() => games.value.filter((g: any) => g.winnerUserId === s.value?.team1UserId).length);
const team2Wins = computed(() => games.value.filter((g: any) => g.winnerUserId === s.value?.team2UserId).length);

const selectedGame = computed(() => games.value[selectedGameIdx.value]);
</script>

<template>
  <div v-if="s">
    <h2 class="text-2xl font-bold mb-4">Series Result</h2>

    <!-- Series score -->
    <div class="flex justify-center items-center gap-8 mb-6 text-xl">
      <div class="text-center">
        <div class="font-bold">Team 1</div>
        <div class="text-3xl">{{ team1Wins }}</div>
      </div>
      <div class="text-gray-400">vs</div>
      <div class="text-center">
        <div class="font-bold">Team 2</div>
        <div class="text-3xl">{{ team2Wins }}</div>
      </div>
    </div>

    <Tag v-if="s.winnerUserId" :value="s.winnerUserId === s.team1UserId ? 'Team 1 Wins!' : 'Team 2 Wins!'" severity="success" class="mb-4" />

    <!-- Game-by-game results -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Games</h3>
      <div class="flex gap-2 mb-4 flex-wrap">
        <Tag
          v-for="(game, idx) in games"
          :key="game.gameNumber"
          :value="`G${game.gameNumber}: ${game.team1Score}-${game.team2Score}`"
          :severity="idx === selectedGameIdx ? 'info' : 'secondary'"
          class="cursor-pointer"
          @click="selectedGameIdx = idx"
        />
      </div>
    </div>

    <!-- Box Score for selected game -->
    <div v-if="selectedGame">
      <h3 class="text-lg font-semibold mb-2">
        Game {{ selectedGame.gameNumber }} Box Score
        <span class="text-sm font-normal text-gray-500">
          ({{ selectedGame.team1Score }} - {{ selectedGame.team2Score }})
        </span>
      </h3>

      <div class="mb-4">
        <h4 class="font-medium mb-1">Team 1</h4>
        <DataTable :value="(selectedGame.gameLog as any)?.team1Players || []" size="small" stripedRows>
          <Column field="playerName" header="Player" />
          <Column field="position" header="Pos" style="width: 3rem" />
          <Column field="points" header="PTS" style="width: 3rem" />
          <Column field="rebounds" header="REB" style="width: 3rem" />
          <Column field="assists" header="AST" style="width: 3rem" />
          <Column field="steals" header="STL" style="width: 3rem" />
          <Column field="blocks" header="BLK" style="width: 3rem" />
          <Column header="FG" style="width: 5rem">
            <template #body="{ data }">{{ data.fgMade }}/{{ data.fgAttempted }}</template>
          </Column>
          <Column field="minutes" header="MIN" style="width: 3rem" />
        </DataTable>
      </div>

      <div>
        <h4 class="font-medium mb-1">Team 2</h4>
        <DataTable :value="(selectedGame.gameLog as any)?.team2Players || []" size="small" stripedRows>
          <Column field="playerName" header="Player" />
          <Column field="position" header="Pos" style="width: 3rem" />
          <Column field="points" header="PTS" style="width: 3rem" />
          <Column field="rebounds" header="REB" style="width: 3rem" />
          <Column field="assists" header="AST" style="width: 3rem" />
          <Column field="steals" header="STL" style="width: 3rem" />
          <Column field="blocks" header="BLK" style="width: 3rem" />
          <Column header="FG" style="width: 5rem">
            <template #body="{ data }">{{ data.fgMade }}/{{ data.fgAttempted }}</template>
          </Column>
          <Column field="minutes" header="MIN" style="width: 3rem" />
        </DataTable>
      </div>
    </div>
  </div>
</template>
