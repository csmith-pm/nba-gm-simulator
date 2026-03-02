<script setup lang="ts">
import { onMounted } from 'vue';
import { useSeriesStore } from '@/stores/series';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Button from 'primevue/button';

const seriesStore = useSeriesStore();

onMounted(() => seriesStore.fetchLeaderboard());
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      <i class="pi pi-trophy text-court-orange"></i>
      Leaderboard
    </h2>

    <!-- Empty state -->
    <div v-if="seriesStore.leaderboard.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <i class="pi pi-trophy text-6xl text-text-muted mb-4"></i>
      <h3 class="text-xl font-bold mb-2">No results yet</h3>
      <p class="text-text-secondary mb-6">Complete a draft and simulate a series to see the leaderboard.</p>
      <router-link to="/drafts/new">
        <Button label="Start a Draft" icon="pi pi-plus" />
      </router-link>
    </div>

    <template v-else>
      <!-- Mobile: card list -->
      <div class="block sm:hidden flex flex-col gap-3">
        <Card v-for="(entry, idx) in seriesStore.leaderboard" :key="entry.displayName">
          <template #content>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl font-black text-text-muted w-8">{{ idx + 1 }}</span>
                <div>
                  <div class="font-bold">{{ entry.displayName }}</div>
                  <div class="text-xs text-text-secondary">{{ entry.wins }}W - {{ entry.losses }}L</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-court-orange">{{ (entry.winPct * 100).toFixed(1) }}%</div>
                <div class="text-xs text-text-muted">{{ entry.championships }} titles</div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Desktop: DataTable -->
      <div class="hidden sm:block">
        <DataTable :value="seriesStore.leaderboard" stripedRows>
          <Column header="#" style="width: 3rem">
            <template #body="{ index }">{{ index + 1 }}</template>
          </Column>
          <Column field="displayName" header="Player" />
          <Column field="wins" header="W" style="width: 4rem" />
          <Column field="losses" header="L" style="width: 4rem" />
          <Column header="Win %" style="width: 5rem">
            <template #body="{ data }">{{ (data.winPct * 100).toFixed(1) }}%</template>
          </Column>
          <Column field="championships" header="Championships" />
        </DataTable>
      </div>
    </template>
  </div>
</template>
