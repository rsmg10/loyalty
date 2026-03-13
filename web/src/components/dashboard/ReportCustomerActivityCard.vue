<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.customerActivity') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.customerActivityDescription') }}</p>
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
      <div class="grid gap-2 sm:grid-cols-3">
        <select v-model="statusFilter" class="input">
          <option value="all">{{ $t('cards.filterAll') }}</option>
          <option value="active">{{ $t('cards.active') }}</option>
          <option value="inactive">{{ $t('cards.inactive') }}</option>
        </select>
        <select v-model="rewardFilter" class="input">
          <option value="all">{{ $t('cards.filterAll') }}</option>
          <option value="available">{{ $t('cards.rewardAvailable') }}</option>
          <option value="unavailable">{{ $t('cards.rewardUnavailable') }}</option>
        </select>
        <select v-model="sortFilter" class="input">
          <option value="recent">{{ $t('cards.sortRecent') }}</option>
          <option value="mostStamps">{{ $t('cards.sortMostStamps') }}</option>
          <option value="mostRewards">{{ $t('cards.sortMostRewards') }}</option>
          <option value="newest">{{ $t('cards.sortNewest') }}</option>
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
        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-dusk/70">
          <button class="btn-ghost" :disabled="page <= 1" @click="goToPage(page - 1)">
            {{ $t('cards.prevPage') }}
          </button>
          <span>{{ $t('cards.page') }} {{ page }} / {{ totalPages }}</span>
          <button class="btn-ghost" :disabled="page >= totalPages" @click="goToPage(page + 1)">
            {{ $t('cards.nextPage') }}
          </button>
          <select v-model.number="pageSize" class="input w-24">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
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
import type { CustomerActivityReport } from '../../lib/types';
import { downloadCsv } from '../../lib/csv';

const props = defineProps<{
  report: CustomerActivityReport | null;
  loading: boolean;
  message: Message | null;
}>();

const emit = defineEmits<{
  (e: 'refresh', query?: { start?: string; end?: string; status?: string; reward?: string; sort?: string; page?: number; pageSize?: number }): void;
}>();

const startDate = ref('');
const endDate = ref('');
const { t } = useI18n();
const statusFilter = ref('all');
const rewardFilter = ref('all');
const sortFilter = ref('recent');
const page = ref(1);
const pageSize = ref(25);

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function buildQuery() {
  return {
    start: startDate.value || undefined,
    end: endDate.value || undefined,
    status: statusFilter.value === 'all' ? undefined : statusFilter.value,
    reward: rewardFilter.value === 'all' ? undefined : rewardFilter.value,
    sort: sortFilter.value === 'recent' ? undefined : sortFilter.value,
    page: page.value,
    pageSize: pageSize.value
  };
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

function exportCsv() {
  const report = props.report;
  if (!report) {
    return;
  }

  const headers = [
    t('cards.customerId'),
    t('cards.customerPhone'),
    t('cards.displayName'),
    t('cards.memberSince'),
    t('cards.lastStamp'),
    t('cards.stampsIssued'),
    t('cards.rewardsRedeemed'),
    t('cards.currentProgress'),
    t('cards.rewardAvailable'),
    t('cards.active')
  ];

  const rows = report.customers.items.map((item) => [
    item.customerId,
    item.phoneNumber,
    item.displayName || '',
    formatDate(item.memberSince),
    item.lastStampAt ? formatDate(item.lastStampAt) : '',
    item.totalStampsIssued,
    item.totalRewardsRedeemed,
    `${item.currentStampCount}/${item.stampThreshold}`,
    item.rewardAvailable ? t('cards.yes') : t('cards.no'),
    item.isActive ? t('cards.active') : t('cards.inactive')
  ]);

  downloadCsv('customer-activity.csv', headers, rows);
}
</script>
