<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.suspiciousActivity') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.suspiciousActivityDescription') }}</p>
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
        {{ loading ? $t('cards.loading') : $t('cards.loadSuspiciousActivity') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-3 space-y-2">
          <div
            v-for="item in report.items"
            :key="`${item.eventType}-${item.windowStart}-${item.staffId}-${item.customerId}`"
            class="rounded-xl bg-white/80 p-3 text-xs text-dusk/80"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="font-semibold text-dusk">{{ item.reason }}</div>
              <span class="chip">{{ item.count }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-dusk/70">
              <span>{{ $t('cards.eventType') }}: {{ item.eventType }}</span>
              <span v-if="item.staffName">{{ $t('cards.staffLabel') }}: {{ item.staffName }}</span>
              <span v-if="item.customerPhone">{{ $t('cards.customerPhone') }}: {{ item.customerPhone }}</span>
              <span>{{ $t('cards.windowStart') }}: {{ formatDate(item.windowStart) }}</span>
              <span>{{ $t('cards.windowEnd') }}: {{ formatDate(item.windowEnd) }}</span>
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
import type { SuspiciousActivityReport } from '../../lib/types';
import { downloadCsv } from '../../lib/csv';

const props = defineProps<{
  report: SuspiciousActivityReport | null;
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function exportCsv() {
  const report = props.report;
  if (!report) {
    return;
  }

  const headers = [
    t('cards.eventType'),
    t('cards.reasonLabel'),
    t('cards.staffLabel'),
    t('cards.customerPhone'),
    t('cards.windowStart'),
    t('cards.windowEnd'),
    t('cards.count')
  ];

  const rows = report.items.map((item) => [
    item.eventType,
    item.reason,
    item.staffName || '',
    item.customerPhone || '',
    formatDate(item.windowStart),
    formatDate(item.windowEnd),
    item.count
  ]);

  downloadCsv('suspicious-activity.csv', headers, rows);
}
</script>
