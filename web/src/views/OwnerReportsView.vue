<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[280px_1fr]">
    <section v-if="!ownerBusinessOptions.length" class="glass-card animate-rise lg:col-span-2">
      <h2 class="section-title">{{ $t('ownerReports.ownerOnlyTitle') }}</h2>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerReports.ownerOnlyHint') }}</p>
      <button class="btn-primary mt-4" @click="backToDashboard">
        {{ $t('ownerReports.backToDashboard') }}
      </button>
    </section>

    <template v-else>
      <aside class="flex flex-col gap-6">
        <BusinessContextCard
          :business-options="ownerBusinessOptions"
          :selected-business="selectedBusiness"
          :phone-number="session.phoneNumber"
          :purpose="session.purpose"
          :owner-count="session.ownerBusinesses.length"
          :staff-count="session.staffBusinesses.length"
          :lock-business-selection="lockBusinessSelection"
          @update:selected-business="(value) => (selectedBusiness = value)"
          @refresh="refreshMe"
        />

        <section class="glass-card animate-rise">
          <h2 class="section-title">{{ $t('ownerReports.title') }}</h2>
          <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerReports.sidebarHint') }}</p>
          <button class="btn-ghost mt-4 w-full" @click="backToDashboard">
            {{ $t('ownerReports.backToDashboard') }}
          </button>
        </section>
      </aside>

      <section class="space-y-6">
        <section class="glass-card animate-rise">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="section-title">{{ $t('ownerReports.title') }}</h2>
              <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerReports.description') }}</p>
            </div>
            <span class="chip">{{ activeBusiness?.name || $t('dashboard.pickBusiness') }}</span>
          </div>
        </section>

        <ReportOverviewCard
          :report="reportOverview"
          :loading="reportOverviewLoading"
          :message="reportOverviewMessage"
          @refresh="loadReportOverview"
        />
        <ReportCustomerActivityCard
          :report="customerActivityReport"
          :loading="customerActivityLoading"
          :message="customerActivityMessage"
          @refresh="loadCustomerActivityReport"
        />
        <ReportStampIssuanceCard
          :report="stampIssuanceReport"
          :loading="stampIssuanceLoading"
          :message="stampIssuanceMessage"
          @refresh="loadStampIssuanceReport"
        />
        <ReportRedemptionsCard
          :report="redemptionsReport"
          :loading="redemptionsReportLoading"
          :message="redemptionsReportMessage"
          @refresh="loadRedemptionsReport"
        />
        <ReportProgramPerformanceCard
          :report="programPerformanceReport"
          :loading="programPerformanceLoading"
          :message="programPerformanceMessage"
          @refresh="loadProgramPerformanceReport"
        />
        <ReportProgressFunnelCard
          :report="progressFunnelReport"
          :loading="progressFunnelLoading"
          :message="progressFunnelMessage"
          @refresh="loadProgressFunnelReport"
        />
        <ReportTopCustomersCard
          :report="topCustomersReport"
          :loading="topCustomersLoading"
          :message="topCustomersMessage"
          @refresh="loadTopCustomersReport"
        />
        <ReportRetentionCard
          :report="retentionReport"
          :loading="retentionLoading"
          :message="retentionMessage"
          @refresh="loadRetentionReport"
        />
        <ReportTimeActivityCard
          :report="timeActivityReport"
          :loading="timeActivityLoading"
          :message="timeActivityMessage"
          @refresh="loadTimeActivityReport"
        />
        <ReportStaffActivityCard
          :report="staffActivityReport"
          :loading="staffActivityLoading"
          :message="staffActivityMessage"
          @refresh="loadStaffActivityReport"
        />
        <ReportSuspiciousActivityCard
          :report="suspiciousActivityReport"
          :loading="suspiciousActivityLoading"
          :message="suspiciousActivityMessage"
          @refresh="loadSuspiciousActivityReport"
        />
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { useLoyaltyApi } from '../composables/useLoyaltyApi';
import { getErrorMessage } from '../lib/errors';
import { setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import type {
  CustomerActivityReport,
  ProgramPerformanceReport,
  ProgressFunnelReport,
  RetentionReport,
  RewardRedemptionReport,
  StampIssuanceReport,
  StaffActivityReport,
  SuspiciousActivityReport,
  TimeActivityReport,
  TopCustomersReport,
  VendorOverviewReport
} from '../lib/types';
import BusinessContextCard from '../components/dashboard/BusinessContextCard.vue';
import ReportCustomerActivityCard from '../components/dashboard/ReportCustomerActivityCard.vue';
import ReportOverviewCard from '../components/dashboard/ReportOverviewCard.vue';
import ReportProgramPerformanceCard from '../components/dashboard/ReportProgramPerformanceCard.vue';
import ReportProgressFunnelCard from '../components/dashboard/ReportProgressFunnelCard.vue';
import ReportRedemptionsCard from '../components/dashboard/ReportRedemptionsCard.vue';
import ReportRetentionCard from '../components/dashboard/ReportRetentionCard.vue';
import ReportStaffActivityCard from '../components/dashboard/ReportStaffActivityCard.vue';
import ReportStampIssuanceCard from '../components/dashboard/ReportStampIssuanceCard.vue';
import ReportSuspiciousActivityCard from '../components/dashboard/ReportSuspiciousActivityCard.vue';
import ReportTimeActivityCard from '../components/dashboard/ReportTimeActivityCard.vue';
import ReportTopCustomersCard from '../components/dashboard/ReportTopCustomersCard.vue';

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'owner';
};

