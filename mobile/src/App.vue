<template>
  <div class="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 pb-16 pt-10">
    <header class="space-y-3 text-center">
      <span class="badge mx-auto">Customer Wallet</span>
      <h1 class="font-display text-3xl font-semibold text-dusk">Loyalty Pocket</h1>
      <p class="text-sm text-dusk/70">
        Track your stamps, see when your reward is ready, and keep a clean record of every stop.
      </p>
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
