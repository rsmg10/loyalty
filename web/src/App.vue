<template>
  <div class="min-h-screen pb-16">
    <header class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-6 pt-10">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="chip">{{ $t('app.console') }}</p>
          <h1 class="mt-3 font-display text-3xl font-semibold text-dusk sm:text-4xl">
            {{ $t('app.title') }}
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <span class="chip">{{ $t('app.api') }}: {{ apiBase }}</span>
          <div class="flex items-center gap-2">
            <button class="btn-ghost" @click="setLocale('en')">EN</button>
            <button class="btn-ghost" @click="setLocale('ar')">AR</button>
          </div>
          <button v-if="session.token" class="btn-ghost" @click="logout">
            {{ $t('app.signOut') }}
          </button>
        </div>
      </div>
      <p class="max-w-2xl text-sm text-dusk/70">{{ $t('app.description') }}</p>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSessionStore } from './stores/session';
import { useLocale } from './composables/useLocale';

const session = useSessionStore();
const router = useRouter();
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const { setLocale } = useLocale();

function logout() {
  session.clearAuth();
  router.push('/login');
}
</script>
