<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.retention') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.retentionDescription') }}</p>
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
        {{ loading ? $t('cards.loading') : $t('cards.loadRetention') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-2 grid gap-2 sm:grid-cols-2 text-xs text-dusk/80">
          <p>{{ $t('cards.join7') }}: {{ formatPercent(report.returnedWithin7DaysOfJoin) }}</p>
          <p>{{ $t('cards.join30') }}: {{ formatPercent(report.returnedWithin30DaysOfJoin) }}</p>
          <p>{{ $t('cards.return7') }}: {{ formatPercent(report.returnedWithin7DaysOfLastActivity) }}</p>
          <p>{{ $t('cards.return30') }}: {{ formatPercent(report.returnedWithin30DaysOfLastActivity) }}</p>
        </div>
        <div class="mt-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-dusk/60">{{ $t('cards.repeaters') }}</p>
          <div class="mt-2 space-y-2">
            <div
              v-for="item in report.repeatActivityDistribution"
              :key="item.customerId"
              class="rounded-xl bg-white/80 p-3 text-xs text-dusk/80"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="font-semibold text-dusk">{{ item.customerName || item.customerPhone }}</div>
                <span class="chip">{{ item.visitCount }} {{ $t('cards.visitCount') }}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-dusk/70">
                <span>{{ $t('cards.stampsIssued') }}: {{ item.totalStamps }}</span>
                <span>{{ $t('cards.rewardsRedeemed') }}: {{ item.totalRewards }}</span>
                <span v-if="item.lastActivityAt">{{ $t('cards.lastActivity') }}: {{ formatDate(item.lastActivityAt) }}</span>
              </div>
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { RetentionReport } from '../../lib/types';
import { downloadCsv } from '../../lib/csv';

const props = defineProps<{
  report: RetentionReport | null;
  loading: boolean;
  message: Message | null;
}>();

const emit = defineEmits<{
  (e: 'refresh', query?: { start?: string; end?: string }): void;
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function exportCsv() {
  const report = props.report;
  if (!report) {
    return;
  }

  const headers = [t('cards.metric'), t('cards.value')];
  const rows: Array<Array<string | number>> = [
    [t('cards.join7'), formatPercent(report.returnedWithin7DaysOfJoin)],
    [t('cards.join30'), formatPercent(report.returnedWithin30DaysOfJoin)],
    [t('cards.return7'), formatPercent(report.returnedWithin7DaysOfLastActivity)],
    [t('cards.return30'), formatPercent(report.returnedWithin30DaysOfLastActivity)],
    [''],
    [t('cards.repeaters')],
    [t('cards.customerPhone'), t('cards.visitCount'), t('cards.stampsIssued'), t('cards.rewardsRedeemed')]
  ];

  report.repeatActivityDistribution.forEach((item) => {
    rows.push([
      item.customerName || item.customerPhone,
      item.visitCount,
      item.totalStamps,
      item.totalRewards
    ]);
  });

  downloadCsv('retention.csv', headers, rows);
}
</script>
