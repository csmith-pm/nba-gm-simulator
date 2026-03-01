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
  <div class="flex flex-col items-center mt-12">
    <Message v-if="error" severity="error">{{ error }}</Message>
    <div v-else class="flex flex-col items-center gap-4">
      <ProgressSpinner />
      <p>Joining draft...</p>
    </div>
  </div>
</template>
