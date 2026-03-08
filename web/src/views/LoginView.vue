<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[360px_1fr]">
    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">Access</h2>
        <span class="chip">OTP</span>
      </div>
      <div class="mt-4 space-y-4">
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">Phone</label>
        <input v-model="auth.phone" class="input" placeholder="+966 5X XXX XXXX" />
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">Purpose</label>
        <select v-model="auth.purpose" class="input">
          <option value="owner">Owner</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
        <button class="btn-ghost w-full" :disabled="authLoading" @click="requestOtp">
          {{ authLoading ? 'Sending...' : 'Request OTP' }}
        </button>
        <div class="divider"></div>
        <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">OTP Code</label>
        <input v-model="auth.code" class="input" placeholder="6-digit code" />
        <button class="btn-primary w-full" :disabled="authLoading" @click="verifyOtp">
          {{ authLoading ? 'Verifying...' : 'Verify & Sign in' }}
        </button>
        <p v-if="authMessage" :class="messageClass(authMessage.tone)">
          {{ authMessage.text }}
        </p>
      </div>
    </section>

    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">What this unlocks</h2>
        <span class="chip">MVP</span>
      </div>
      <div class="mt-4 space-y-4 text-sm text-dusk/70">
        <p>
          Staff can record visits, redeem rewards, and capture customer context in seconds. Owners can configure
          the reward, manage staff, and audit redemptions.
        </p>
        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/60">Today&apos;s focus</p>
          <ul class="mt-3 space-y-2">
            <li>• OTP login with role awareness</li>
            <li>• Business selector with live status</li>
            <li>• Fast counter actions</li>
          </ul>
        </div>
        <p>
          When you verify, you&apos;ll be routed to your business workspace. If you&apos;re a new owner, the system
          will guide you through onboarding.
        </p>
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

const session = useSessionStore();
const router = useRouter();
const authApi = useAuthApi();

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
    setMessage(authMessage, 'success', 'OTP sent. Check the console SMS in the backend logs.');
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
    setMessage(authMessage, 'success', 'Signed in successfully.');
  } catch (error) {
    setMessage(authMessage, 'error', getErrorMessage(error));
  } finally {
    authLoading.value = false;
  }
}
</script>
