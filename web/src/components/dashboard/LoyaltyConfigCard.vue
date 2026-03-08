<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.loyaltyConfig') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.configDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('onboarding.programName')"
        :value="config.programName"
        @input="$emit('update:programName', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        class="textarea"
        :placeholder="$t('onboarding.programDescription')"
        :value="config.programDescription"
        @input="$emit('update:programDescription', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">
          {{ $t('cards.programIcon') }}
        </label>
        <input class="input" type="file" accept="image/*" @change="$emit('program-icon-change', $event)" />
        <button class="btn-ghost w-full" :disabled="loading" @click="$emit('upload-program-icon')">
          {{ $t('cards.uploadProgramIcon') }}
        </button>
        <img
          v-if="config.programIconUrl"
          :src="config.programIconUrl"
          alt="Program icon"
          class="h-20 w-20 rounded-2xl object-cover"
        />
      </div>
      <input
        class="input"
        :placeholder="$t('onboarding.rewardName')"
        :value="config.rewardName"
        @input="$emit('update:rewardName', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        type="number"
        min="1"
        :value="config.visitThreshold"
        @input="$emit('update:visitThreshold', Number(($event.target as HTMLInputElement).value))"
      />
      <div class="space-y-2">
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">
          {{ $t('cards.rewardImage') }}
        </label>
        <input class="input" type="file" accept="image/*" @change="$emit('reward-image-change', $event)" />
        <button class="btn-ghost w-full" :disabled="loading" @click="$emit('upload-reward-image')">
          {{ $t('cards.uploadRewardImage') }}
        </button>
        <img
          v-if="config.rewardImageUrl"
          :src="config.rewardImageUrl"
          alt="Reward image"
          class="h-24 w-full rounded-2xl object-cover"
        />
      </div>
      <textarea
        class="textarea"
        :placeholder="$t('onboarding.optionalNote')"
        :value="config.optionalNote"
        @input="$emit('update:optionalNote', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <input
        class="input"
        type="number"
        min="1"
        :placeholder="$t('onboarding.stampExpiration')"
        :value="config.stampExpirationDays"
        @input="$emit('update:stampExpirationDays', ($event.target as HTMLInputElement).value)"
      />
      <div class="flex flex-col gap-2 sm:flex-row">
        <button class="btn-primary w-full" :disabled="loading" @click="$emit('save')">
          {{ loading ? $t('cards.saving') : $t('cards.saveConfig') }}
        </button>
        <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
          {{ $t('cards.refreshConfig') }}
        </button>
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

type LoyaltyConfigState = {
  programName: string;
  programDescription: string;
  rewardName: string;
  programIconUrl: string;
  rewardImageUrl: string;
  visitThreshold: number;
  optionalNote: string;
  stampExpirationDays: string | number;
};

defineProps<{
  config: LoyaltyConfigState;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:programName', value: string): void;
  (e: 'update:programDescription', value: string): void;
  (e: 'update:rewardName', value: string): void;
  (e: 'update:visitThreshold', value: number): void;
  (e: 'update:optionalNote', value: string): void;
  (e: 'update:stampExpirationDays', value: string): void;
  (e: 'program-icon-change', event: Event): void;
  (e: 'reward-image-change', event: Event): void;
  (e: 'upload-program-icon'): void;
  (e: 'upload-reward-image'): void;
  (e: 'save'): void;
  (e: 'refresh'): void;
}>();
</script>
