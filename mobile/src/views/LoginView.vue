<template>
  <section class="card animate-floatUp">
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
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '../lib/errors';
import { useCustomerApi } from '../composables/useCustomerApi';
import { useSessionStore } from '../stores/session';

type MessageTone = 'success' | 'error' | 'info';
type Message = { tone: MessageTone; text: string };

const session = useSessionStore();
const router = useRouter();
const customerApi = useCustomerApi(session.token);

const auth = reactive({
  phone: session.phoneNumber || '',
  code: ''
});

const authLoading = ref(false);
const authMessage = ref<Message | null>(null);

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
    await customerApi.requestOtp(auth.phone);
    setMessage(authMessage, 'success', 'OTP sent.');
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}

async function verifyOtp() {
  authLoading.value = true;
  try {
    const data = await customerApi.verifyOtp({ phoneNumber: auth.phone, code: auth.code });
    session.setAuth(data.token, auth.phone);
    setMessage(authMessage, 'success', 'Signed in.');
    router.push({ name: 'wallet' });
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}
</script>
