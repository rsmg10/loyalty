<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[280px_1fr]">
    <section v-if="!ownerBusinessOptions.length" class="glass-card animate-rise lg:col-span-2">
      <h2 class="section-title">{{ $t('ownerOperations.ownerOnlyTitle') }}</h2>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerOperations.ownerOnlyHint') }}</p>
      <button class="btn-primary mt-4" @click="backToDashboard">
        {{ $t('ownerOperations.backToDashboard') }}
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
          <h2 class="section-title">{{ $t('ownerOperations.title') }}</h2>
          <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerOperations.sidebarHint') }}</p>
          <button class="btn-ghost mt-4 w-full" @click="backToDashboard">
            {{ $t('ownerOperations.backToDashboard') }}
          </button>
        </section>
      </aside>

      <section class="space-y-6">
        <section class="glass-card animate-rise">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="section-title">{{ $t('ownerOperations.title') }}</h2>
              <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerOperations.description') }}</p>
            </div>
            <span class="chip">{{ activeBusiness?.name || $t('dashboard.pickBusiness') }}</span>
          </div>
        </section>

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
import type { BusinessStatsResponse, RedemptionSummary } from '../lib/types';
import BusinessContextCard from '../components/dashboard/BusinessContextCard.vue';
import RedemptionsCard from '../components/dashboard/RedemptionsCard.vue';
import StatsCard from '../components/dashboard/StatsCard.vue';

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

const redemptions = ref<RedemptionSummary[]>([]);
const redemptionsLoading = ref(false);
const redemptionsMessage = ref<Message | null>(null);
const stats = ref<BusinessStatsResponse | null>(null);
const statsLoading = ref(false);
const statsMessage = ref<Message | null>(null);

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
  async (value) => {
    redemptions.value = [];
    stats.value = null;
    redemptionsMessage.value = null;
    statsMessage.value = null;

    if (value) {
      await Promise.all([loadRedemptions(), loadStats()]);
    }
  },
  { immediate: true }
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
    setMessage(redemptionsMessage, 'error', getErrorMessage(error));
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

function backToDashboard() {
  router.push({ name: 'app' });
}
</script>
