<script setup lang="ts">
import { onMounted } from 'vue';
import { useDraftStore } from '@/stores/draft';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

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
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">My Drafts</h2>
      <router-link to="/drafts/new">
        <Button label="New Draft" icon="pi pi-plus" />
      </router-link>
    </div>

    <DataTable :value="draftStore.drafts" stripedRows>
      <Column field="name" header="Name">
        <template #body="{ data }">
          <router-link :to="`/drafts/${data.id}`" class="text-blue-600 font-medium">
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
          <code class="text-xs">{{ data.shareCode }}</code>
        </template>
      </Column>
      <Column field="createdAt" header="Created">
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleDateString() }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
