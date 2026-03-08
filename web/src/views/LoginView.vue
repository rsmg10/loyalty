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
        <h2 class="section-title">{{ $t('onboarding.nextUp') }}</h2>
        <span class="chip">{{ $t('onboarding.setup') }}</span>
      </div>
      <div class="mt-4 space-y-4 text-sm text-dusk/70">
        <p>{{ $t('app.description') }}</p>
        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/60">{{ $t('onboarding.remember') }}</p>
          <ul class="mt-3 space-y-2">
            <li>• {{ $t('dashboard.frontCounter') }}</li>
            <li>• {{ $t('dashboard.customerCare') }}</li>
            <li>• {{ $t('dashboard.ownerTools') }}</li>
          </ul>
        </div>
        <p>{{ $t('onboarding.snapshot') }}</p>
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
