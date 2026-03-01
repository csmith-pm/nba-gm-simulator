<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';
import Card from 'primevue/card';
</script>

<template>
  <div class="home">
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold mb-4">NBA GM Simulator</h1>
      <p class="text-lg text-gray-600 mb-8">
        Draft 5 historical NBA players, assign positions, and battle in a best-of-7 Finals series.
      </p>

      <div v-if="useAuthStore().isAuthenticated" class="flex justify-center gap-4">
        <router-link to="/drafts/new">
          <Button label="Create Draft" icon="pi pi-plus" size="large" />
        </router-link>
        <router-link to="/drafts">
          <Button label="My Drafts" icon="pi pi-list" severity="secondary" size="large" />
        </router-link>
      </div>
      <div v-else class="flex justify-center gap-4">
        <router-link to="/register">
          <Button label="Get Started" icon="pi pi-user-plus" size="large" />
        </router-link>
        <router-link to="/login">
          <Button label="Sign In" icon="pi pi-sign-in" severity="secondary" size="large" />
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <Card>
        <template #title>Draft</template>
        <template #content>
          <p>Choose from historical NBA players filtered by era or draft class. Snake draft format — pick wisely.</p>
        </template>
      </Card>
      <Card>
        <template #title>Build Your Team</template>
        <template #content>
          <p>Assign your 5 picks to positions (PG, SG, SF, PF, C). Position fit matters in simulation.</p>
        </template>
      </Card>
      <Card>
        <template #title>Simulate</template>
        <template #content>
          <p>Watch your team compete in a stats-driven best-of-7 series with full box scores.</p>
        </template>
      </Card>
    </div>
  </div>
</template>
