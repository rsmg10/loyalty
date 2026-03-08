<template>
  <section class="space-y-6">
    <div class="card animate-floatUp">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">Your status</h2>
        <button class="text-xs font-semibold uppercase tracking-wider text-coral" @click="logout">
          Sign out
        </button>
      </div>
      <div class="mt-4 space-y-3">
        <input v-model="status.businessId" class="input" placeholder="Business ID" />
        <input
          v-model="status.phone"
          class="input"
          placeholder="Customer phone"
          :readonly="Boolean(session.phoneNumber)"
        />
        <button class="btn-primary" :disabled="statusLoading" @click="loadStatus">
          {{ statusLoading ? 'Loading...' : 'Load status' }}
        </button>
        <div v-if="statusResult" class="rounded-xl bg-cream/70 p-4 text-sm text-dusk">
          <p class="font-semibold">{{ statusResult.businessName }}</p>
          <p class="text-dusk/70">Program: {{ statusResult.programName }}</p>
          <p v-if="statusResult.programDescription" class="text-dusk/70">
            {{ statusResult.programDescription }}
          </p>
          <img
            v-if="statusResult.programIconUrl"
            :src="statusResult.programIconUrl"
            alt="Program icon"
            class="mt-2 h-16 w-16 rounded-2xl object-cover"
          />
          <p class="text-dusk/70">Reward: {{ statusResult.rewardName }}</p>
          <img
            v-if="statusResult.rewardImageUrl"
            :src="statusResult.rewardImageUrl"
            alt="Reward"
            class="mt-2 h-28 w-full rounded-2xl object-cover"
          />
          <p class="text-dusk/70">
            Progress: {{ statusResult.visitCount }} / {{ statusResult.visitThreshold }} stamps
          </p>
          <p v-if="statusResult.optionalNote" class="text-dusk/70">
            Note: {{ statusResult.optionalNote }}
          </p>
          <p v-if="statusResult.stampExpirationDays" class="text-dusk/70">
            Stamp expiration: {{ statusResult.stampExpirationDays }} days
          </p>
          <p v-if="statusResult.lastStampAt" class="text-dusk/70">
            Last stamp: {{ new Date(statusResult.lastStampAt).toLocaleString() }}
          </p>
          <p v-if="statusResult.rewardAvailableAt" class="text-dusk/70">
            Reward available since: {{ new Date(statusResult.rewardAvailableAt).toLocaleString() }}
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
        <h2 class="font-display text-xl text-dusk">Stamp audit</h2>
        <span class="badge">Optional</span>
      </div>
      <div class="mt-4 space-y-3">
        <button class="btn-ghost" :disabled="stampHistoryLoading" @click="loadStampHistory">
          {{ stampHistoryLoading ? 'Loading...' : 'Load stamp history' }}
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
      <h2 class="font-display text-xl text-dusk">Share this</h2>
      <p class="mt-3 text-sm text-dusk/70">
        Ask staff for the business ID or scan the shop QR once we enable magic links.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { getErrorMessage } from '../lib/errors';
import { useCustomerApi } from '../composables/useCustomerApi';
import type { CustomerStatusResponse, StampTransactionItem, VisitHistoryItem } from '../lib/types';
import { usePreferencesStore } from '../stores/preferences';
import { useSessionStore } from '../stores/session';

type MessageTone = 'success' | 'error' | 'info';
type Message = { tone: MessageTone; text: string };

const session = useSessionStore();
const preferences = usePreferencesStore();
const customerApi = useCustomerApi(session.token);

const status = reactive({
  businessId: preferences.businessId,
  phone: session.phoneNumber || ''
});

const statusResult = ref<CustomerStatusResponse | null>(null);
const statusLoading = ref(false);
const statusMessage = ref<Message | null>(null);

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
    setMessage(statusMessage, 'error', 'Enter a business ID.');
    return;
  }
  statusLoading.value = true;
  try {
    const data = await customerApi.getStatus(status.businessId, status.phone);
    statusResult.value = data;
    setMessage(statusMessage, 'success', 'Status loaded.');
  } catch (error) {
    setMessage(statusMessage, 'error', getErrorMessage(error));
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
    const data = await customerApi.getVisitHistory(status.businessId, status.phone);
    history.value = data || [];
    setMessage(historyMessage, 'success', 'History loaded.');
  } catch (error) {
    setMessage(historyMessage, 'error', getErrorMessage(error));
  } finally {
    historyLoading.value = false;
  }
}

async function loadStampHistory() {
  if (!status.businessId) {
    setMessage(stampHistoryMessage, 'error', 'Enter a business ID.');
    return;
  }
  stampHistoryLoading.value = true;
  try {
    const data = await customerApi.getStampHistory(status.businessId, status.phone);
    stampHistory.value = data || [];
    setMessage(stampHistoryMessage, 'success', 'Stamp history loaded.');
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
}
</script>
