<script setup lang="ts">
import { onMounted } from 'vue';
import { useDraftStore } from '@/stores/draft';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Card from 'primevue/card';

const draftStore = useDraftStore();

onMounted(() => draftStore.fetchDrafts());

function statusSeverity(status: string) {
  switch (status) {
    case 'waiting': return 'warn';
    case 'drafting': return 'info';
    case 'complete': return 'success';
    default: return 'secondary';
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 class="text-2xl font-bold">My Drafts</h2>
      <router-link to="/drafts/new">
        <Button label="New Draft" icon="pi pi-plus" />
      </router-link>
    </div>

    <!-- Mobile: card list -->
    <div class="block sm:hidden flex flex-col gap-3">
      <Card v-for="d in draftStore.drafts" :key="d.id">
        <template #content>
          <div class="flex justify-between items-start">
            <div>
              <router-link :to="`/drafts/${d.id}`" class="text-court-orange font-bold hover:underline">
                {{ d.name }}
              </router-link>
              <div class="text-xs text-text-muted mt-1">{{ new Date(d.createdAt).toLocaleDateString() }}</div>
            </div>
            <Tag :value="d.status" :severity="statusSeverity(d.status)" />
          </div>
          <div class="mt-2">
            <code class="text-xs bg-surface px-2 py-1 rounded font-mono">{{ d.shareCode }}</code>
          </div>
        </template>
      </Card>
    </div>

    <!-- Desktop: DataTable -->
    <div class="hidden sm:block">
      <DataTable :value="draftStore.drafts" stripedRows>
        <Column field="name" header="Name">
          <template #body="{ data }">
            <router-link :to="`/drafts/${data.id}`" class="text-court-orange font-medium hover:underline">
              {{ data.name }}
            </router-link>
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
          </template>
        </Column>
        <Column header="Share Code">
          <template #body="{ data }">
            <code class="text-xs bg-surface px-2 py-1 rounded font-mono">{{ data.shareCode }}</code>
          </template>
        </Column>
        <Column field="createdAt" header="Created">
          <template #body="{ data }">
            {{ new Date(data.createdAt).toLocaleDateString() }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
