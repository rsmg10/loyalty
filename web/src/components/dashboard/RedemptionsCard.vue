<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Redemptions</h2>
      <span class="chip">Owner</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">Track recent reward usage.</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? 'Loading...' : 'Load redemptions' }}
      </button>
      <ul v-if="items.length" class="space-y-2 text-xs text-dusk/70">
        <li v-for="entry in items" :key="entry.id">
          {{ entry.rewardName }} · {{ new Date(entry.redeemedAt).toLocaleString() }}
          <span v-if="entry.redeemedByPhone"> · {{ entry.redeemedByPhone }}</span>
        </li>
      </ul>
      <p v-if="message" :class="messageClass(message.tone)">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { RedemptionSummary } from '../../lib/types';

defineProps<{
  items: RedemptionSummary[];
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'refresh'): void;
}>();
</script>
