<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.customerActivity') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.customerActivityDescription') }}</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? $t('cards.loading') : $t('cards.loadCustomerActivity') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
          <span class="chip">{{ $t('cards.active') }}: {{ report.activeCustomers }}</span>
          <span class="chip">{{ $t('cards.inactive') }}: {{ report.inactiveCustomers }}</span>
          <span class="chip">{{ $t('cards.totalMembers') }}: {{ report.customers.total }}</span>
        </div>
        <div class="mt-3 space-y-2">
          <div
            v-for="item in report.customers.items"
            :key="item.customerId"
            class="rounded-xl bg-white/80 p-3 text-xs text-dusk/80"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="font-semibold text-dusk">
                {{ item.displayName || item.phoneNumber }}
              </div>
              <span class="chip">
                {{ item.isActive ? $t('cards.active') : $t('cards.inactive') }}
              </span>
            </div>
            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-dusk/70">
              <span>{{ $t('cards.memberSince') }}: {{ formatDate(item.memberSince) }}</span>
              <span v-if="item.lastStampAt">
                {{ $t('cards.lastStamp') }}: {{ formatDate(item.lastStampAt) }}
              </span>
              <span>
                {{ $t('cards.currentProgress') }}:
                {{ item.currentStampCount }} / {{ item.stampThreshold }}
              </span>
              <span>
                {{ $t('cards.rewardsRedeemed') }}: {{ item.totalRewardsRedeemed }}
              </span>
              <span>
                {{ $t('cards.stampsIssued') }}: {{ item.totalStampsIssued }}
              </span>
            </div>
          </div>
        </div>
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
import type { CustomerActivityReport } from '../../lib/types';

defineProps<{
  report: CustomerActivityReport | null;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'refresh'): void;
}>();

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}
</script>
