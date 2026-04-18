<template>
  <main class="mx-auto grid w-full max-w-5xl gap-6 px-6 lg:grid-cols-[380px_1fr]">
    <!-- Auth card -->
    <section class="glass-card animate-rise">
      <!-- Step 1: Phone + role -->
      <template v-if="step === 1">
        <div class="flex items-center justify-between">
          <h2 class="section-title">{{ $t('auth.signIn') }}</h2>
          <span class="chip">{{ $t('auth.otp') }}</span>
        </div>
        <div class="mt-4 space-y-4">
          <div>
            <label class="field-label">{{ $t('auth.phone') }}</label>
            <input
              v-model="auth.phone"
              class="input"
              :placeholder="$t('auth.phonePlaceholder')"
              type="tel"
              autocomplete="tel"
            />
          </div>
          <div>
            <label class="field-label">{{ $t('auth.role') }}</label>
            <select v-model="auth.purpose" class="input">
              <option value="owner">{{ $t('auth.purposeOwner') }}</option>
              <option value="staff">{{ $t('auth.purposeStaff') }}</option>
            </select>
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

      <!-- Step 2: OTP code -->
      <template v-else>
        <div class="flex items-center justify-between">
          <h2 class="section-title">{{ $t('auth.enterCode') }}</h2>
          <span class="chip">{{ $t('auth.otp') }}</span>
        </div>
        <div class="mt-4 space-y-4">
          <p class="rounded-xl bg-white/60 px-3 py-2.5 text-sm text-dusk/70">
            {{ $t('auth.codeSentTo') }}
            <strong class="text-dusk">{{ auth.phone }}</strong>
          </p>
          <div>
            <label class="field-label">{{ $t('auth.otpCode') }}</label>
            <input
              v-model="auth.code"
              class="input tracking-widest"
              :placeholder="$t('auth.otpPlaceholder')"
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
          <button class="btn-ghost w-full" @click="step = 1">
            {{ $t('auth.back') }}
          </button>
          <p v-if="authMessage" :class="messageClass(authMessage.tone)">
            {{ authMessage.text }}
          </p>
        </div>
      </template>
    </section>

    <!-- Role guide -->
    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('auth.whoIsThis') }}</h2>
        <span class="chip">{{ $t('auth.setup') }}</span>
      </div>
      <div class="mt-4 space-y-3">
        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ember/15 text-ember">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 14a7 7 0 0 1 14 0H3Z" />
              </svg>
            </span>
            <p class="text-sm font-semibold text-dusk">{{ $t('auth.purposeOwner') }}</p>
          </div>
          <p class="mt-2 text-xs text-dusk/70">{{ $t('auth.ownerDesc') }}</p>
        </div>

        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-tide/15 text-tide">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M5.5 4A2.5 2.5 0 0 1 8 6.5v.75a2.5 2.5 0 1 1-5 0V6.5A2.5 2.5 0 0 1 5.5 4Zm9 0A2.5 2.5 0 0 1 17 6.5v.75a2.5 2.5 0 1 1-5 0V6.5A2.5 2.5 0 0 1 14.5 4ZM2 15a4 4 0 0 1 7.48-1.97A4.99 4.99 0 0 0 8 17H2v-2Zm10 0a4 4 0 0 1 8 0v2h-6a4.98 4.98 0 0 0-2-3.97V15Z" />
              </svg>
            </span>
            <p class="text-sm font-semibold text-dusk">{{ $t('auth.purposeStaff') }}</p>
          </div>
          <p class="mt-2 text-xs text-dusk/70">{{ $t('auth.staffDesc') }}</p>
        </div>

        <div class="rounded-xl border border-dusk/10 bg-dusk/5 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/50">{{ $t('auth.customerHintTitle') }}</p>
          <p class="mt-1.5 text-xs text-dusk/60">{{ $t('auth.customerHint') }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '../lib/errors';
import { messageClass, setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import { useAuthApi } from '../composables/useAuthApi';
import { useSessionStore } from '../stores/session';
import type { SessionPurpose } from '../stores/session';
import { useI18n } from 'vue-i18n';

const session = useSessionStore();
const router = useRouter();
const authApi = useAuthApi();
const { t } = useI18n();

const step = ref<1 | 2>(1);

const auth = reactive({
  phone: session.phoneNumber || '',
  purpose: (session.purpose === 'customer' ? 'staff' : session.purpose) || 'staff',
  code: ''
});

const authLoading = ref(false);
const authMessage = ref<Message | null>(null);

async function requestOtp() {
  authLoading.value = true;
  authMessage.value = null;
  try {
    await authApi.requestOtp({
      phoneNumber: auth.phone,
      purpose: auth.purpose
    });
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
    const data = await authApi.verifyOtp({
      phoneNumber: auth.phone,
      purpose: auth.purpose,
      code: auth.code
    });
    session.setAuth(data.token, auth.phone, auth.purpose as SessionPurpose);
    await session.fetchMe();
    const hasBusinesses = session.ownerBusinesses.length > 0 || session.staffBusinesses.length > 0;
    router.push(hasBusinesses ? '/app' : '/onboarding');
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}
</script>
