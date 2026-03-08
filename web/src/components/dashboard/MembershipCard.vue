<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Membership join</h2>
      <span class="chip">Enroll</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">
      Create a loyalty membership for a customer without issuing stamps.
    </p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        placeholder="Customer phone"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('create')">
        {{ loading ? 'Creating...' : 'Create membership' }}
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
