<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[360px_1fr]">
    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('auth.access') }}</h2>
        <span class="chip">{{ $t('auth.otp') }}</span>
      </div>
      <div class="mt-4 space-y-4">
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">{{ $t('auth.phone') }}</label>
        <input v-model="auth.phone" class="input" :placeholder="$t('auth.phone')" />
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">{{ $t('auth.purpose') }}</label>
        <select v-model="auth.purpose" class="input">
          <option value="owner">{{ $t('auth.purposeOwner') }}</option>
          <option value="staff">{{ $t('auth.purposeStaff') }}</option>
          <option value="customer">{{ $t('auth.purposeCustomer') }}</option>
        </select>
        <button class="btn-ghost w-full" :disabled="authLoading" @click="requestOtp">
          {{ authLoading ? $t('auth.sending') : $t('auth.requestOtp') }}
        </button>
        <div class="divider"></div>
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">{{ $t('auth.otpCode') }}</label>
        <input v-model="auth.code" class="input" :placeholder="$t('auth.otpCode')" />
        <button class="btn-primary w-full" :disabled="authLoading" @click="verifyOtp">
          {{ authLoading ? $t('auth.verifying') : $t('auth.verify') }}
        </button>
        <p v-if="authMessage" :class="messageClass(authMessage.tone)">
          {{ authMessage.text }}
        </p>
      </div>
    </section>

    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('auth.startHere') }}</h2>
        <span class="chip">{{ $t('auth.setup') }}</span>
      </div>
      <div class="mt-4 space-y-4 text-sm text-dusk/70">
        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/60">{{ $t('auth.devSetup') }}</p>
          <code class="mt-2 block rounded-lg bg-dusk px-3 py-2 font-mono text-xs text-white">
            docker compose --profile dev up --build
          </code>
          <ul class="mt-3 space-y-1 text-xs">
            <li>{{ $t('auth.webUrl') }}: http://localhost:5173</li>
            <li>{{ $t('auth.mobileUrl') }}: http://localhost:5174</li>
            <li>{{ $t('auth.apiUrl') }}: http://localhost:5000</li>
          </ul>
          <p class="mt-2 text-xs text-dusk/80">{{ $t('auth.devOtpHint') }}</p>
        </div>

        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/60">{{ $t('auth.roleFlows') }}</p>
          <ul class="mt-3 space-y-3 text-xs">
            <li class="flex gap-2">
              <span class="mt-0.5 rounded-md bg-ember/15 p-1 text-ember">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 14a7 7 0 0 1 14 0H3Z" />
                </svg>
              </span>
              <span>{{ $t('auth.ownerFlow') }}</span>
            </li>
            <li class="flex gap-2">
              <span class="mt-0.5 rounded-md bg-tide/15 p-1 text-tide">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    d="M5.5 4A2.5 2.5 0 0 1 8 6.5v.75a2.5 2.5 0 1 1-5 0V6.5A2.5 2.5 0 0 1 5.5 4Zm9 0A2.5 2.5 0 0 1 17 6.5v.75a2.5 2.5 0 1 1-5 0V6.5A2.5 2.5 0 0 1 14.5 4ZM2 15a4 4 0 0 1 7.48-1.97A4.99 4.99 0 0 0 8 17H2v-2Zm10 0a4 4 0 0 1 8 0v2h-6a4.98 4.98 0 0 0-2-3.97V15Z"
                  />
                </svg>
              </span>
              <span>{{ $t('auth.staffFlow') }}</span>
            </li>
            <li class="flex gap-2">
              <span class="mt-0.5 rounded-md bg-dusk/10 p-1 text-dusk">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    d="M3 4.75A1.75 1.75 0 0 1 4.75 3h10.5A1.75 1.75 0 0 1 17 4.75v10.5A1.75 1.75 0 0 1 15.25 17H4.75A1.75 1.75 0 0 1 3 15.25V4.75Zm3 1.5a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.28.53l4-4a.75.75 0 0 0 0-1.06l-4-4A.75.75 0 0 0 6 5.25v1Z"
                  />
                </svg>
              </span>
              <span>{{ $t('auth.customerFlow') }}</span>
            </li>
            <li class="flex gap-2">
              <span class="mt-0.5 rounded-md bg-dusk/10 p-1 text-dusk">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    d="M10 2 3 5.5v4.25c0 4.3 2.98 7.2 7 8.75 4.02-1.55 7-4.45 7-8.75V5.5L10 2Zm3.02 6.53-3.75 3.75a.75.75 0 0 1-1.06 0L6.98 11.05a.75.75 0 1 1 1.06-1.06l.69.69 3.22-3.22a.75.75 0 1 1 1.06 1.06Z"
                  />
                </svg>
              </span>
              <span>{{ $t('auth.adminFlow') }}</span>
            </li>
          </ul>
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

const auth = reactive({
  phone: session.phoneNumber || '',
  purpose: session.purpose || 'staff',
  code: ''
});

const authLoading = ref(false);
const authMessage = ref<Message | null>(null);

async function requestOtp() {
  authLoading.value = true;
  try {
    await authApi.requestOtp({
      phoneNumber: auth.phone,
      purpose: auth.purpose
    });
    setMessage(authMessage, 'success', t('auth.otpSent'));
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}

async function verifyOtp() {
  authLoading.value = true;
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
    setMessage(authMessage, 'success', t('auth.signedIn'));
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}
</script>
