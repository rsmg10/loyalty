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
        :lock-business-selection="lockBusinessSelection"
        @update:selected-business="(value) => (selectedBusiness = value)"
        @refresh="refreshMe"
      />

      <QuickActionsCard
        v-if="activeBusiness"
        :is-owner="isOwner"
        @open-customer-care="openCustomerCare"
        @open-operations="openOwnerOperations"
        @open-user-management="openOwnerUsers"
        @open-settings="openOwnerSettings"
        @open-reports="openOwnerReports"
      />

      <SectionNavCard
        v-if="activeBusiness"
        :is-owner="isOwner"
        :active-section="activeSection"
        @jump="jumpTo"
        @open-customer-care="openCustomerCare"
        @open-operations="openOwnerOperations"
      />
    </aside>

    <section class="flex flex-col gap-6">
      <section v-if="!activeBusiness" class="glass-card animate-rise">
        <h2 class="section-title">{{ $t('dashboard.pickBusiness') }}</h2>
        <p class="mt-2 text-sm text-dusk/70">{{ $t('dashboard.pickHint') }}</p>
      </section>

      <section v-else class="space-y-6">
        <QuickActionsToolbar
          :is-owner="isOwner"
          @jump="jumpTo"
          @open-customer-care="openCustomerCare"
          @open-operations="openOwnerOperations"
          @open-user-management="openOwnerUsers"
          @open-settings="openOwnerSettings"
          @open-reports="openOwnerReports"
        />
        <FlowGuideCard
          :is-owner="isOwner"
          @jump="jumpTo"
          @open-customer-care="openCustomerCare"
          @open-operations="openOwnerOperations"
          @open-user-management="openOwnerUsers"
          @open-settings="openOwnerSettings"
          @open-reports="openOwnerReports"
        />

        <SectionGroup
          section-id="front-counter"
          :title="$t('dashboard.frontCounter')"
          :subtitle="$t('dashboard.frontCounterSubtitle')"
          :default-open="!isOwner"
        >
          <!-- Visit entry — primary daily action -->
          <VisitEntryCard
            :phone="visit.phone"
            :loading="visitLoading"
            :result="visitResult"
            :message="visitMessage"
            @update:phone="(value) => syncActivePhone(value)"
            @record="recordVisit"
          />

          <!-- Reward banner — promoted when earned -->
          <div
            v-if="visitResult?.rewardAvailable"
            class="glass-card border-moss/30 bg-moss/10 animate-rise"
          >
            <div class="flex items-center justify-between">
              <h2 class="section-title text-moss">🎉 {{ $t('dashboard.rewardEarned') }}</h2>
              <span class="chip border-moss/30 text-moss">{{ $t('dashboard.rewardReady') }}</span>
            </div>
            <p class="mt-1 text-sm text-moss/80">{{ $t('dashboard.rewardEarnedHint') }}</p>
          </div>

          <!-- Redemption -->
          <RedemptionCard
            :phone="redeem.phone"
            :loading="redeemLoading"
            :result="redeemResult"
            :message="redeemMessage"
            @update:phone="(value) => { redeem.phone = value }"
            @redeem="redeemReward"
          />

          <!-- Manual stamp adjustment — secondary, behind disclosure -->
          <div class="glass-card animate-rise border-dusk/10">
            <button
              class="flex w-full items-center justify-between text-left"
              @click="showStampIssue = !showStampIssue"
            >
              <div>
                <h2 class="section-title text-base text-dusk/70">{{ $t('cards.stampIssuance') }}</h2>
                <p class="mt-0.5 text-xs text-dusk/50">{{ $t('dashboard.stampIssueHint') }}</p>
              </div>
              <span class="chip">{{ showStampIssue ? $t('nav.collapse') : $t('nav.expand') }}</span>
            </button>
            <div v-if="showStampIssue" class="mt-4 space-y-3">
              <input
                class="input"
                :placeholder="$t('forms.customerPhone')"
                :value="stampIssue.phone"
                @input="stampIssue.phone = ($event.target as HTMLInputElement).value"
              />
              <input
                class="input"
                type="number"
                min="1"
                :placeholder="$t('forms.quantity')"
                :value="stampIssue.quantity"
                @input="stampIssue.quantity = Number(($event.target as HTMLInputElement).value)"
              />
              <input
                class="input"
                :placeholder="$t('forms.reason')"
                :value="stampIssue.reason"
                @input="stampIssue.reason = ($event.target as HTMLInputElement).value"
              />
              <button class="btn-ghost w-full" :disabled="stampIssueLoading" @click="issueStamps">
                {{ stampIssueLoading ? $t('cards.issuing') : $t('cards.issueStamps') }}
              </button>
              <div v-if="stampIssueResult" class="rounded-xl bg-sand/70 p-3 text-sm">
                <p class="font-semibold">
                  {{ stampIssueResult.rewardAvailable ? $t('cards.rewardAvailable') : $t('messages.stampsIssued') }}
                </p>
                <p class="text-dusk/70">{{ stampIssueResult.stampCount }} / {{ stampIssueResult.stampThreshold }} {{ $t('cards.stamps') }}</p>
              </div>
              <p v-if="stampIssueMessage" :class="messageClass(stampIssueMessage.tone)">{{ stampIssueMessage.text }}</p>
            </div>
          </div>
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
      <button class="btn-mini" @click="openCustomerCare">
        {{ $t('nav.customers') }}
      </button>
      <button
        v-if="isOwner"
        class="btn-mini"
        @click="openOwnerOperations"
      >
        {{ $t('nav.operations') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '../lib/errors';
import { messageClass, setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import { useLoyaltyApi } from '../composables/useLoyaltyApi';
import { useI18n } from 'vue-i18n';
import type {
  RedemptionResponse,
  StampIssueResponse,
  VisitResponse
} from '../lib/types';
import { useSessionStore } from '../stores/session';
import BusinessContextCard from '../components/dashboard/BusinessContextCard.vue';
import QuickActionsCard from '../components/dashboard/QuickActionsCard.vue';
import QuickActionsToolbar from '../components/dashboard/QuickActionsToolbar.vue';
import FlowGuideCard from '../components/dashboard/FlowGuideCard.vue';
import SectionNavCard from '../components/dashboard/SectionNavCard.vue';
import VisitEntryCard from '../components/dashboard/VisitEntryCard.vue';
import RedemptionCard from '../components/dashboard/RedemptionCard.vue';
import SectionGroup from '../components/dashboard/SectionGroup.vue';

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'owner' | 'staff';
};

const session = useSessionStore();
const router = useRouter();
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

const activeSection = ref('front-counter');
const quickActionsOpen = ref(false);
const showStampIssue = ref(false);

// Sync phone across front-counter cards
function syncActivePhone(value: string) {
  visit.phone = value;
  redeem.phone = value;
}

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

const lockBusinessSelection = computed(() =>
  session.purpose === 'staff' && businessOptions.value.length <= 1
);

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

function openOwnerUsers() {
  if (!isOwner.value) {
    return;
  }
  router.push({ name: 'owner-users' });
}

function openCustomerCare() {
  router.push({ name: 'customer-care' });
}

function openOwnerOperations() {
  if (!isOwner.value) {
    return;
  }
  router.push({ name: 'owner-operations' });
}

function openOwnerSettings() {
  if (!isOwner.value) {
    return;
  }
  router.push({ name: 'owner-settings' });
}

function openOwnerReports() {
  if (!isOwner.value) {
    return;
  }
  router.push({ name: 'owner-reports' });
}

onMounted(() => {
  const targets = ['front-counter']
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
    // Propagate phone to redemption card so staff can redeem in one step
    if (data.rewardAvailable) {
      redeem.phone = visit.phone;
    }
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

</script>
