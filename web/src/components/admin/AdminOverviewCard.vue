<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('admin.overviewTitle') }}</h2>
      <span class="chip">{{ $t('admin.platform') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('admin.overviewDescription') }}</p>
    <div class="mt-4 space-y-3">
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ loading ? $t('cards.loading') : $t('admin.loadOverview') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <p>{{ $t('admin.totalVendors') }}: {{ report.totalVendors }}</p>
          <p>{{ $t('admin.activeVendors') }}: {{ report.activeVendors }}</p>
          <p>{{ $t('admin.disabledVendors') }}: {{ report.disabledVendors }}</p>
          <p>{{ $t('admin.totalMemberships') }}: {{ report.totalMemberships }}</p>
          <p>{{ $t('admin.newMemberships') }}: {{ report.newMemberships }}</p>
          <p>{{ $t('admin.totalStampsIssued') }}: {{ report.totalStampsIssued }}</p>
          <p>{{ $t('admin.totalRewardsRedeemed') }}: {{ report.totalRewardsRedeemed }}</p>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-dusk/60">
              {{ $t('admin.topByMembers') }}
            </p>
            <ul class="mt-2 space-y-1 text-xs text-dusk/80">
              <li v-for="item in report.topVendorsByMembers" :key="item.reason">
                {{ item.reason }} · {{ item.value }}
              </li>
            </ul>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-dusk/60">
              {{ $t('admin.topByStamps') }}
            </p>
            <ul class="mt-2 space-y-1 text-xs text-dusk/80">
              <li v-for="item in report.topVendorsByStamps" :key="item.reason">
                {{ item.reason }} · {{ item.value }}
              </li>
            </ul>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-dusk/60">
              {{ $t('admin.topByRewards') }}
            </p>
            <ul class="mt-2 space-y-1 text-xs text-dusk/80">
              <li v-for="item in report.topVendorsByRewards" :key="item.reason">
                {{ item.reason }} · {{ item.value }}
              </li>
            </ul>
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
import type { PlatformOverviewReport } from '../../lib/types';

defineProps<{
  report: PlatformOverviewReport | null;
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'refresh'): void;
}>();
</script>
