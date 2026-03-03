<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Card from 'primevue/card';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const displayName = ref('');
const error = ref('');

async function handleRegister() {
  error.value = '';
  try {
    await auth.register(email.value, password.value, displayName.value);
    const redirect = route.query.redirect as string;
    router.push(redirect || '/drafts');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Registration failed';
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12">
    <Card>
      <template #title>Create Account</template>
      <template #content>
        <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>
        <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="name" class="text-sm font-semibold text-text-secondary">Display Name</label>
            <InputText id="name" v-model="displayName" required minlength="2" maxlength="50" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="email" class="text-sm font-semibold text-text-secondary">Email</label>
            <InputText id="email" v-model="email" type="email" required />
          </div>
          <div class="flex flex-col gap-1">
            <label for="password" class="text-sm font-semibold text-text-secondary">Password</label>
            <Password id="password" v-model="password" toggleMask required />
          </div>
          <Button type="submit" label="Create Account" :loading="auth.loading" />
          <p class="text-sm text-center text-text-secondary">
            Already have an account?
            <router-link :to="{ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} }" class="text-court-orange font-semibold hover:underline">Sign in</router-link>
          </p>
        </form>
      </template>
    </Card>
  </div>
</template>
