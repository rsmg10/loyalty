<template>
  <section class="space-y-4">
    <!-- Status card -->
    <div class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('wallet.statusTitle') }}</h2>
        <button class="text-xs font-semibold uppercase tracking-wider text-coral" @click="logout">
          {{ $t('app.signOut') }}
        </button>
      </div>

      <!-- Business ID input (only shown if not yet loaded) -->
      <div v-if="!statusResult" class="mt-4 space-y-3">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-dusk/50">
            {{ $t('forms.businessId') }}
          </label>
          <input v-model="status.businessId" class="input" :placeholder="$t('forms.businessIdPlaceholder')" />
        </div>
        <button class="btn-primary w-full" :disabled="statusLoading" @click="loadStatus">
          {{ statusLoading ? $t('wallet.loading') : $t('wallet.loadStatus') }}
        </button>
        <p v-if="statusMessage" :class="messageClass(statusMessage.tone)">
          {{ statusMessage.text }}
        </p>

        <!-- Not enrolled: signup form -->
        <div v-if="showSignupAction" class="rounded-xl border border-white/60 bg-white/70 p-4 space-y-3">
          <p class="text-sm font-semibold text-dusk">{{ $t('wallet.joinTitle') }}</p>
          <input v-model="signup.displayName" class="input" :placeholder="$t('forms.displayName')" />
          <input v-model="signup.mobileNumber" class="input" :placeholder="$t('forms.mobileNumber')" />
          <button class="btn-primary w-full" :disabled="signupLoading" @click="selfSignup">
            {{ signupLoading ? $t('wallet.signingUp') : $t('wallet.joinProgram') }}
          </button>
        </div>
      </div>

      <!-- Loaded status: stamp card display -->
      <div v-else class="mt-4">
        <!-- Business + program header -->
        <div class="flex items-center gap-3">
          <img
            v-if="statusResult.programIconUrl"
            :src="statusResult.programIconUrl"
            alt="Program icon"
            class="h-12 w-12 rounded-2xl border border-white/70 object-cover"
          />
          <span
            v-else
            class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold"
            :style="avatarStyle(statusResult.businessName)"
          >
            {{ initialsFromValue(statusResult.businessName, 'BP') }}
          </span>
          <div>
            <p class="font-semibold text-dusk">{{ statusResult.businessName }}</p>
            <p class="text-xs text-dusk/60">{{ statusResult.programName }}</p>
          </div>
        </div>

        <!-- Reward name -->
        <div class="mt-4 rounded-xl bg-ember/8 px-3 py-2.5">
          <p class="text-xs font-semibold uppercase tracking-wide text-ember/80">{{ $t('wallet.reward') }}</p>
          <p class="mt-0.5 font-semibold text-dusk">{{ statusResult.rewardName }}</p>
          <p v-if="statusResult.optionalNote" class="mt-0.5 text-xs text-dusk/60">{{ statusResult.optionalNote }}</p>
        </div>

        <!-- Visual stamp grid -->
        <div class="mt-4">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-semibold uppercase tracking-wide text-dusk/50">{{ $t('wallet.stamps') }}</p>
            <p class="text-xs font-semibold text-dusk">
              {{ statusResult.visitCount }} / {{ statusResult.visitThreshold }}
            </p>
          </div>
          <div
            class="grid gap-2"
            :style="{ gridTemplateColumns: `repeat(${stampCols}, minmax(0, 1fr))` }"
          >
            <div
              v-for="n in statusResult.visitThreshold"
              :key="n"
              class="flex aspect-square items-center justify-center rounded-xl border-2 text-lg transition-all"
              :class="
                n <= statusResult.visitCount
                  ? 'border-ember bg-ember/15 text-ember'
                  : 'border-dusk/15 bg-white/50 text-dusk/20'
              "
            >
              <svg v-if="n <= statusResult.visitCount" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
              </svg>
              <span v-else class="text-[11px] font-semibold">{{ n }}</span>
            </div>
          </div>
        </div>

        <!-- Reward available banner -->
        <div v-if="statusResult.visitCount >= statusResult.visitThreshold" class="mt-4 rounded-xl bg-moss/15 px-4 py-3 text-center">
          <p class="font-semibold text-moss">🎉 {{ $t('wallet.rewardReady') }}</p>
          <p class="mt-0.5 text-xs text-moss/80">{{ $t('wallet.rewardReadyHint') }}</p>
        </div>

        <!-- Meta info -->
        <div class="mt-3 space-y-1 text-xs text-dusk/55">
          <p v-if="statusResult.lastStampAt">
            {{ $t('wallet.lastStamp') }}: {{ new Date(statusResult.lastStampAt).toLocaleDateString() }}
          </p>
          <p v-if="statusResult.stampExpirationDays">
            {{ $t('wallet.stampExpiration') }}: {{ statusResult.stampExpirationDays }} {{ $t('wallet.days') }}
          </p>
        </div>

        <!-- Switch business -->
        <button class="btn-ghost mt-4 w-full text-xs" @click="resetStatus">
          {{ $t('wallet.switchBusiness') }}
        </button>

        <p v-if="statusMessage" :class="messageClass(statusMessage.tone)" class="mt-2">
          {{ statusMessage.text }}
        </p>
      </div>
    </div>

    <!-- Visit history (only shown after status is loaded) -->
    <div v-if="statusResult" class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('wallet.visitHistory') }}</h2>
        <span class="badge">{{ $t('wallet.optional') }}</span>
      </div>
      <div class="mt-4 space-y-3">
        <button class="btn-ghost w-full" :disabled="historyLoading" @click="loadHistory">
          {{ historyLoading ? $t('wallet.loading') : $t('wallet.loadHistory') }}
        </button>
        <ul v-if="history.length" class="space-y-2 text-xs text-dusk/70">
          <li
            v-for="entry in history"
            :key="entry.createdAt"
            class="flex items-center gap-2 rounded-xl border border-white/70 bg-white/65 p-2.5"
          >
            <span
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold"
              :style="avatarStyle(entry.reason || String(entry.quantity))"
            >
              {{ initialsFromValue(entry.reason || 'visit', 'VT') }}
            </span>
            <div>
              <p class="text-[11px] text-dusk">{{ new Date(entry.createdAt).toLocaleString() }}</p>
              <p class="text-[11px] text-dusk/70">
                {{ entry.quantity }} stamp(s)
                <span v-if="entry.reason">· {{ entry.reason }}</span>
              </p>
            </div>
          </li>
        </ul>
        <p v-else-if="!historyLoading" class="rounded-xl bg-night/5 px-3 py-2 text-xs text-night/70">
          {{ $t('wallet.noVisitHistoryYet') }}
        </p>
        <p v-if="historyMessage" :class="messageClass(historyMessage.tone)">
          {{ historyMessage.text }}
        </p>
      </div>
    </div>

    <!-- Stamp history (only shown after status is loaded) -->
    <div v-if="statusResult" class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('wallet.stampHistory') }}</h2>
        <span class="badge">{{ $t('wallet.optional') }}</span>
      </div>
      <div class="mt-4 space-y-3">
        <button class="btn-ghost w-full" :disabled="stampHistoryLoading" @click="loadStampHistory">
          {{ stampHistoryLoading ? $t('wallet.loading') : $t('wallet.loadStampHistory') }}
        </button>
        <ul v-if="stampHistory.length" class="space-y-2 text-xs text-dusk/70">
          <li
            v-for="entry in stampHistory"
            :key="entry.id"
            class="flex items-center gap-2 rounded-xl border border-white/70 bg-white/65 p-2.5"
          >
            <span
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold"
              :style="avatarStyle(entry.issuedByPhone)"
            >
              {{ initialsFromValue(entry.issuedByPhone, 'ST') }}
            </span>
            <div>
              <p class="text-[11px] text-dusk">{{ new Date(entry.issuedAt).toLocaleString() }}</p>
              <p class="text-[11px] text-dusk/70">
                {{ entry.quantity }} stamp(s) · {{ entry.reason }}
              </p>
            </div>
          </li>
        </ul>
        <p v-else-if="!stampHistoryLoading" class="rounded-xl bg-night/5 px-3 py-2 text-xs text-night/70">
          {{ $t('wallet.noStampHistoryYet') }}
        </p>
        <p v-if="stampHistoryMessage" :class="messageClass(stampHistoryMessage.tone)">
          {{ stampHistoryMessage.text }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { getErrorMessage } from '../lib/errors';
import { useCustomerApi } from '../composables/useCustomerApi';
import type { CustomerStatusResponse, StampTransactionItem, VisitHistoryItem } from '../lib/types';
import { usePreferencesStore } from '../stores/preferences';
import { useSessionStore } from '../stores/session';
import { useI18n } from 'vue-i18n';
import { avatarStyle, initialsFromValue } from '../lib/avatar';

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

// Compute how many columns for stamp grid (max 5 per row)
const stampCols = computed(() => {
  const threshold = statusResult.value?.visitThreshold || 9;
  if (threshold <= 5) return threshold;
  if (threshold <= 10) return 5;
  return 6;
});

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
  if (tone === 'success') return `${base} bg-moss/10 text-moss`;
  if (tone === 'error') return `${base} bg-coral/10 text-coral`;
  return `${base} bg-dusk/10 text-dusk`;
}

function setMessage(target: { value: Message | null }, tone: MessageTone, text: string) {
  target.value = { tone, text };
}

function resetStatus() {
  statusResult.value = null;
  showSignupAction.value = false;
  statusMessage.value = null;
  history.value = [];
  stampHistory.value = [];
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
    statusMessage.value = null;
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
    statusMessage.value = null;
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
