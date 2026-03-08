<template>
  <main class="mx-auto grid w-full max-w-5xl gap-6 px-6 lg:grid-cols-[1.1fr_0.9fr]">
    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('onboarding.title') }}</h2>
        <span class="chip">{{ $t('onboarding.owner') }}</span>
      </div>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('onboarding.description') }}</p>
      <div class="mt-4 space-y-3">
        <input v-model="onboarding.name" class="input" :placeholder="$t('onboarding.name')" />
        <input v-model="onboarding.ownerPhone" class="input" :placeholder="$t('onboarding.ownerPhone')" readonly />
        <select v-model="onboarding.businessType" class="input">
          <option value="cafe">{{ $t('onboarding.type') }}: {{ $t('onboarding.typeCafe') }}</option>
          <option value="fast_food">{{ $t('onboarding.type') }}: {{ $t('onboarding.typeFastFood') }}</option>
          <option value="retail">{{ $t('onboarding.type') }}: {{ $t('onboarding.typeRetail') }}</option>
        </select>
        <input v-model="onboarding.programName" class="input" :placeholder="$t('onboarding.programName')" />
        <textarea
          v-model="onboarding.programDescription"
          class="textarea"
          :placeholder="$t('onboarding.programDescription')"
        ></textarea>
        <input v-model="onboarding.rewardName" class="input" :placeholder="$t('onboarding.rewardName')" />
        <input v-model.number="onboarding.visitThreshold" class="input" type="number" min="1" />
        <textarea v-model="onboarding.optionalNote" class="textarea" :placeholder="$t('onboarding.optionalNote')"></textarea>
        <input
          v-model="onboarding.stampExpirationDays"
          class="input"
          type="number"
          min="1"
          :placeholder="$t('onboarding.stampExpiration')"
        />
        <button class="btn-primary w-full" :disabled="onboardingLoading || !canOnboard" @click="submitOnboarding">
          {{ onboardingLoading ? $t('onboarding.creating') : $t('onboarding.create') }}
        </button>
        <p v-if="!canOnboard" class="mt-2 text-xs font-semibold text-ember">
          {{ $t('onboarding.switchOwner') }}
        </p>
        <p v-if="onboardingMessage" :class="messageClass(onboardingMessage.tone)">
          {{ onboardingMessage.text }}
        </p>
      </div>
    </section>

    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('onboarding.nextUp') }}</h2>
        <span class="chip">{{ $t('onboarding.setup') }}</span>
      </div>
      <div class="mt-4 space-y-4 text-sm text-dusk/70">
        <p>{{ $t('onboarding.afterOnboarding') }}</p>
        <ul class="space-y-2">
          <li>• {{ $t('onboarding.nextUpItems[0]') }}</li>
          <li>• {{ $t('onboarding.nextUpItems[1]') }}</li>
          <li>• {{ $t('onboarding.nextUpItems[2]') }}</li>
        </ul>
        <div class="rounded-xl border border-white/60 bg-white/70 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/60">{{ $t('onboarding.remember') }}</p>
          <p class="mt-2">{{ $t('onboarding.snapshot') }}</p>
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
import { useI18n } from 'vue-i18n';

const session = useSessionStore();
const router = useRouter();
const { t } = useI18n();
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
    setMessage(onboardingMessage, 'error', t('messages.programNameRequired'));
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
    setMessage(onboardingMessage, 'success', t('messages.businessCreated'));
    await session.fetchMe();
    router.push('/app');
  } catch (error) {
    setMessage(onboardingMessage, 'error', getErrorMessage(error));
  } finally {
    onboardingLoading.value = false;
  }
}
</script>
