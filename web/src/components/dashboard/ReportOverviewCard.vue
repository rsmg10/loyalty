<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.reportOverview') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.reportOverviewDescription') }}</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? $t('cards.loading') : $t('cards.loadReportOverview') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <p>{{ $t('cards.totalMembers') }}: {{ report.totalMembers }}</p>
          <p>{{ $t('cards.newMembers') }}: {{ report.newMembers }}</p>
          <p>{{ $t('cards.activeCustomers') }}: {{ report.activeCustomers }}</p>
          <p>{{ $t('cards.inactiveCustomers') }}: {{ report.inactiveCustomers }}</p>
          <p>{{ $t('cards.totalStampsIssued') }}: {{ report.totalStampsIssued }}</p>
          <p>{{ $t('cards.totalRewardsRedeemed') }}: {{ report.totalRewardsRedeemed }}</p>
          <p>
            {{ $t('cards.redemptionRate') }}:
            {{ formatPercent(report.redemptionRate) }}
          </p>
          <p>{{ $t('cards.redeemableRewards') }}: {{ report.redeemableRewards }}</p>
          <p>
            {{ $t('cards.avgStampsPerActiveCustomer') }}:
            {{ report.avgStampsPerActiveCustomer.toFixed(2) }}
          </p>
          <p>
            {{ $t('cards.avgRewardsPerActiveCustomer') }}:
            {{ report.avgRewardsPerActiveCustomer.toFixed(2) }}
          </p>
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
import type { VendorOverviewReport } from '../../lib/types';

defineProps<{
  report: VendorOverviewReport | null;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'refresh'): void;
}>();

function formatPercent(value: number) {
  if (Number.isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(1)}%`;
}
</script>
