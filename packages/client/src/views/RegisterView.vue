<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const displayName = ref('');
const error = ref('');

async function handleRegister() {
  error.value = '';
  try {
    await auth.register(email.value, password.value, displayName.value);
    router.push('/drafts');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Registration failed';
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12">
    <h2 class="text-2xl font-bold mb-6">Create Account</h2>
    <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>
    <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="name">Display Name</label>
        <InputText id="name" v-model="displayName" required minlength="2" maxlength="50" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" required />
      </div>
      <div class="flex flex-col gap-1">
        <label for="password">Password</label>
        <Password id="password" v-model="password" toggleMask required />
      </div>
      <Button type="submit" label="Create Account" :loading="auth.loading" />
      <p class="text-sm text-center">
        Already have an account?
        <router-link to="/login" class="text-blue-600">Sign in</router-link>
      </p>
    </form>
  </div>
</template>
