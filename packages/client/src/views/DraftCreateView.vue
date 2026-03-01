<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDraftStore } from '@/stores/draft';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';

const router = useRouter();
const draftStore = useDraftStore();

const name = ref('');
const useYearRange = ref(true);
const startYear = ref(1980);
const endYear = ref(2024);
const useDraftClass = ref(false);
const draftClassYear = ref(2003);
const error = ref('');

async function handleCreate() {
  error.value = '';
  const criteria: any = {};
  if (useYearRange.value) {
    criteria.activeYearRange = { start: startYear.value, end: endYear.value };
  }
  if (useDraftClass.value) {
    criteria.draftClassYear = draftClassYear.value;
  }
  if (!criteria.activeYearRange && !criteria.draftClassYear) {
    error.value = 'Select at least one filter criterion';
    return;
  }

  try {
    const draft = await draftStore.create(name.value, criteria);
    router.push(`/drafts/${draft.id}`);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to create draft';
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto mt-8">
    <h2 class="text-2xl font-bold mb-6">Create New Draft</h2>
    <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>
    <form @submit.prevent="handleCreate" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="name">Draft Name</label>
        <InputText id="name" v-model="name" required placeholder="e.g. 90s Legends Draft" />
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="useYearRange" :binary="true" inputId="yearRange" />
        <label for="yearRange">Filter by active years</label>
      </div>
      <div v-if="useYearRange" class="flex gap-4 pl-6">
        <div class="flex flex-col gap-1">
          <label>Start Year</label>
          <InputNumber v-model="startYear" :min="1946" :max="2026" :useGrouping="false" />
        </div>
        <div class="flex flex-col gap-1">
          <label>End Year</label>
          <InputNumber v-model="endYear" :min="1946" :max="2026" :useGrouping="false" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="useDraftClass" :binary="true" inputId="draftClass" />
        <label for="draftClass">Filter by draft class</label>
      </div>
      <div v-if="useDraftClass" class="pl-6">
        <div class="flex flex-col gap-1">
          <label>Draft Class Year</label>
          <InputNumber v-model="draftClassYear" :min="1947" :max="2025" :useGrouping="false" />
        </div>
      </div>

      <Button type="submit" label="Create Draft" :loading="draftStore.loading" class="mt-4" />
    </form>
  </div>
</template>
