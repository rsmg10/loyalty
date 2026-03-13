<template>
  <section class="space-y-6">
    <div class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('wallet.statusTitle') }}</h2>
        <button class="text-xs font-semibold uppercase tracking-wider text-coral" @click="logout">
          {{ $t('app.signOut') }}
        </button>
      </div>
      <div class="mt-4 space-y-3">
        <input v-model="status.businessId" class="input" :placeholder="$t('forms.businessId')" />
        <input
          v-model="status.phone"
          class="input"
          :placeholder="$t('forms.customerPhone')"
          :readonly="Boolean(session.phoneNumber)"
        />
        <button class="btn-primary" :disabled="statusLoading" @click="loadStatus">
          {{ statusLoading ? $t('wallet.loading') : $t('wallet.loadStatus') }}
        </button>
        <div v-if="showSignupAction" class="space-y-3">
          <input v-model="signup.displayName" class="input" :placeholder="$t('forms.displayName')" />
          <input v-model="signup.mobileNumber" class="input" :placeholder="$t('forms.mobileNumber')" />
          <button class="btn-ghost" :disabled="signupLoading" @click="selfSignup">
            {{ signupLoading ? $t('wallet.signingUp') : $t('wallet.joinProgram') }}
          </button>
        </div>
        <div v-if="statusResult" class="rounded-xl bg-cream/70 p-4 text-sm text-dusk">
          <p class="font-semibold">{{ statusResult.businessName }}</p>
          <p class="text-dusk/70">{{ $t('wallet.program') }}: {{ statusResult.programName }}</p>
          <p v-if="statusResult.programDescription" class="text-dusk/70">
            {{ statusResult.programDescription }}
          </p>
          <img
            v-if="statusResult.programIconUrl"
            :src="statusResult.programIconUrl"
            alt="Program icon"
            class="mt-2 h-16 w-16 rounded-2xl object-cover"
          />
          <p class="text-dusk/70">{{ $t('wallet.reward') }}: {{ statusResult.rewardName }}</p>
          <img
            v-if="statusResult.rewardImageUrl"
            :src="statusResult.rewardImageUrl"
            alt="Reward"
            class="mt-2 h-28 w-full rounded-2xl object-cover"
          />
          <p class="text-dusk/70">
            {{ $t('wallet.progress') }}: {{ statusResult.visitCount }} / {{ statusResult.visitThreshold }}
          </p>
          <p v-if="statusResult.optionalNote" class="text-dusk/70">
            {{ $t('wallet.note') }}: {{ statusResult.optionalNote }}
          </p>
          <p v-if="statusResult.stampExpirationDays" class="text-dusk/70">
            {{ $t('wallet.stampExpiration') }}: {{ statusResult.stampExpirationDays }}
          </p>
          <p v-if="statusResult.lastStampAt" class="text-dusk/70">
            {{ $t('wallet.lastStamp') }}: {{ new Date(statusResult.lastStampAt).toLocaleString() }}
          </p>
          <p v-if="statusResult.rewardAvailableAt" class="text-dusk/70">
            {{ $t('wallet.rewardAvailableSince') }}: {{ new Date(statusResult.rewardAvailableAt).toLocaleString() }}
          </p>
        </div>
        <p v-if="statusMessage" :class="messageClass(statusMessage.tone)">
          {{ statusMessage.text }}
        </p>
      </div>
    </div>

    <div class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('wallet.visitHistory') }}</h2>
        <span class="badge">{{ $t('wallet.optional') }}</span>
      </div>
      <div class="mt-4 space-y-3">
        <button class="btn-ghost" :disabled="historyLoading" @click="loadHistory">
          {{ historyLoading ? $t('wallet.loading') : $t('wallet.loadHistory') }}
        </button>
        <ul v-if="history.length" class="space-y-2 text-xs text-dusk/70">
          <li v-for="entry in history" :key="entry.createdAt">
            {{ new Date(entry.createdAt).toLocaleString() }} · {{ entry.quantity }} stamp(s)
            <span v-if="entry.reason">· {{ entry.reason }}</span>
          </li>
        </ul>
        <p v-if="historyMessage" :class="messageClass(historyMessage.tone)">
          {{ historyMessage.text }}
        </p>
      </div>
    </div>

    <div class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('wallet.stampAudit') }}</h2>
        <span class="badge">{{ $t('wallet.optional') }}</span>
      </div>
      <div class="mt-4 space-y-3">
        <button class="btn-ghost" :disabled="stampHistoryLoading" @click="loadStampHistory">
          {{ stampHistoryLoading ? $t('wallet.loading') : $t('wallet.loadStampHistory') }}
        </button>
        <ul v-if="stampHistory.length" class="space-y-2 text-xs text-dusk/70">
          <li v-for="entry in stampHistory" :key="entry.id">
            {{ new Date(entry.issuedAt).toLocaleString() }} · {{ entry.quantity }} stamp(s) ·
            {{ entry.reason }} · {{ entry.issuedByPhone }}
          </li>
        </ul>
        <p v-if="stampHistoryMessage" :class="messageClass(stampHistoryMessage.tone)">
          {{ stampHistoryMessage.text }}
        </p>
      </div>
    </div>

    <div class="card animate-floatUp">
      <h2 class="font-display text-xl text-dusk">{{ $t('app.shareTitle') }}</h2>
      <p class="mt-3 text-sm text-dusk/70">{{ $t('app.shareHint') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { getErrorMessage } from '../lib/errors';
import { useCustomerApi } from '../composables/useCustomerApi';
import type { CustomerStatusResponse, StampTransactionItem, VisitHistoryItem } from '../lib/types';
import { usePreferencesStore } from '../stores/preferences';
import { useSessionStore } from '../stores/session';
import { useI18n } from 'vue-i18n';

type MessageTone = 'success' | 'error' | 'info';
type Message = { tone: MessageTone; text: string };

const session = useSessionStore();
const preferences = usePreferencesStore();
const customerApi = useCustomerApi(session.token);
const { t } = useI18n();

const status = reactive({
  businessId: preferences.businessId,
  phone: session.phoneNumber || ''
});

const statusResult = ref<CustomerStatusResponse | null>(null);
const statusLoading = ref(false);
const statusMessage = ref<Message | null>(null);
const showSignupAction = ref(false);
const signupLoading = ref(false);
const signup = reactive({
  displayName: '',
  mobileNumber: ''
});
const autoLoaded = ref(false);

const history = ref<VisitHistoryItem[]>([]);
const historyLoading = ref(false);
const historyMessage = ref<Message | null>(null);

const stampHistory = ref<StampTransactionItem[]>([]);
const stampHistoryLoading = ref(false);
const stampHistoryMessage = ref<Message | null>(null);

watch(
  () => status.businessId,
  (value) => {
    preferences.setBusinessId(value);
  }
);

watch(
  () => session.phoneNumber,
  (value) => {
    status.phone = value || '';
  }
);

onMounted(() => {
  if (status.businessId && status.phone && session.isAuthenticated && !autoLoaded.value) {
    autoLoaded.value = true;
    loadStatus();
  }
});

function messageClass(tone: MessageTone) {
  const base = 'mt-2 rounded-xl px-3 py-2 text-xs font-semibold';
  if (tone === 'success') {
    return `${base} bg-moss/10 text-moss`;
  }
  if (tone === 'error') {
    return `${base} bg-coral/10 text-coral`;
  }
  return `${base} bg-dusk/10 text-dusk`;
}

function setMessage(target: { value: Message | null }, tone: MessageTone, text: string) {
  target.value = { tone, text };
}

async function loadStatus() {
  if (!status.businessId) {
    setMessage(statusMessage, 'error', t('messages.enterBusiness'));
    return;
  }
  statusLoading.value = true;
  try {
    const data = await customerApi.getStatus(status.businessId, status.phone);
    statusResult.value = data;
    showSignupAction.value = false;
    setMessage(statusMessage, 'success', t('messages.statusLoaded'));
  } catch (error) {
    const message = getErrorMessage(error);
    if (message === t('errors.customerNotFound')) {
      showSignupAction.value = true;
      setMessage(statusMessage, 'info', t('errors.customerNotFoundPrompt'));
    } else {
      showSignupAction.value = false;
      setMessage(statusMessage, 'error', message);
    }
  } finally {
    statusLoading.value = false;
  }
}

async function selfSignup() {
  if (!status.businessId) {
    setMessage(statusMessage, 'error', t('messages.enterBusiness'));
    return;
  }
  signupLoading.value = true;
  try {
    const data = await customerApi.selfSignup(status.businessId, {
      phoneNumber: status.phone,
      displayName: signup.displayName,
      mobileNumber: signup.mobileNumber
    });
    statusResult.value = data;
    showSignupAction.value = false;
    setMessage(statusMessage, 'success', t('errors.signupSuccess'));
  } catch (error) {
    setMessage(statusMessage, 'error', getErrorMessage(error));
  } finally {
    signupLoading.value = false;
  }
}

async function loadHistory() {
  if (!status.businessId) {
    setMessage(historyMessage, 'error', t('messages.enterBusiness'));
    return;
  }
  historyLoading.value = true;
  try {
    const data = await customerApi.getVisitHistory(status.businessId, status.phone);
    history.value = data || [];
    setMessage(historyMessage, 'success', t('messages.historyLoaded'));
  } catch (error) {
    setMessage(historyMessage, 'error', getErrorMessage(error));
  } finally {
    historyLoading.value = false;
  }
}

async function loadStampHistory() {
  if (!status.businessId) {
    setMessage(stampHistoryMessage, 'error', t('messages.enterBusiness'));
    return;
  }
  stampHistoryLoading.value = true;
  try {
    const data = await customerApi.getStampHistory(status.businessId, status.phone);
    stampHistory.value = data || [];
    setMessage(stampHistoryMessage, 'success', t('messages.stampHistoryLoaded'));
  } catch (error) {
    setMessage(stampHistoryMessage, 'error', getErrorMessage(error));
  } finally {
    stampHistoryLoading.value = false;
  }
}

function logout() {
  session.clearAuth();
  statusResult.value = null;
  history.value = [];
  stampHistory.value = [];
  showSignupAction.value = false;
  signup.displayName = '';
  signup.mobileNumber = '';
}
</script>
