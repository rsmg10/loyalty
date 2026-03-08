<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.businessStats') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.statsDescription') }}</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? $t('cards.loading') : $t('cards.loadStats') }}
      </button>
      <div v-if="stats" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p>{{ $t('cards.enrolledCustomers') }}: {{ stats.enrolledCustomers }}</p>
        <p>{{ $t('cards.stampsIssued') }}: {{ stats.stampsIssued }}</p>
        <p>{{ $t('cards.rewardsRedeemed') }}: {{ stats.rewardsRedeemed }}</p>
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
