<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.visitEntry') }}</h2>
      <span class="chip">{{ $t('cards.live') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.visitDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('forms.customerPhone')"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('record')">
        {{ loading ? $t('cards.recording') : $t('cards.recordVisit') }}
      </button>
      <div v-if="result" class="rounded-xl bg-sand/70 p-3 text-sm">
        <p class="font-semibold">
          {{ result.rewardAvailable ? $t('cards.rewardAvailable') : $t('cards.progressUpdated') }}
        </p>
        <p class="text-dusk/70">
          {{ result.visitCount }} / {{ result.visitThreshold }} {{ $t('cards.stamps') }}
        </p>
        <p class="text-dusk/70">{{ $t('cards.reward') }}: {{ result.rewardName }}</p>
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