const router = useRouter();
const session = useSessionStore();
const api = computed(() => useLoyaltyApi(session.token));
const { t } = useI18n();

const reportOverview = ref<VendorOverviewReport | null>(null);
const reportOverviewLoading = ref(false);
const reportOverviewMessage = ref<Message | null>(null);
const customerActivityReport = ref<CustomerActivityReport | null>(null);
const customerActivityLoading = ref(false);
const customerActivityMessage = ref<Message | null>(null);
const stampIssuanceReport = ref<StampIssuanceReport | null>(null);
const stampIssuanceLoading = ref(false);
const stampIssuanceMessage = ref<Message | null>(null);
const redemptionsReport = ref<RewardRedemptionReport | null>(null);
const redemptionsReportLoading = ref(false);
const redemptionsReportMessage = ref<Message | null>(null);
const programPerformanceReport = ref<ProgramPerformanceReport | null>(null);
const programPerformanceLoading = ref(false);
const programPerformanceMessage = ref<Message | null>(null);
const progressFunnelReport = ref<ProgressFunnelReport | null>(null);
const progressFunnelLoading = ref(false);
const progressFunnelMessage = ref<Message | null>(null);
const topCustomersReport = ref<TopCustomersReport | null>(null);
const topCustomersLoading = ref(false);
const topCustomersMessage = ref<Message | null>(null);
const retentionReport = ref<RetentionReport | null>(null);
const retentionLoading = ref(false);
const retentionMessage = ref<Message | null>(null);
const timeActivityReport = ref<TimeActivityReport | null>(null);
const timeActivityLoading = ref(false);
const timeActivityMessage = ref<Message | null>(null);
const staffActivityReport = ref<StaffActivityReport | null>(null);
const staffActivityLoading = ref(false);
const staffActivityMessage = ref<Message | null>(null);
const suspiciousActivityReport = ref<SuspiciousActivityReport | null>(null);
const suspiciousActivityLoading = ref(false);
const suspiciousActivityMessage = ref<Message | null>(null);

const ownerBusinessOptions = computed<BusinessOption[]>(() =>
  session.ownerBusinesses.map((business) => ({
    ...business,
    role: 'owner'
  }))
);

const selectedBusiness = ref<number | ''>(session.activeBusinessId || '');

const activeBusiness = computed<BusinessOption | null>(() => {
  const id = Number(selectedBusiness.value);
  if (!id) {
    return null;
  }
  return ownerBusinessOptions.value.find((item) => item.id === id) || null;
});

