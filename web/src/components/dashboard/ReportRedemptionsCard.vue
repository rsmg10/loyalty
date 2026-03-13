<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.redemptionsReport') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.redemptionsReportDescription') }}</p>
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
      <div class="grid gap-2 sm:grid-cols-2">
        <select v-model.number="pageSize" class="input">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
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
        {{ loading ? $t('cards.loading') : $t('cards.loadRedemptionsReport') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
          <span class="chip">{{ $t('cards.totalRedemptions') }}: {{ report.totalRewardsRedeemed }}</span>
        </div>
        <div class="mt-3 space-y-2">
          <div
            v-for="item in report.recentRedemptions.items"
            :key="item.id"
            class="rounded-xl bg-white/80 p-3 text-xs text-dusk/80"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="font-semibold text-dusk">
                {{ item.customerName || item.customerPhone }}
              </div>
              <span class="chip">{{ item.rewardName }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-dusk/70">
              <span>{{ $t('cards.redeemedAt') }}: {{ formatDate(item.redeemedAt) }}</span>
              <span v-if="item.staffName">{{ $t('cards.staffLabel') }}: {{ item.staffName }}</span>
              <span v-else-if="item.redeemedByPhone">{{ $t('cards.redeemedBy') }}: {{ item.redeemedByPhone }}</span>
            </div>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-dusk/70">
          <button class="btn-ghost" :disabled="page <= 1" @click="goToPage(page - 1)">
            {{ $t('cards.prevPage') }}
          </button>
          <span>{{ $t('cards.page') }} {{ page }} / {{ totalPages }}</span>
          <button class="btn-ghost" :disabled="page >= totalPages" @click="goToPage(page + 1)">
            {{ $t('cards.nextPage') }}
          </button>
        </div>
      </div>
      <p v-if="message" :class="messageClass(message.tone)">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { RewardRedemptionReport } from '../../lib/types';
import { downloadCsv } from '../../lib/csv';

const props = defineProps<{
  report: RewardRedemptionReport | null;
  loading: boolean;
  message: Message | null;
}>();

const emit = defineEmits<{
  (e: 'refresh', query?: { start?: string; end?: string; page?: number; pageSize?: number }): void;
}>();

const startDate = ref('');
const endDate = ref('');
const page = ref(1);
const pageSize = ref(25);
const { t } = useI18n();

const totalPages = computed(() => {
  if (!props.report) {
    return 1;
  }
  return Math.max(Math.ceil(props.report.recentRedemptions.total / pageSize.value), 1);
});

watch(
  () => props.report,
  (value) => {
    if (!value) {
      return;
    }
    page.value = value.recentRedemptions.page;
    pageSize.value = value.recentRedemptions.pageSize;
  }
);

function buildQuery() {
  return {
    start: startDate.value || undefined,
    end: endDate.value || undefined,
    page: page.value,
    pageSize: pageSize.value
  };
}

function applyRange() {
  page.value = 1;
  emit('refresh', buildQuery());
}

function clearRange() {
  startDate.value = '';
  endDate.value = '';
  page.value = 1;
  emit('refresh', buildQuery());
}

function goToPage(nextPage: number) {
  page.value = Math.max(1, nextPage);
  emit('refresh', buildQuery());
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

watch(pageSize, () => {
  page.value = 1;
  emit('refresh', buildQuery());
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function exportCsv() {
  const report = props.report;
  if (!report) {
    return;
  }

  const headers = [
    t('cards.transactionId'),
    t('cards.customerPhone'),
    t('cards.customerName'),
    t('cards.rewardName'),
    t('cards.redeemedAt'),
    t('cards.staffLabel'),
    t('cards.redeemedBy')
  ];

  const rows = report.recentRedemptions.items.map((item) => [
    item.id,
    item.customerPhone,
    item.customerName || '',
    item.rewardName,
    formatDate(item.redeemedAt),
    item.staffName || '',
    item.redeemedByPhone || ''
  ]);

  downloadCsv('redemptions.csv', headers, rows);
}
</script>
