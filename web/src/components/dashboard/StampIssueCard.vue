<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.stampIssuance') }}</h2>
      <span class="chip">{{ $t('cards.audit') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.issueDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('forms.customerPhone')"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        type="number"
        min="1"
        :placeholder="$t('forms.quantity')"
        :value="quantity"
        @input="$emit('update:quantity', Number(($event.target as HTMLInputElement).value))"
      />
      <input
        class="input"
        :placeholder="$t('forms.reason')"
        :value="reason"
        @input="$emit('update:reason', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('issue')">
        {{ loading ? $t('cards.issuing') : $t('cards.issueStamps') }}
      </button>
      <div v-if="result" class="rounded-xl bg-sand/70 p-3 text-sm">
        <p class="font-semibold">
          {{ result.rewardAvailable ? $t('cards.rewardAvailable') : $t('messages.stampsIssued') }}
        </p>
        <p class="text-dusk/70">
          {{ result.stampCount }} / {{ result.stampThreshold }} {{ $t('cards.stamps') }}
        </p>
        <p class="text-dusk/70">{{ $t('cards.reward') }}: {{ result.rewardDescription }}</p>
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
import type { StampIssueResponse } from '../../lib/types';

defineProps<{
  phone: string;
  quantity: number;
  reason: string;
  loading: boolean;
  result: StampIssueResponse | null;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:phone', value: string): void;
  (e: 'update:quantity', value: number): void;
  (e: 'update:reason', value: string): void;
  (e: 'issue'): void;
}>();
</script>
