<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';
import Card from 'primevue/card';
</script>

<template>
  <div>
    <div class="text-center py-12 sm:py-20">
      <p class="text-sm font-bold uppercase tracking-widest text-court-orange mb-3">Fantasy Meets History</p>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">NBA GM Simulator</h1>
      <p class="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
        Draft 5 historical NBA players, assign positions, and battle in a best-of-7 Finals series.
      </p>

      <div v-if="useAuthStore().isAuthenticated" class="flex flex-col sm:flex-row justify-center gap-4">
        <router-link to="/drafts/new" class="w-full sm:w-auto">
          <Button label="Create Draft" icon="pi pi-plus" size="large" class="w-full" />
        </router-link>
        <router-link to="/drafts" class="w-full sm:w-auto">
          <Button label="My Drafts" icon="pi pi-list" severity="secondary" size="large" class="w-full" />
        </router-link>
      </div>
      <div v-else class="flex flex-col sm:flex-row justify-center gap-4">
        <router-link to="/register" class="w-full sm:w-auto">
          <Button label="Get Started" icon="pi pi-user-plus" size="large" class="w-full" />
        </router-link>
        <router-link to="/login" class="w-full sm:w-auto">
          <Button label="Sign In" icon="pi pi-sign-in" severity="secondary" size="large" class="w-full" />
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-users text-court-orange"></i>
            Draft
          </div>
        </template>
        <template #content>
          <p class="text-text-secondary">Choose from historical NBA players filtered by era or draft class. Snake draft format — pick wisely.</p>
        </template>
      </Card>
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-th-large text-court-orange"></i>
            Build Your Team
          </div>
        </template>
        <template #content>
          <p class="text-text-secondary">Assign your 5 picks to positions (PG, SG, SF, PF, C). Position fit matters in simulation.</p>
        </template>
      </Card>
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-bar text-court-orange"></i>
            Simulate
          </div>
        </template>
        <template #content>
          <p class="text-text-secondary">Watch your team compete in a stats-driven best-of-7 series with full box scores.</p>
        </template>
      </Card>
    </div>
  </div>
</template>
