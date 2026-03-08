<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Business stats</h2>
      <span class="chip">Owner</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">Quick loyalty totals for this business.</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? 'Loading...' : 'Load stats' }}
      </button>
      <div v-if="stats" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p>Enrolled customers: {{ stats.enrolledCustomers }}</p>
        <p>Stamps issued: {{ stats.stampsIssued }}</p>
        <p>Rewards redeemed: {{ stats.rewardsRedeemed }}</p>
      </div>
      <p v-if="message" :class="messageClass(message.tone)">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { BusinessStatsResponse } from '../../lib/types';

defineProps<{
  stats: BusinessStatsResponse | null;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'refresh'): void;
}>();
</script>
