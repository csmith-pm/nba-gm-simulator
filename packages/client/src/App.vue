<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const auth = useAuthStore();
const router = useRouter();

onMounted(() => auth.fetchUser());

const menuItems = [
  { label: 'Home', icon: 'pi pi-home', command: () => router.push('/') },
  { label: 'My Drafts', icon: 'pi pi-list', command: () => router.push('/drafts') },
  { label: 'Leaderboard', icon: 'pi pi-trophy', command: () => router.push('/leaderboard') },
];

async function handleLogout() {
  await auth.logout();
  router.push('/');
}
</script>

<template>
  <div class="app-layout">
    <Menubar :model="menuItems">
      <template #start>
        <span class="font-bold text-xl cursor-pointer" @click="router.push('/')">
          NBA GM Simulator
        </span>
      </template>
      <template #end>
        <div v-if="auth.isAuthenticated" class="flex items-center gap-2">
          <span class="text-sm">{{ auth.user?.displayName }}</span>
          <Button label="Logout" icon="pi pi-sign-out" severity="secondary" size="small" @click="handleLogout" />
        </div>
        <div v-else class="flex gap-2">
          <Button label="Login" icon="pi pi-sign-in" severity="secondary" size="small" @click="router.push('/login')" />
          <Button label="Register" icon="pi pi-user-plus" size="small" @click="router.push('/register')" />
        </div>
      </template>
    </Menubar>

    <main class="p-4 max-w-7xl mx-auto">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
}
.app-layout {
  min-height: 100vh;
}
</style>
