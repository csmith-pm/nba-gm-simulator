<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDraftStore } from '@/stores/draft';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

const route = useRoute();
const router = useRouter();
const draftStore = useDraftStore();
const error = ref('');

onMounted(async () => {
  try {
    const result = await draftStore.join(route.params.shareCode as string);
    router.push(`/drafts/${result.draftId}`);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to join draft';
  }
});
</script>

<template>
  <div class="mt-24 flex flex-col items-center">
    <Message v-if="error" severity="error">{{ error }}</Message>
    <div v-else class="flex flex-col items-center gap-4">
      <ProgressSpinner />
      <p class="font-semibold text-lg">Joining draft...</p>
      <p class="text-sm text-text-muted">Connecting you to the lobby</p>
    </div>
  </div>
</template>
