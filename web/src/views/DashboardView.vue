<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[280px_1fr]">
    <aside class="flex flex-col gap-6">
      <BusinessContextCard
        :business-options="businessOptions"
        :selected-business="selectedBusiness"
        :phone-number="session.phoneNumber"
        :purpose="session.purpose"
        :owner-count="session.ownerBusinesses.length"
        :staff-count="session.staffBusinesses.length"
        @update:selected-business="(value) => (selectedBusiness = value)"
        @refresh="refreshMe"
      />

      <QuickActionsCard
        v-if="activeBusiness"
        :is-owner="isOwner"
        :staff-loading="staffLoading"
        :redemptions-loading="redemptionsLoading"
        @load-staff="loadStaff"
        @load-redemptions="loadRedemptions"
      />

      <SectionNavCard
        v-if="activeBusiness"
        :is-owner="isOwner"
        :active-section="activeSection"
        @jump="jumpTo"
      />
    </aside>

    <section class="flex flex-col gap-6">
      <section v-if="!activeBusiness" class="glass-card animate-rise">
        <h2 class="section-title">{{ $t('dashboard.pickBusiness') }}</h2>
        <p class="mt-2 text-sm text-dusk/70">{{ $t('dashboard.pickHint') }}</p>
      </section>

      <section v-else class="space-y-6">
        <QuickActionsToolbar :is-owner="isOwner" @jump="jumpTo" />

        <SectionGroup
          section-id="front-counter"
          :title="$t('dashboard.frontCounter')"
          :subtitle="$t('dashboard.frontCounterSubtitle')"
          :default-open="true"
        >
          <VisitEntryCard
            :phone="visit.phone"
            :loading="visitLoading"
            :result="visitResult"
            :message="visitMessage"
            @update:phone="(value) => (visit.phone = value)"
            @record="recordVisit"
          />
          <StampIssueCard
            :phone="stampIssue.phone"
            :quantity="stampIssue.quantity"
            :reason="stampIssue.reason"
            :loading="stampIssueLoading"
            :result="stampIssueResult"
            :message="stampIssueMessage"
            @update:phone="(value) => (stampIssue.phone = value)"
            @update:quantity="(value) => (stampIssue.quantity = value)"
            @update:reason="(value) => (stampIssue.reason = value)"
            @issue="issueStamps"
          />
          <RedemptionCard
            :phone="redeem.phone"
            :loading="redeemLoading"
            :result="redeemResult"
            :message="redeemMessage"
            @update:phone="(value) => (redeem.phone = value)"
            @redeem="redeemReward"
          />
        </SectionGroup>

        <SectionGroup
          section-id="customer-care"
          :title="$t('dashboard.customerCare')"
          :subtitle="$t('dashboard.customerCareSubtitle')"
          :default-open="true"
        >
          <CustomerLookupCard
            :phone="lookup.phone"
            :loading="lookupLoading"
            :result="lookupResult"
            :message="lookupMessage"
            :visit-history="visitHistory"
            :history-loading="historyLoading"
            :stamp-history="stampHistory"
            :stamp-history-loading="stampHistoryLoading"
            @update:phone="(value) => (lookup.phone = value)"
            @fetch="fetchCustomer"
            @fetch-history="fetchHistory"
            @fetch-stamps="fetchStampHistory"
          />
          <CustomerProfileCard
            :profile="profile"
            :loading="profileLoading"
            :message="profileMessage"
            @update:phone="(value) => (profile.phone = value)"
            @update:display-name="(value) => (profile.displayName = value)"
            @update:mobile-number="(value) => (profile.mobileNumber = value)"
            @update:usual-order="(value) => (profile.usualOrder = value)"
            @update:notes="(value) => (profile.notes = value)"
            @save="updateProfile"
          />
          <MembershipCard
            :phone="membership.phone"
            :loading="membershipLoading"
            :message="membershipMessage"
            @update:phone="(value) => (membership.phone = value)"
            @create="createMembership"
          />
        </SectionGroup>

        <SectionGroup
          v-if="isOwner"
          section-id="owner-tools"
          :title="$t('dashboard.ownerTools')"
          :subtitle="$t('dashboard.ownerToolsSubtitle')"
          :default-open="false"
        >
          <LoyaltyConfigCard
            :config="loyaltyConfig"
            :loading="loyaltyLoading"
            :message="loyaltyMessage"
            @update:program-name="(value) => (loyaltyConfig.programName = value)"
            @update:program-description="(value) => (loyaltyConfig.programDescription = value)"
            @update:reward-name="(value) => (loyaltyConfig.rewardName = value)"
            @update:visit-threshold="(value) => (loyaltyConfig.visitThreshold = value)"
            @update:optional-note="(value) => (loyaltyConfig.optionalNote = value)"
            @update:stamp-expiration-days="(value) => (loyaltyConfig.stampExpirationDays = value)"
            @program-icon-change="onProgramIconChange"
            @reward-image-change="onRewardImageChange"
            @upload-program-icon="uploadProgramIcon"
            @upload-reward-image="uploadRewardImage"
            @save="saveLoyaltyConfig"
            @refresh="loadLoyaltyConfig"
          />
          <MagicLinkCard
            :link="magicLink?.url || null"
            :expires-at="magicLink?.expiresAt || null"
            :business-name="magicLink?.businessName || null"
            :qr-data-url="magicLinkQr"
            :loading="magicLinkLoading"
            :message="magicLinkMessage"
            @generate="generateMagicLink"
            @copy="copyMagicLink"
          />
          <StaffManagementCard
            :staff="staff"
            :staff-list="staffList"
            :loading="staffLoading"
            :message="staffMessage"
            @update:display-name="(value) => (staff.displayName = value)"
            @update:phone-number="(value) => (staff.phoneNumber = value)"
            @add="addStaff"
            @refresh="loadStaff"
          />
          <RedemptionsCard
            :items="redemptions"
            :loading="redemptionsLoading"
            :message="redemptionsMessage"
            @refresh="loadRedemptions"
          />
          <StatsCard
            :stats="stats"
            :loading="statsLoading"
            :message="statsMessage"
            @refresh="loadStats"
          />
        </SectionGroup>
      </section>
    </section>
  </main>

  <div
    v-if="activeBusiness"
    class="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/70 bg-white/80 p-2 shadow-card backdrop-blur lg:hidden"
  >
    <button class="btn-mini" @click="toggleQuickActions">
      {{ quickActionsOpen ? $t('nav.hide') : $t('nav.actions') }}
    </button>
    <div v-if="quickActionsOpen" class="flex gap-2">
      <button
        class="btn-mini"
        :class="activeSection === 'front-counter' ? 'border-ember/40 text-ember' : ''"
        @click="jumpTo('front-counter')"
      >
        {{ $t('nav.counter') }}
      </button>
      <button
        class="btn-mini"
        :class="activeSection === 'customer-care' ? 'border-ember/40 text-ember' : ''"
        @click="jumpTo('customer-care')"
      >
        {{ $t('nav.customers') }}
      </button>
      <button
        v-if="isOwner"
        class="btn-mini"
        :class="activeSection === 'owner-tools' ? 'border-ember/40 text-ember' : ''"
        @click="jumpTo('owner-tools')"
      >
        {{ $t('nav.owner') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { getErrorMessage } from '../lib/errors';
import { setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import { useLoyaltyApi } from '../composables/useLoyaltyApi';
import { useI18n } from 'vue-i18n';
import type {
  BusinessStatsResponse,
  CustomerStatusResponse,
  MagicLinkResponse,
  RedemptionResponse,
  RedemptionSummary,
  StampIssueResponse,
  StampTransactionItem,
  StaffResponse,
  VisitHistoryItem,
  VisitResponse
} from '../lib/types';
import { useSessionStore } from '../stores/session';
import BusinessContextCard from '../components/dashboard/BusinessContextCard.vue';
import QuickActionsCard from '../components/dashboard/QuickActionsCard.vue';
import QuickActionsToolbar from '../components/dashboard/QuickActionsToolbar.vue';
import SectionNavCard from '../components/dashboard/SectionNavCard.vue';
import VisitEntryCard from '../components/dashboard/VisitEntryCard.vue';
import StampIssueCard from '../components/dashboard/StampIssueCard.vue';
import RedemptionCard from '../components/dashboard/RedemptionCard.vue';
import CustomerLookupCard from '../components/dashboard/CustomerLookupCard.vue';
import CustomerProfileCard from '../components/dashboard/CustomerProfileCard.vue';
import MembershipCard from '../components/dashboard/MembershipCard.vue';
import LoyaltyConfigCard from '../components/dashboard/LoyaltyConfigCard.vue';
import StaffManagementCard from '../components/dashboard/StaffManagementCard.vue';
import RedemptionsCard from '../components/dashboard/RedemptionsCard.vue';
import StatsCard from '../components/dashboard/StatsCard.vue';
import SectionGroup from '../components/dashboard/SectionGroup.vue';
import MagicLinkCard from '../components/dashboard/MagicLinkCard.vue';
import QRCode from 'qrcode';

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'owner' | 'staff';
};

const session = useSessionStore();
const api = computed(() => useLoyaltyApi(session.token));
const { t } = useI18n();

const visit = reactive({
  phone: ''
});
const visitResult = ref<VisitResponse | null>(null);
const visitLoading = ref(false);
const visitMessage = ref<Message | null>(null);

const stampIssue = reactive({
  phone: '',
  quantity: 1,
  reason: ''
});
const stampIssueResult = ref<StampIssueResponse | null>(null);
const stampIssueLoading = ref(false);
const stampIssueMessage = ref<Message | null>(null);

const redeem = reactive({
  phone: ''
});
const redeemResult = ref<RedemptionResponse | null>(null);
const redeemLoading = ref(false);
const redeemMessage = ref<Message | null>(null);

const lookup = reactive({
  phone: ''
});
const lookupResult = ref<CustomerStatusResponse | null>(null);
const visitHistory = ref<VisitHistoryItem[]>([]);
const stampHistory = ref<StampTransactionItem[]>([]);
const lookupLoading = ref(false);
const historyLoading = ref(false);
const stampHistoryLoading = ref(false);
const lookupMessage = ref<Message | null>(null);

const profile = reactive({
  phone: '',
  displayName: '',
  mobileNumber: '',
  usualOrder: '',
  notes: ''
});
const profileLoading = ref(false);
const profileMessage = ref<Message | null>(null);

const staff = reactive({
  displayName: '',
  phoneNumber: ''
});
const staffList = ref<StaffResponse[]>([]);
const staffLoading = ref(false);
const staffMessage = ref<Message | null>(null);

const loyaltyConfig = reactive({
  programName: '',
  programDescription: '',
  rewardName: '',
  programIconUrl: '',
  rewardImageUrl: '',
  visitThreshold: 9,
  optionalNote: '',
  stampExpirationDays: '' as string | number
});
const loyaltyLoading = ref(false);
const loyaltyMessage = ref<Message | null>(null);

const media = reactive({
  programIconFile: null as File | null,
  rewardImageFile: null as File | null
});

const redemptions = ref<RedemptionSummary[]>([]);
const redemptionsLoading = ref(false);
const redemptionsMessage = ref<Message | null>(null);

const membership = reactive({
  phone: ''
});
const membershipLoading = ref(false);
const membershipMessage = ref<Message | null>(null);

const stats = ref<BusinessStatsResponse | null>(null);
const statsLoading = ref(false);
const statsMessage = ref<Message | null>(null);

const magicLink = ref<MagicLinkResponse | null>(null);
const magicLinkQr = ref<string | null>(null);
const magicLinkLoading = ref(false);
const magicLinkMessage = ref<Message | null>(null);

const activeSection = ref('front-counter');
const quickActionsOpen = ref(false);

const businessOptions = computed<BusinessOption[]>(() => {
  const map = new Map();
  session.ownerBusinesses.forEach((business) => {
    map.set(business.id, { ...business, role: 'owner' });
  });
  session.staffBusinesses.forEach((business) => {
    if (!map.has(business.id)) {
      map.set(business.id, { ...business, role: 'staff' });
    }
  });
  return Array.from(map.values());
});

const selectedBusiness = ref<number | ''>(session.activeBusinessId || '');

const activeBusiness = computed<BusinessOption | null>(() => {
  const id = Number(selectedBusiness.value);
  if (!id) {
    return null;
  }
  return businessOptions.value.find((item) => item.id === id) || null;
});

const isOwner = computed(() => {
  if (!activeBusiness.value) {
    return false;
  }
  return session.ownerBusinesses.some((item) => item.id === activeBusiness.value.id);
});

watch(selectedBusiness, (value) => {
  session.setActiveBusiness(value ? Number(value) : null);
});

watch(
  () => session.activeBusinessId,
  (value) => {
    if (!value) {
      selectedBusiness.value = '';
      return;
    }
    selectedBusiness.value = value;
  }
);

watch(
  () => activeBusiness.value?.id,
  async (value) => {
    magicLink.value = null;
    magicLinkQr.value = null;
    magicLinkMessage.value = null;

    if (value && isOwner.value) {
      await loadLoyaltyConfig();
    }
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
    setMessage(visitMessage, 'error', getErrorMessage(error));
  }
}

function jumpTo(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (!element) {
    return;
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  activeSection.value = sectionId;
  quickActionsOpen.value = false;
}

function toggleQuickActions() {
  quickActionsOpen.value = !quickActionsOpen.value;
}

onMounted(() => {
  const targets = ['front-counter', 'customer-care', 'owner-tools']
    .map((id) => document.getElementById(id))
    .filter(Boolean) as HTMLElement[];

  if (targets.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        activeSection.value = visible.target.id;
      }
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: [0.1, 0.25, 0.5, 0.75] }
  );

  targets.forEach((target) => observer.observe(target));
});

async function recordVisit() {
  if (!activeBusiness.value) {
    setMessage(visitMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  visitLoading.value = true;
  try {
    const data = await api.value.recordVisit(activeBusiness.value.id, visit.phone);
    visitResult.value = data;
    setMessage(visitMessage, 'success', t('messages.visitProcessed'));
  } catch (error) {
    setMessage(visitMessage, 'error', getErrorMessage(error));
  } finally {
    visitLoading.value = false;
  }
}

async function redeemReward() {
  if (!activeBusiness.value) {
    setMessage(redeemMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  redeemLoading.value = true;
  try {
    const data = await api.value.redeem(activeBusiness.value.id, redeem.phone);
    redeemResult.value = data;
    setMessage(redeemMessage, 'success', t('messages.rewardRedeemed'));
  } catch (error) {
    setMessage(redeemMessage, 'error', getErrorMessage(error));
  } finally {
    redeemLoading.value = false;
  }
}

async function fetchCustomer() {
  if (!activeBusiness.value) {
    setMessage(lookupMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  lookupLoading.value = true;
  try {
    const data = await api.value.getCustomerStatus(activeBusiness.value.id, lookup.phone);
    lookupResult.value = data;
    profile.phone = lookup.phone;
    setMessage(lookupMessage, 'success', t('messages.customerLoaded'));
  } catch (error) {
    setMessage(lookupMessage, 'error', getErrorMessage(error));
  } finally {
    lookupLoading.value = false;
  }
}

async function fetchHistory() {
  if (!activeBusiness.value) {
    setMessage(lookupMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  historyLoading.value = true;
  try {
    const data = await api.value.getVisitHistory(activeBusiness.value.id, lookup.phone);
    visitHistory.value = data || [];
    setMessage(lookupMessage, 'success', t('messages.historyLoaded'));
  } catch (error) {
    setMessage(lookupMessage, 'error', getErrorMessage(error));
  } finally {
    historyLoading.value = false;
  }
}

async function fetchStampHistory() {
  if (!activeBusiness.value) {
    setMessage(lookupMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  stampHistoryLoading.value = true;
  try {
    const data = await api.value.getStampHistory(activeBusiness.value.id, lookup.phone);
    stampHistory.value = data || [];
    setMessage(lookupMessage, 'success', t('messages.stampHistoryLoaded'));
  } catch (error) {
    setMessage(lookupMessage, 'error', getErrorMessage(error));
  } finally {
    stampHistoryLoading.value = false;
  }
}

async function updateProfile() {
  if (!activeBusiness.value) {
    setMessage(profileMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  profileLoading.value = true;
  try {
    await api.value.updateCustomerProfile(activeBusiness.value.id, profile.phone, {
      displayName: profile.displayName,
      mobileNumber: profile.mobileNumber,
      usualOrder: profile.usualOrder,
      notes: profile.notes
    });
    setMessage(profileMessage, 'success', t('messages.profileUpdated'));
  } catch (error) {
    setMessage(profileMessage, 'error', getErrorMessage(error));
  } finally {
    profileLoading.value = false;
  }
}

async function addStaff() {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  staffLoading.value = true;
  try {
    await api.value.addStaff(activeBusiness.value.id, {
      displayName: staff.displayName,
      phoneNumber: staff.phoneNumber
    });
    staff.displayName = '';
    staff.phoneNumber = '';
    setMessage(staffMessage, 'success', t('messages.staffAdded'));
    await loadStaff();
  } catch (error) {
    setMessage(staffMessage, 'error', getErrorMessage(error));
  } finally {
    staffLoading.value = false;
  }
}

async function loadStaff() {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  staffLoading.value = true;
  try {
    staffList.value = await api.value.getStaff(activeBusiness.value.id);
    setMessage(staffMessage, 'success', t('messages.staffRefreshed'));
  } catch (error) {
    setMessage(staffMessage, 'error', getErrorMessage(error));
  } finally {
    staffLoading.value = false;
  }
}

async function loadRedemptions() {
  if (!activeBusiness.value) {
    setMessage(redemptionsMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  redemptionsLoading.value = true;
  try {
    redemptions.value = await api.value.getRedemptions(activeBusiness.value.id);
    setMessage(redemptionsMessage, 'success', t('messages.redemptionsLoaded'));
  } catch (error) {
    setMessage(redemptionsMessage, 'error', getErrorMessage(error));
  } finally {
    redemptionsLoading.value = false;
  }
}

async function loadLoyaltyConfig() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    const data = await api.value.getBusiness(activeBusiness.value.id);
    loyaltyConfig.programName = data.programName || '';
    loyaltyConfig.programDescription = data.programDescription || '';
    loyaltyConfig.programIconUrl = data.programIconUrl || '';
    loyaltyConfig.rewardName = data.rewardName || '';
    loyaltyConfig.rewardImageUrl = data.rewardImageUrl || '';
    loyaltyConfig.visitThreshold = data.visitThreshold || 1;
    loyaltyConfig.optionalNote = data.optionalNote || '';
    loyaltyConfig.stampExpirationDays = data.stampExpirationDays ?? '';
    setMessage(loyaltyMessage, 'success', t('messages.configLoaded'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}

async function saveLoyaltyConfig() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!loyaltyConfig.programName.trim()) {
    setMessage(loyaltyMessage, 'error', t('messages.programNameRequired'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    await api.value.updateLoyaltyConfig(activeBusiness.value.id, {
      programName: loyaltyConfig.programName,
      programDescription: loyaltyConfig.programDescription,
      rewardName: loyaltyConfig.rewardName,
      visitThreshold: loyaltyConfig.visitThreshold,
      optionalNote: loyaltyConfig.optionalNote,
      stampExpirationDays: loyaltyConfig.stampExpirationDays || null
    });
    setMessage(loyaltyMessage, 'success', t('messages.configUpdated'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}

async function issueStamps() {
  if (!activeBusiness.value) {
    setMessage(stampIssueMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!stampIssue.phone.trim()) {
    setMessage(stampIssueMessage, 'error', t('messages.customerPhoneRequired'));
    return;
  }
  if (!stampIssue.reason.trim()) {
    setMessage(stampIssueMessage, 'error', t('messages.reasonRequired'));
    return;
  }
  if (!stampIssue.quantity || stampIssue.quantity <= 0) {
    setMessage(stampIssueMessage, 'error', t('messages.quantityPositive'));
    return;
  }
  stampIssueLoading.value = true;
  try {
    const data = await api.value.issueStamps(activeBusiness.value.id, {
      customerPhone: stampIssue.phone,
      quantity: stampIssue.quantity,
      reason: stampIssue.reason
    });
    stampIssueResult.value = data;
    setMessage(stampIssueMessage, 'success', t('messages.stampsIssued'));
  } catch (error) {
    setMessage(stampIssueMessage, 'error', getErrorMessage(error));
  } finally {
    stampIssueLoading.value = false;
  }
}

async function createMembership() {
  if (!activeBusiness.value) {
    setMessage(membershipMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!membership.phone.trim()) {
    setMessage(membershipMessage, 'error', t('messages.customerPhoneRequired'));
    return;
  }
  membershipLoading.value = true;
  try {
    await api.value.createMembership(activeBusiness.value.id, membership.phone);
    setMessage(membershipMessage, 'success', t('messages.membershipCreated'));
  } catch (error) {
    setMessage(membershipMessage, 'error', getErrorMessage(error));
  } finally {
    membershipLoading.value = false;
  }
}

async function loadStats() {
  if (!activeBusiness.value) {
    setMessage(statsMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  statsLoading.value = true;
  try {
    stats.value = await api.value.getStats(activeBusiness.value.id);
    setMessage(statsMessage, 'success', t('messages.statsLoaded'));
  } catch (error) {
    setMessage(statsMessage, 'error', getErrorMessage(error));
  } finally {
    statsLoading.value = false;
  }
}

async function generateMagicLink() {
  if (!activeBusiness.value) {
    setMessage(magicLinkMessage, 'error', t('messages.selectBusiness'));
    return;
  }

  magicLinkLoading.value = true;
  try {
    const data = await api.value.createMagicLink(activeBusiness.value.id);
    magicLink.value = data;
    magicLinkQr.value = await QRCode.toDataURL(data.url, { width: 240, margin: 1 });
    setMessage(magicLinkMessage, 'success', t('messages.magicLinkCreated'));
  } catch (error) {
    setMessage(magicLinkMessage, 'error', getErrorMessage(error));
  } finally {
    magicLinkLoading.value = false;
  }
}

async function copyMagicLink() {
  if (!magicLink.value?.url) {
    return;
  }

  try {
    await navigator.clipboard.writeText(magicLink.value.url);
    setMessage(magicLinkMessage, 'success', t('messages.magicLinkCopied'));
  } catch (error) {
    setMessage(magicLinkMessage, 'error', getErrorMessage(error));
  }
}

function onProgramIconChange(event: Event) {
  const target = event.target as HTMLInputElement;
  media.programIconFile = target.files?.[0] ?? null;
}

function onRewardImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  media.rewardImageFile = target.files?.[0] ?? null;
}

async function uploadProgramIcon() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!media.programIconFile) {
    setMessage(loyaltyMessage, 'error', t('messages.imageRequired'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('kind', 'program_icon');
    formData.append('file', media.programIconFile);
    const data = await api.value.uploadMedia(activeBusiness.value.id, formData);
    loyaltyConfig.programIconUrl = data.url;
    setMessage(loyaltyMessage, 'success', t('messages.programIconUploaded'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}

async function uploadRewardImage() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!media.rewardImageFile) {
    setMessage(loyaltyMessage, 'error', t('messages.imageRequired'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('kind', 'reward_image');
    formData.append('file', media.rewardImageFile);
    const data = await api.value.uploadMedia(activeBusiness.value.id, formData);
    loyaltyConfig.rewardImageUrl = data.url;
    setMessage(loyaltyMessage, 'success', t('messages.rewardImageUploaded'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}
</script>
