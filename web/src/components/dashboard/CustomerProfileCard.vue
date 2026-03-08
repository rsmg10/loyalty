<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Customer profile</h2>
      <span class="chip">Context</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">Update name, mobile, and notes for staff context.</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        placeholder="Customer phone"
        :value="profile.phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        placeholder="Display name"
        :value="profile.displayName"
        @input="$emit('update:displayName', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        placeholder="Optional mobile"
        :value="profile.mobileNumber"
        @input="$emit('update:mobileNumber', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        placeholder="Usual order"
        :value="profile.usualOrder"
        @input="$emit('update:usualOrder', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        class="textarea"
        placeholder="Notes"
        :value="profile.notes"
        @input="$emit('update:notes', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('save')">
        {{ loading ? 'Saving...' : 'Save profile' }}
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

type ProfileState = {
  phone: string;
  displayName: string;
  mobileNumber: string;
  usualOrder: string;
  notes: string;
};

defineProps<{
  profile: ProfileState;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:phone', value: string): void;
  (e: 'update:displayName', value: string): void;
  (e: 'update:mobileNumber', value: string): void;
  (e: 'update:usualOrder', value: string): void;
  (e: 'update:notes', value: string): void;
  (e: 'save'): void;
}>();
</script>
