<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('admin.overviewTitle') }}</h2>
      <span class="chip">{{ $t('admin.platform') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('admin.overviewDescription') }}</p>
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { PlatformOverviewReport } from '../../lib/types';
import { downloadCsv } from '../../lib/csv';

const props = defineProps<{
  report: PlatformOverviewReport | null;
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

function exportCsv() {
  const report = props.report;
  if (!report) {
    return;
  }
  const headers = [t('cards.metric'), t('cards.value')];
  const rows = [
    [t('admin.totalVendors'), report.totalVendors],
    [t('admin.activeVendors'), report.activeVendors],
    [t('admin.disabledVendors'), report.disabledVendors],
    [t('admin.totalMemberships'), report.totalMemberships],
    [t('admin.newMemberships'), report.newMemberships],
    [t('admin.totalStampsIssued'), report.totalStampsIssued],
    [t('admin.totalRewardsRedeemed'), report.totalRewardsRedeemed]
  ];
  downloadCsv('admin-overview.csv', headers, rows);
}

function setPreset(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  startDate.value = formatDateInput(start);
  endDate.value = formatDateInput(end);
  emit('refresh', { start: startDate.value, end: endDate.value });
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
</script>
