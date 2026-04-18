<template>
  <section class="card animate-floatUp">
    <!-- Step 1: Enter phone -->
    <template v-if="step === 1">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('auth.welcomeTitle') }}</h2>
        <span class="badge">{{ $t('auth.login') }}</span>
      </div>
      <p class="mt-1 text-sm text-dusk/60">{{ $t('auth.welcomeSubtitle') }}</p>
      <div class="mt-5 space-y-3">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-dusk/50">
            {{ $t('auth.phone') }}
          </label>
          <input
            v-model="auth.phone"
            class="input"
            :placeholder="$t('auth.phonePlaceholder')"
            type="tel"
            autocomplete="tel"
          />
        </div>
        <button
          class="btn-primary w-full"
          :disabled="authLoading || !auth.phone"
          @click="requestOtp"
        >
          {{ authLoading ? $t('auth.sending') : $t('auth.requestOtp') }}
        </button>
        <p v-if="authMessage" :class="messageClass(authMessage.tone)">
          {{ authMessage.text }}
        </p>
      </div>
    </template>

    <!-- Step 2: Enter code -->
    <template v-else>
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-dusk">{{ $t('auth.enterCode') }}</h2>
        <span class="badge">{{ $t('auth.login') }}</span>
      </div>
      <div class="mt-4 space-y-3">
        <p class="rounded-xl bg-white/60 px-3 py-2.5 text-sm text-dusk/70">
          {{ $t('auth.codeSentTo') }}
          <strong class="text-dusk">{{ auth.phone }}</strong>
        </p>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-dusk/50">
            {{ $t('auth.code') }}
          </label>
          <input
            v-model="auth.code"
            class="input tracking-widest"
            :placeholder="$t('auth.codePlaceholder')"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            autofocus
          />
        </div>
        <button
          class="btn-primary w-full"
          :disabled="authLoading || !auth.code"
          @click="verifyOtp"
        >
          {{ authLoading ? $t('auth.verifying') : $t('auth.verify') }}
        </button>
        <button class="btn-ghost w-full text-sm" @click="step = 1">
          {{ $t('auth.back') }}
        </button>
        <p v-if="authMessage" :class="messageClass(authMessage.tone)">
          {{ authMessage.text }}
        </p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '../lib/errors';
import { useCustomerApi } from '../composables/useCustomerApi';
import { useSessionStore } from '../stores/session';
import { useI18n } from 'vue-i18n';

type MessageTone = 'success' | 'error' | 'info';
type Message = { tone: MessageTone; text: string };

const session = useSessionStore();
const router = useRouter();
const customerApi = useCustomerApi(session.token);
const { t } = useI18n();

const step = ref<1 | 2>(1);

const auth = reactive({
  phone: session.phoneNumber || '',
  code: ''
});

const authLoading = ref(false);
const authMessage = ref<Message | null>(null);

function messageClass(tone: MessageTone) {
  const base = 'mt-2 rounded-xl px-3 py-2 text-xs font-semibold';
  if (tone === 'success') return `${base} bg-moss/10 text-moss`;
  if (tone === 'error') return `${base} bg-coral/10 text-coral`;
  return `${base} bg-dusk/10 text-dusk`;
}

function setMessage(target: { value: Message | null }, tone: MessageTone, text: string) {
  target.value = { tone, text };
}

async function requestOtp() {
  authLoading.value = true;
  authMessage.value = null;
  try {
    await customerApi.requestOtp(auth.phone);
    step.value = 2;
    setMessage(authMessage, 'success', t('auth.otpSent'));
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}

async function verifyOtp() {
  authLoading.value = true;
  authMessage.value = null;
  try {
    const data = await customerApi.verifyOtp({ phoneNumber: auth.phone, code: auth.code });
    session.setAuth(data.token, auth.phone);
    router.push({ name: 'wallet' });
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}
</script>
