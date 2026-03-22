<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.redemptions') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.redemptionsDescription') }}</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? $t('cards.loading') : $t('dashboard.loadRedemptions') }}
      </button>
      <ul v-if="items.length" class="space-y-2 text-xs text-dusk/70">
        <li
          v-for="entry in items"
          :key="entry.id"
          class="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 p-2.5"
        >
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold"
            :style="avatarStyle(entry.rewardName)"
          >
            {{ initialsFromValue(entry.rewardName, 'RW') }}
          </span>
          <div class="min-w-0">
            <p class="truncate font-semibold text-dusk">{{ entry.rewardName }}</p>
            <p class="text-[11px] text-dusk/70">{{ new Date(entry.redeemedAt).toLocaleString() }}</p>
            <p v-if="entry.redeemedByPhone" class="text-[11px] text-dusk/70">
              {{ $t('cards.redeemedBy') }}: {{ entry.redeemedByPhone }}
            </p>
          </div>
        </li>
      </ul>
      <p v-else-if="!loading" class="rounded-xl bg-dusk/5 px-3 py-2 text-xs text-dusk/70">
        {{ $t('cards.noRedemptionsYet') }}
      </p>
      <p v-if="message" :class="messageClass(message.tone)">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { RedemptionSummary } from '../../lib/types';
import { avatarStyle, initialsFromValue } from '../../lib/avatar';

defineProps<{
  items: RedemptionSummary[];
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'refresh'): void;
}>();
</script>
