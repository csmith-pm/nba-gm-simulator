<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const error = ref('');

async function handleLogin() {
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    const redirect = route.query.redirect as string;
    router.push(redirect || '/drafts');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login failed';
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12">
    <h2 class="text-2xl font-bold mb-6">Sign In</h2>
    <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>
    <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" required />
      </div>
      <div class="flex flex-col gap-1">
        <label for="password">Password</label>
        <Password id="password" v-model="password" :feedback="false" toggleMask required />
      </div>
      <Button type="submit" label="Sign In" :loading="auth.loading" />
      <p class="text-sm text-center">
        Don't have an account?
        <router-link to="/register" class="text-blue-600">Register</router-link>
      </p>
    </form>
  </div>
</template>
