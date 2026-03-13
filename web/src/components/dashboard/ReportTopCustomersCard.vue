<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.topCustomers') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.topCustomersDescription') }}</p>
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
        <select v-model="sortFilter" class="input">
          <option value="recent">{{ $t('cards.sortRecent') }}</option>
          <option value="mostStamps">{{ $t('cards.sortMostStamps') }}</option>
          <option value="mostRewards">{{ $t('cards.sortMostRewards') }}</option>
          <option value="mostVisits">{{ $t('cards.sortMostVisits') }}</option>
        </select>
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
        {{ loading ? $t('cards.loading') : $t('cards.loadTopCustomers') }}
      </button>
      <div v-if="report" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
        <p class="text-xs text-dusk/60">
          {{ $t('cards.range') }}:
          {{ new Date(report.range.start).toLocaleDateString() }} →
          {{ new Date(report.range.end).toLocaleDateString() }}
        </p>
        <div class="mt-3 space-y-2">
          <div
            v-for="item in report.customers.items"
            :key="item.customerId"
            class="rounded-xl bg-white/80 p-3 text-xs text-dusk/80"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="font-semibold text-dusk">
                {{ item.customerName || item.customerPhone }}
              </div>
              <span class="chip">{{ item.totalRewards }} {{ $t('cards.rewardsRedeemed') }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-3 text-[11px] text-dusk/70">
              <span>{{ $t('cards.stampsIssued') }}: {{ item.totalStamps }}</span>
              <span>{{ $t('cards.visitCount') }}: {{ item.visitCount }}</span>
              <span v-if="item.lastActivityAt">{{ $t('cards.lastActivity') }}: {{ formatDate(item.lastActivityAt) }}</span>
              <span>
                {{ $t('cards.currentProgress') }}: {{ item.currentStampCount }} / {{ item.stampThreshold }}
              </span>
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
import type { TopCustomersReport } from '../../lib/types';
import { downloadCsv } from '../../lib/csv';

const props = defineProps<{
  report: TopCustomersReport | null;
  loading: boolean;
  message: Message | null;
}>();

const emit = defineEmits<{
  (e: 'refresh', query?: { start?: string; end?: string; sort?: string; page?: number; pageSize?: number }): void;
}>();

const startDate = ref('');
const endDate = ref('');
const sortFilter = ref('recent');
const page = ref(1);
const pageSize = ref(25);
const { t } = useI18n();

const totalPages = computed(() => {
  if (!props.report) {
    return 1;
  }
  return Math.max(Math.ceil(props.report.customers.total / pageSize.value), 1);
});

watch(
  () => props.report,
  (value) => {
    if (!value) {
      return;
    }
    page.value = value.customers.page;
    pageSize.value = value.customers.pageSize;
  }
);

function buildQuery() {
  return {
    start: startDate.value || undefined,
    end: endDate.value || undefined,
    sort: sortFilter.value === 'recent' ? undefined : sortFilter.value,
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
    t('cards.customerId'),
    t('cards.customerPhone'),
    t('cards.customerName'),
    t('cards.stampsIssued'),
    t('cards.rewardsRedeemed'),
    t('cards.visitCount'),
    t('cards.lastActivity'),
    t('cards.currentProgress')
  ];
  const rows = report.customers.items.map((item) => [
    item.customerId,
    item.customerPhone,
    item.customerName || '',
    item.totalStamps,
    item.totalRewards,
    item.visitCount,
    item.lastActivityAt ? formatDate(item.lastActivityAt) : '',
    `${item.currentStampCount}/${item.stampThreshold}`
  ]);
  downloadCsv('top-customers.csv', headers, rows);
}
</script>