const lockBusinessSelection = computed(() => ownerBusinessOptions.value.length <= 1);

watch(
  ownerBusinessOptions,
  (options) => {
    if (!options.length) {
      selectedBusiness.value = '';
      session.setActiveBusiness(null);
      return;
    }

    const selectedId = Number(selectedBusiness.value);
    const stillValid = options.some((item) => item.id === selectedId);
    if (!stillValid) {
      selectedBusiness.value = options[0].id;
      session.setActiveBusiness(options[0].id);
    }
  },
  { immediate: true }
);

watch(selectedBusiness, (value) => {
  session.setActiveBusiness(value ? Number(value) : null);
});

watch(
  () => activeBusiness.value?.id,
  () => {
    reportOverview.value = null;
    customerActivityReport.value = null;
    stampIssuanceReport.value = null;
    redemptionsReport.value = null;
    programPerformanceReport.value = null;
    progressFunnelReport.value = null;
    topCustomersReport.value = null;
    retentionReport.value = null;
    timeActivityReport.value = null;
    staffActivityReport.value = null;
    suspiciousActivityReport.value = null;
  }
);

onMounted(async () => {
  if (session.token && !session.meLoaded) {
    await session.fetchMe();
  }
});

async function refreshMe() {
  try {
    await session.fetchMe();
  } catch (error) {
    setMessage(reportOverviewMessage, 'error', getErrorMessage(error));
  }
}

