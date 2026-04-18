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

      <section class="glass-card animate-rise">
        <h2 class="section-title">{{ $t('customerCareView.title') }}</h2>
        <p class="mt-2 text-sm text-dusk/70">{{ $t('customerCareView.sidebarHint') }}</p>
        <button class="btn-ghost mt-4 w-full" @click="backToDashboard">
          {{ $t('customerCareView.backToDashboard') }}
        </button>
      </section>
    </aside>

    <section class="space-y-6">
      <section v-if="!activeBusiness" class="glass-card animate-rise">
        <h2 class="section-title">{{ $t('dashboard.pickBusiness') }}</h2>
        <p class="mt-2 text-sm text-dusk/70">{{ $t('dashboard.pickHint') }}</p>
      </section>

      <template v-else>
        <section class="glass-card animate-rise">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="section-title">{{ $t('customerCareView.title') }}</h2>
              <p class="mt-2 text-sm text-dusk/70">{{ $t('customerCareView.description') }}</p>
            </div>
            <span class="chip">{{ activeBusiness.name }}</span>
          </div>
        </section>

        <CustomerLookupCard
          :phone="lookup.phone"
          :loading="lookupLoading"
          :result="lookupResult"
          :message="lookupMessage"
          :visit-history="visitHistory"
          :history-loading="historyLoading"
          :stamp-history="stampHistory"
          :stamp-history-loading="stampHistoryLoading"
          @update:phone="(value) => { lookup.phone = value; profile.phone = value }"
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
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { useLoyaltyApi } from '../composables/useLoyaltyApi';
import { getErrorMessage } from '../lib/errors';
import { setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import type {
  CustomerStatusResponse,
  StampTransactionItem,
  VisitHistoryItem
} from '../lib/types';
import BusinessContextCard from '../components/dashboard/BusinessContextCard.vue';
import CustomerLookupCard from '../components/dashboard/CustomerLookupCard.vue';
import CustomerProfileCard from '../components/dashboard/CustomerProfileCard.vue';
import MembershipCard from '../components/dashboard/MembershipCard.vue';

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'owner' | 'staff';
};

const router = useRouter();
const session = useSessionStore();
const api = computed(() => useLoyaltyApi(session.token));
const { t } = useI18n();

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

const membership = reactive({
  phone: ''
});
const membershipLoading = ref(false);
const membershipMessage = ref<Message | null>(null);

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

watch(
  () => activeBusiness.value?.id,
  () => {
    lookup.phone = '';
    lookupResult.value = null;
    visitHistory.value = [];
    stampHistory.value = [];
    lookupMessage.value = null;

    profile.phone = '';
    profile.displayName = '';
    profile.mobileNumber = '';
    profile.usualOrder = '';
    profile.notes = '';
    profileMessage.value = null;

    membership.phone = '';
    membershipMessage.value = null;
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
    setMessage(lookupMessage, 'error', getErrorMessage(error));
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

function backToDashboard() {
  router.push({ name: 'app' });
}
</script>
