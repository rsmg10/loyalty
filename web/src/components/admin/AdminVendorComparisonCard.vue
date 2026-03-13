<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('admin.vendorComparisonTitle') }}</h2>
      <span class="chip">{{ $t('admin.platform') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('admin.vendorComparisonDescription') }}</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? $t('cards.loading') : $t('admin.loadVendorComparison') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-3 space-y-2">
          <div
            v-for="item in report.vendors.items"
            :key="item.businessId"
            class="rounded-xl bg-white/80 p-3 text-xs text-dusk/80"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="font-semibold text-dusk">{{ item.businessName }}</div>
              <span class="chip">{{ $t('admin.members') }}: {{ item.totalMembers }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-dusk/70">
              <span>{{ $t('admin.newMembers') }}: {{ item.newMembers }}</span>
              <span>{{ $t('admin.activeCustomers') }}: {{ item.activeCustomers }}</span>
              <span>{{ $t('admin.stampsIssued') }}: {{ item.stampsIssued }}</span>
              <span>{{ $t('admin.rewardsRedeemed') }}: {{ item.rewardsRedeemed }}</span>
              <span>
                {{ $t('admin.redemptionRate') }}: {{ formatPercent(item.redemptionRate) }}
              </span>
              <span>{{ $t('admin.activePrograms') }}: {{ item.activePrograms }}</span>
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
import type { VendorComparisonReport } from '../../lib/types';

defineProps<{
  report: VendorComparisonReport | null;
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
