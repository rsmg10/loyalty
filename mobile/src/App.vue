<template>
  <div class="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 pb-16 pt-10">
    <header class="space-y-3 text-center">
      <span class="badge mx-auto">{{ $t('app.customerWallet') }}</span>
      <h1 class="font-display text-3xl font-semibold text-dusk">{{ $t('app.title') }}</h1>
      <p class="text-sm text-dusk/70">{{ $t('app.subtitle') }}</p>
      <div class="flex items-center justify-center gap-2">
        <button class="btn-ghost w-auto px-3" @click="setLocale('en')">EN</button>
        <button class="btn-ghost w-auto px-3" @click="setLocale('ar')">AR</button>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useLocale } from './composables/useLocale';

const { setLocale } = useLocale();
</script>
