<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.magicLink') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.magicLinkDescription') }}</p>

    <div class="mt-4 space-y-3">
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('generate')">
        {{ loading ? $t('cards.generating') : $t('cards.generateMagicLink') }}
      </button>

      <div v-if="link" class="space-y-3 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-dusk">
        <p class="font-semibold">{{ $t('cards.magicLinkReady') }}</p>
        <p v-if="businessName" class="text-dusk/70">{{ businessName }}</p>
        <div class="flex flex-col gap-2">
          <input class="input text-xs" :value="link" readonly />
          <button class="btn-ghost w-full" @click="$emit('copy')">
            {{ $t('cards.copyLink') }}
          </button>
        </div>
        <p v-if="expiresAt" class="text-xs text-dusk/60">
          {{ $t('cards.magicLinkExpires') }}: {{ new Date(expiresAt).toLocaleString() }}
        </p>
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="Magic link QR"
          class="mx-auto h-48 w-48 rounded-2xl border border-white/70 bg-white p-2"
        />
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

defineProps<{
  link: string | null;
  expiresAt: string | null;
  businessName: string | null;
  qrDataUrl: string | null;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'generate'): void;
  (e: 'copy'): void;
}>();
</script>
