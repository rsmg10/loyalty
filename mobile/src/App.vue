<template>
  <div class="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 pb-16 pt-10">
    <header class="space-y-3 text-center">
      <span class="badge mx-auto">Customer Wallet</span>
      <h1 class="font-display text-3xl font-semibold text-dusk">Loyalty Pocket</h1>
      <p class="text-sm text-dusk/70">
        Track your visits, see when your reward is ready, and keep a clean record of every stop.
      </p>
    </header>

    <section v-if="!session.token" class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">OTP access</h2>
        <span class="badge">Login</span>
      </div>
      <div class="mt-4 space-y-3">
        <input v-model="auth.phone" class="input" placeholder="Your phone" />
        <button class="btn-ghost" :disabled="authLoading" @click="requestOtp">
          {{ authLoading ? 'Sending...' : 'Request OTP' }}
        </button>
        <input v-model="auth.code" class="input" placeholder="6-digit code" />
        <button class="btn-primary" :disabled="authLoading" @click="verifyOtp">
          {{ authLoading ? 'Verifying...' : 'Verify & Continue' }}
        </button>
        <p v-if="authMessage" :class="messageClass(authMessage.tone)">
          {{ authMessage.text }}
        </p>
      </div>
    </section>

    <section v-else class="space-y-6">
      <div class="card animate-floatUp">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-dusk">Your status</h2>
          <button class="text-xs font-semibold uppercase tracking-wider text-coral" @click="logout">
            Sign out
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <input v-model="status.businessId" class="input" placeholder="Business ID" />
          <input v-model="status.phone" class="input" placeholder="Customer phone" />
          <button class="btn-primary" :disabled="statusLoading" @click="loadStatus">
            {{ statusLoading ? 'Loading...' : 'Load status' }}
          </button>
          <div v-if="statusResult" class="rounded-xl bg-cream/70 p-4 text-sm text-dusk">
            <p class="font-semibold">{{ statusResult.businessName }}</p>
            <p class="text-dusk/70">Reward: {{ statusResult.rewardName }}</p>
            <p class="text-dusk/70">
              Progress: {{ statusResult.visitCount }} / {{ statusResult.visitThreshold }}
            </p>
            <p v-if="statusResult.optionalNote" class="text-dusk/70">
              Note: {{ statusResult.optionalNote }}
            </p>
          </div>
          <p v-if="statusMessage" :class="messageClass(statusMessage.tone)">
            {{ statusMessage.text }}
          </p>
        </div>
      </div>

      <div class="card animate-floatUp">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-dusk">Visit history</h2>
          <span class="badge">Optional</span>
        </div>
        <div class="mt-4 space-y-3">
          <button class="btn-ghost" :disabled="historyLoading" @click="loadHistory">
            {{ historyLoading ? 'Loading...' : 'Load history' }}
          </button>
          <ul v-if="history.length" class="space-y-2 text-xs text-dusk/70">
            <li v-for="entry in history" :key="entry.createdAt">
              {{ new Date(entry.createdAt).toLocaleString() }}
            </li>
          </ul>
          <p v-if="historyMessage" :class="messageClass(historyMessage.tone)">
            {{ historyMessage.text }}
          </p>
        </div>
      </div>

      <div class="card animate-floatUp">
        <h2 class="font-display text-xl text-dusk">Share this</h2>
        <p class="mt-3 text-sm text-dusk/70">
          Ask staff for the business ID or scan the shop QR once we enable magic links.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { apiGet, apiPost } from './lib/api';
import { useSessionStore } from './stores/session';

type MessageTone = 'success' | 'error' | 'info';
type Message = { tone: MessageTone; text: string };

type AuthTokenResponse = {
  token: string;
  expiresAt: string;
};

type CustomerStatusResponse = {
  businessName: string;
  rewardName: string;
  visitCount: number;
  visitThreshold: number;
  optionalNote?: string | null;
};

type VisitHistoryItem = {
  createdAt: string;
};

const session = useSessionStore();

const auth = reactive({
  phone: session.phoneNumber || '',
  code: ''
});

const authLoading = ref(false);
const authMessage = ref<Message | null>(null);

const status = reactive({
  businessId: localStorage.getItem('loyalty_mobile_business') || '',
  phone: session.phoneNumber || ''
});

const statusResult = ref<CustomerStatusResponse | null>(null);
const statusLoading = ref(false);
const statusMessage = ref<Message | null>(null);

const history = ref<VisitHistoryItem[]>([]);
const historyLoading = ref(false);
const historyMessage = ref<Message | null>(null);

watch(
  () => status.businessId,
  (value) => {
    if (value) {
      localStorage.setItem('loyalty_mobile_business', value);
    } else {
      localStorage.removeItem('loyalty_mobile_business');
    }
  }
);

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

async function requestOtp() {
  authLoading.value = true;
  try {
    await apiPost('/auth/request-otp', { phoneNumber: auth.phone, purpose: 'customer' });
    setMessage(authMessage, 'success', 'OTP sent.');
  } catch (error) {
    setMessage(authMessage, 'error', error.message);
  } finally {
    authLoading.value = false;
  }
}

async function verifyOtp() {
  authLoading.value = true;
  try {
    const data = await apiPost<AuthTokenResponse>('/auth/verify-otp', {
      phoneNumber: auth.phone,
      purpose: 'customer',
      code: auth.code
    });
    session.setAuth(data.token, auth.phone);
    status.phone = auth.phone;
    setMessage(authMessage, 'success', 'Signed in.');
  } catch (error) {
    setMessage(authMessage, 'error', error.message);
  } finally {
    authLoading.value = false;
  }
}

async function loadStatus() {
  if (!status.businessId) {
    setMessage(statusMessage, 'error', 'Enter a business ID.');
    return;
  }
  statusLoading.value = true;
  try {
    const data = await apiGet<CustomerStatusResponse>(
      `/businesses/${status.businessId}/customers/${encodeURIComponent(status.phone)}`,
      session.token
    );
    statusResult.value = data;
    setMessage(statusMessage, 'success', 'Status loaded.');
  } catch (error) {
    setMessage(statusMessage, 'error', error.message);
  } finally {
    statusLoading.value = false;
  }
}

async function loadHistory() {
  if (!status.businessId) {
    setMessage(historyMessage, 'error', 'Enter a business ID.');
    return;
  }
  historyLoading.value = true;
  try {
    const data = await apiGet<VisitHistoryItem[]>(
      `/businesses/${status.businessId}/customers/${encodeURIComponent(status.phone)}/visits`,
      session.token
    );
    history.value = data || [];
    setMessage(historyMessage, 'success', 'History loaded.');
  } catch (error) {
    setMessage(historyMessage, 'error', error.message);
  } finally {
    historyLoading.value = false;
  }
}

function logout() {
  session.clearAuth();
  statusResult.value = null;
  history.value = [];
}
</script>