async function loadReportOverview(query?: { start?: string; end?: string }) {
  if (!activeBusiness.value) {
    setMessage(reportOverviewMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  reportOverviewLoading.value = true;
  try {
    reportOverview.value = await api.value.getReportOverview(activeBusiness.value.id, query);
    setMessage(reportOverviewMessage, 'success', t('messages.reportOverviewLoaded'));
  } catch (error) {
    setMessage(reportOverviewMessage, 'error', getErrorMessage(error));
  } finally {
    reportOverviewLoading.value = false;
  }
}

async function loadCustomerActivityReport(query?: {
  start?: string;
  end?: string;
  status?: string;
  reward?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  if (!activeBusiness.value) {
    setMessage(customerActivityMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  customerActivityLoading.value = true;
  try {
    customerActivityReport.value = await api.value.getCustomerActivityReport(activeBusiness.value.id, query);
    setMessage(customerActivityMessage, 'success', t('messages.customerActivityLoaded'));
  } catch (error) {
    setMessage(customerActivityMessage, 'error', getErrorMessage(error));
  } finally {
    customerActivityLoading.value = false;
  }
}

async function loadStampIssuanceReport(query?: {
  start?: string;
  end?: string;
  staffId?: number;
  page?: number;
  pageSize?: number;
}) {
  if (!activeBusiness.value) {
    setMessage(stampIssuanceMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  stampIssuanceLoading.value = true;
  try {
    stampIssuanceReport.value = await api.value.getStampIssuanceReport(activeBusiness.value.id, query);
    setMessage(stampIssuanceMessage, 'success', t('messages.stampIssuanceLoaded'));
  } catch (error) {
    setMessage(stampIssuanceMessage, 'error', getErrorMessage(error));
  } finally {
    stampIssuanceLoading.value = false;
  }
}

async function loadRedemptionsReport(query?: { start?: string; end?: string; page?: number; pageSize?: number }) {
  if (!activeBusiness.value) {
    setMessage(redemptionsReportMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  redemptionsReportLoading.value = true;
  try {
    redemptionsReport.value = await api.value.getRedemptionsReport(activeBusiness.value.id, query);
    setMessage(redemptionsReportMessage, 'success', t('messages.redemptionsReportLoaded'));
  } catch (error) {
    setMessage(redemptionsReportMessage, 'error', getErrorMessage(error));
  } finally {
    redemptionsReportLoading.value = false;
  }
}

async function loadProgramPerformanceReport(query?: { start?: string; end?: string }) {
  if (!activeBusiness.value) {
    setMessage(programPerformanceMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  programPerformanceLoading.value = true;
  try {
    programPerformanceReport.value = await api.value.getProgramPerformanceReport(activeBusiness.value.id, query);
    setMessage(programPerformanceMessage, 'success', t('messages.programPerformanceLoaded'));
  } catch (error) {
    setMessage(programPerformanceMessage, 'error', getErrorMessage(error));
  } finally {
    programPerformanceLoading.value = false;
  }
}

async function loadProgressFunnelReport(query?: { start?: string; end?: string }) {
  if (!activeBusiness.value) {
    setMessage(progressFunnelMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  progressFunnelLoading.value = true;
  try {
    progressFunnelReport.value = await api.value.getProgressFunnelReport(activeBusiness.value.id, query);
    setMessage(progressFunnelMessage, 'success', t('messages.progressFunnelLoaded'));
  } catch (error) {
    setMessage(progressFunnelMessage, 'error', getErrorMessage(error));
  } finally {
    progressFunnelLoading.value = false;
  }
}

async function loadTopCustomersReport(query?: {
  start?: string;
  end?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  if (!activeBusiness.value) {
    setMessage(topCustomersMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  topCustomersLoading.value = true;
  try {
    topCustomersReport.value = await api.value.getTopCustomersReport(activeBusiness.value.id, query);
    setMessage(topCustomersMessage, 'success', t('messages.topCustomersLoaded'));
  } catch (error) {
    setMessage(topCustomersMessage, 'error', getErrorMessage(error));
  } finally {
    topCustomersLoading.value = false;
  }
}

async function loadRetentionReport(query?: { start?: string; end?: string }) {
  if (!activeBusiness.value) {
    setMessage(retentionMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  retentionLoading.value = true;
  try {
    retentionReport.value = await api.value.getRetentionReport(activeBusiness.value.id, query);
    setMessage(retentionMessage, 'success', t('messages.retentionLoaded'));
  } catch (error) {
    setMessage(retentionMessage, 'error', getErrorMessage(error));
  } finally {
    retentionLoading.value = false;
  }
}

async function loadTimeActivityReport(query?: { start?: string; end?: string }) {
  if (!activeBusiness.value) {
    setMessage(timeActivityMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  timeActivityLoading.value = true;
  try {
    timeActivityReport.value = await api.value.getTimeActivityReport(activeBusiness.value.id, query);
    setMessage(timeActivityMessage, 'success', t('messages.timeActivityLoaded'));
  } catch (error) {
    setMessage(timeActivityMessage, 'error', getErrorMessage(error));
  } finally {
    timeActivityLoading.value = false;
  }
}

async function loadStaffActivityReport(query?: { start?: string; end?: string }) {
  if (!activeBusiness.value) {
    setMessage(staffActivityMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  staffActivityLoading.value = true;
  try {
    staffActivityReport.value = await api.value.getStaffActivityReport(activeBusiness.value.id, query);
    setMessage(staffActivityMessage, 'success', t('messages.staffActivityLoaded'));
  } catch (error) {
    setMessage(staffActivityMessage, 'error', getErrorMessage(error));
  } finally {
    staffActivityLoading.value = false;
  }
}

async function loadSuspiciousActivityReport(query?: { start?: string; end?: string }) {
  if (!activeBusiness.value) {
    setMessage(suspiciousActivityMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  suspiciousActivityLoading.value = true;
  try {
    suspiciousActivityReport.value = await api.value.getSuspiciousActivityReport(activeBusiness.value.id, query);
    setMessage(suspiciousActivityMessage, 'success', t('messages.suspiciousActivityLoaded'));
  } catch (error) {
    setMessage(suspiciousActivityMessage, 'error', getErrorMessage(error));
  } finally {
    suspiciousActivityLoading.value = false;
  }
}

function backToDashboard() {
  router.push({ name: 'app' });
}
</script>
