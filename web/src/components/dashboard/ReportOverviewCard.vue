<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.reportOverview') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.reportOverviewDescription') }}</p>
    <div class="mt-4 space-y-3">
      <div class="grid gap-2 sm:grid-cols-2">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-dusk/60">{{ $t('cards.startDate') }}</label>
          <input v-model="startDate" type="date" class="input" />
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-dusk/60">{{ $t('cards.endDate') }}</label>
          <input v-model="endDate" type="date" class="input" />
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-ghost" :disabled="loading" @click="setPreset(7)">
          {{ $t('cards.last7Days') }}
        </button>
        <button class="btn-ghost" :disabled="loading" @click="setPreset(30)">
          {{ $t('cards.last30Days') }}
        </button>
        <button class="btn-ghost" :disabled="loading" @click="setPreset(90)">
          {{ $t('cards.last90Days') }}
        </button>
        <button class="btn-ghost" :disabled="loading" @click="clearRange">
          {{ $t('cards.clearRange') }}
        </button>
        <button v-if="report" class="btn-ghost" @click="exportCsv">
          {{ $t('cards.exportCsv') }}
        </button>
      </div>
      <button class="btn-ghost w-full" :disabled="loading" @click="applyRange">
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { VendorOverviewReport } from '../../lib/types';
import { downloadCsv } from '../../lib/csv';

const props = defineProps<{
  report: VendorOverviewReport | null;
  loading: boolean;
  message: Message | null;
}>();

const emit = defineEmits<{
  (e: 'refresh', range?: { start?: string; end?: string }): void;
}>();

const startDate = ref('');
const endDate = ref('');
const { t } = useI18n();

function applyRange() {
  emit('refresh', { start: startDate.value || undefined, end: endDate.value || undefined });
}

function clearRange() {
  startDate.value = '';
  endDate.value = '';
  emit('refresh');
}

function setPreset(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  startDate.value = formatDateInput(start);
  endDate.value = formatDateInput(end);
  applyRange();
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatPercent(value: number) {
  if (Number.isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(1)}%`;
}

function exportCsv() {
  const report = props.report;
  if (!report) {
    return;
  }

  const headers = [t('cards.metric'), t('cards.value')];
  const rows: Array<Array<string | number>> = [
    [t('cards.totalMembers'), report.totalMembers],
    [t('cards.newMembers'), report.newMembers],
    [t('cards.activeCustomers'), report.activeCustomers],
    [t('cards.inactiveCustomers'), report.inactiveCustomers],
    [t('cards.totalStampsIssued'), report.totalStampsIssued],
    [t('cards.totalRewardsRedeemed'), report.totalRewardsRedeemed],
    [t('cards.redemptionRate'), `${(report.redemptionRate * 100).toFixed(1)}%`],
    [t('cards.redeemableRewards'), report.redeemableRewards],
    [t('cards.avgStampsPerActiveCustomer'), report.avgStampsPerActiveCustomer.toFixed(2)],
    [t('cards.avgRewardsPerActiveCustomer'), report.avgRewardsPerActiveCustomer.toFixed(2)]
  ];

  downloadCsv('report-overview.csv', headers, rows);
}
</script>
