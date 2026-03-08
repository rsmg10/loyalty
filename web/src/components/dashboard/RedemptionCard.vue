<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Redemption</h2>
      <span class="chip">Counter</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">Redeem a reward once the customer has reached the threshold.</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        placeholder="Customer phone"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('redeem')">
        {{ loading ? 'Redeeming...' : 'Redeem reward' }}
      </button>
      <div v-if="result" class="rounded-xl bg-sand/70 p-3 text-sm">
        <p class="font-semibold">Reward redeemed</p>
        <p class="text-dusk/70">{{ result.rewardName }}</p>
        <p v-if="result.redeemedByPhone" class="text-dusk/70">
          Redeemed by: {{ result.redeemedByPhone }}
        </p>
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
import type { RedemptionResponse } from '../../lib/types';

defineProps<{
  phone: string;
  loading: boolean;
  result: RedemptionResponse | null;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:phone', value: string): void;
  (e: 'redeem'): void;
}>();
</script>
