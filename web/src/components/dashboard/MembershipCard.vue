<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.membershipJoin') }}</h2>
      <span class="chip">{{ $t('cards.enroll') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.membershipDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('forms.customerPhone')"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('create')">
        {{ loading ? $t('cards.creating') : $t('cards.createMembership') }}
      </button>
      <p v-if="message" :class="messageClass(message.tone)">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';

defineProps<{
  phone: string;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:phone', value: string): void;
  (e: 'create'): void;
}>();
</script>
