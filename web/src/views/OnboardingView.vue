<template>
  <main class="mx-auto grid w-full max-w-5xl gap-6 px-6 lg:grid-cols-[1.1fr_0.9fr]">
    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">Business onboarding</h2>
        <span class="chip">Owner</span>
      </div>
      <p class="mt-2 text-sm text-dusk/70">
        Create the first business and set the program details. Reward text is locked per loyalty cycle.
      </p>
      <div class="mt-4 space-y-3">
        <input v-model="onboarding.name" class="input" placeholder="Business name" />
        <input v-model="onboarding.ownerPhone" class="input" placeholder="Owner phone" readonly />
        <select v-model="onboarding.businessType" class="input">
          <option value="cafe">Cafe</option>
          <option value="fast_food">Fast food</option>
          <option value="retail">Retail</option>
        </select>
        <input v-model="onboarding.programName" class="input" placeholder="Program name" />
        <textarea
          v-model="onboarding.programDescription"
          class="textarea"
          placeholder="Program description"
        ></textarea>
        <input v-model="onboarding.rewardName" class="input" placeholder="Reward name" />
        <input v-model.number="onboarding.visitThreshold" class="input" type="number" min="1" />
        <textarea v-model="onboarding.optionalNote" class="textarea" placeholder="Optional note"></textarea>
        <input
          v-model="onboarding.stampExpirationDays"
          class="input"
          type="number"
          min="1"
          placeholder="Stamp expiration days (optional)"
        />
        <button class="btn-primary w-full" :disabled="onboardingLoading || !canOnboard" @click="submitOnboarding">
          {{ onboardingLoading ? 'Creating...' : 'Create business' }}
        </button>
        <p v-if="!canOnboard" class="mt-2 text-xs font-semibold text-ember">
          Switch to an owner OTP session to create a business.
        </p>
        <p v-if="onboardingMessage" :class="messageClass(onboardingMessage.tone)">
          {{ onboardingMessage.text }}
        </p>
      </div>
    </section>

    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">Next up</h2>
        <span class="chip">Setup</span>
      </div>
      <div class="mt-4 space-y-4 text-sm text-dusk/70">
        <p>After onboarding you can:</p>
        <ul class="space-y-2">
          <li>• Invite staff and set their phones</li>
          <li>• Start recording visits immediately</li>
          <li>• Track redemptions as they happen</li>
        </ul>
        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/60">Remember</p>
          <p class="mt-2">
            Reward changes apply only to new cycles. Existing customers keep their current reward snapshot.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '../lib/errors';
import { messageClass, setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import { useSessionStore } from '../stores/session';

const session = useSessionStore();
const router = useRouter();
const api = useLoyaltyApi(session.token);

const onboarding = reactive({
  name: '',
  ownerPhone: session.phoneNumber || '',
  businessType: 'cafe',
  programName: '',
  programDescription: '',
  rewardName: '',
  visitThreshold: 9,
  optionalNote: '',
  stampExpirationDays: '' as string | number
});

const onboardingLoading = ref(false);
const onboardingMessage = ref<Message | null>(null);

const canOnboard = computed(() => session.purpose === 'owner');

async function submitOnboarding() {
  if (!onboarding.programName.trim()) {
    setMessage(onboardingMessage, 'error', 'Program name is required.');
    return;
  }
  onboardingLoading.value = true;
  try {
    await api.onboard({
      name: onboarding.name,
      ownerPhone: onboarding.ownerPhone,
      businessType: onboarding.businessType,
      programName: onboarding.programName,
      programDescription: onboarding.programDescription,
      rewardName: onboarding.rewardName,
      visitThreshold: onboarding.visitThreshold,
      optionalNote: onboarding.optionalNote,
      stampExpirationDays: onboarding.stampExpirationDays || null
    });
    setMessage(onboardingMessage, 'success', 'Business created.');
    await session.fetchMe();
    router.push('/app');
  } catch (error) {
    setMessage(onboardingMessage, 'error', getErrorMessage(error));
  } finally {
    onboardingLoading.value = false;
  }
}
</script>
