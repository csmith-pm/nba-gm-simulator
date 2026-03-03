<script setup lang="ts">
import { onMounted } from 'vue';
import { useDraftStore } from '@/stores/draft';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Card from 'primevue/card';

const draftStore = useDraftStore();
const toast = useToast();

onMounted(() => draftStore.fetchDrafts());

function copyShareCode(shareCode: string) {
  const url = `${window.location.origin}/join/${shareCode}`;
  navigator.clipboard.writeText(url);
  toast.add({ severity: 'success', summary: 'Link copied!', life: 2000 });
}

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

    <!-- Empty state -->
    <div v-if="draftStore.drafts.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <i class="pi pi-basketball text-6xl text-text-muted mb-4"></i>
      <h3 class="text-xl font-bold mb-2">No drafts yet</h3>
      <p class="text-text-secondary mb-6">Create your first draft and start building your dream team.</p>
      <router-link to="/drafts/new">
        <Button label="Create Your First Draft" icon="pi pi-plus" />
      </router-link>
    </div>

    <template v-else>
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
            <div class="mt-2 flex items-center gap-2">
              <code class="text-xs bg-surface px-2 py-1 rounded font-mono">{{ d.shareCode }}</code>
              <Button v-if="d.status === 'waiting'" icon="pi pi-copy" severity="secondary" size="small" text @click="copyShareCode(d.shareCode)" />
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
          <Column header="Invite Link">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <code class="text-xs bg-surface px-2 py-1 rounded font-mono">{{ data.shareCode }}</code>
                <Button v-if="data.status === 'waiting'" icon="pi pi-copy" severity="secondary" size="small" text @click="copyShareCode(data.shareCode)" />
              </div>
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
  </div>
</template>
