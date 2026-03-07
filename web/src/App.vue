<template>
  <div class="min-h-screen pb-16">
    <header class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-6 pt-10">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="chip">Staff Console</p>
          <h1 class="mt-3 font-display text-3xl font-semibold text-dusk sm:text-4xl">
            Loyalty Ops Hub
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <span class="chip">API: {{ apiBase }}</span>
          <button v-if="session.token" class="btn-ghost" @click="logout">
            Sign out
          </button>
        </div>
      </div>
      <p class="max-w-2xl text-sm text-dusk/70">
        Fast visit capture, clean rewards, and customer context without the clutter. Use OTP to authenticate,
        then pick a business to operate in.
      </p>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSessionStore } from './stores/session';

const session = useSessionStore();
const router = useRouter();
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function logout() {
  session.clearAuth();
  router.push('/login');
}
</script>
