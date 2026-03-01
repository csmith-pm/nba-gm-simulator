<script setup lang="ts">
import { onMounted } from 'vue';
import { useSeriesStore } from '@/stores/series';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const seriesStore = useSeriesStore();

onMounted(() => seriesStore.fetchLeaderboard());
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Leaderboard</h2>
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
