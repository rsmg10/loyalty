<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.customerProfile') }}</h2>
      <span class="chip">{{ $t('dashboard.context') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.profileDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('forms.customerPhone')"
        :value="profile.phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        :placeholder="$t('forms.displayName')"
        :value="profile.displayName"
        @input="$emit('update:displayName', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        :placeholder="$t('forms.mobileNumber')"
        :value="profile.mobileNumber"
        @input="$emit('update:mobileNumber', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        :placeholder="$t('forms.usualOrder')"
        :value="profile.usualOrder"
        @input="$emit('update:usualOrder', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        class="textarea"
        :placeholder="$t('forms.notes')"
        :value="profile.notes"
        @input="$emit('update:notes', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('save')">
        {{ loading ? $t('cards.saving') : $t('cards.saveProfile') }}
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
