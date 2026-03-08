<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Visit entry</h2>
      <span class="chip">Live</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">
      Record a purchase stamp from a customer visit. Cooldown and reward state are enforced server-side.
    </p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        placeholder="Customer phone"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('record')">
        {{ loading ? 'Recording...' : 'Record visit' }}
      </button>
      <div v-if="result" class="rounded-xl bg-sand/70 p-3 text-sm">
        <p class="font-semibold">{{ result.rewardAvailable ? 'Reward available' : 'Progress updated' }}</p>
        <p class="text-dusk/70">
          {{ result.visitCount }} / {{ result.visitThreshold }} stamps
        </p>
        <p class="text-dusk/70">Reward: {{ result.rewardName }}</p>
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
import type { VisitResponse } from '../../lib/types';

defineProps<{
  phone: string;
  loading: boolean;
  result: VisitResponse | null;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:phone', value: string): void;
  (e: 'record'): void;
}>();
</script>
