<template>
  <main class="mx-auto grid w-full max-w-5xl gap-6 px-6 lg:grid-cols-[1.1fr_0.9fr]">
    <!-- Wizard card -->
    <section class="glass-card animate-rise">
      <!-- Step indicator -->
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ stepTitle }}</h2>
        <span class="chip">{{ step }} / 3</span>
      </div>
      <div class="mt-3 flex gap-1.5">
        <div
          v-for="n in 3"
          :key="n"
          class="h-1 flex-1 rounded-full transition-colors"
          :class="n <= step ? 'bg-ember' : 'bg-ink/10'"
        />
      </div>

      <p class="mt-3 text-sm text-dusk/60">{{ stepDescription }}</p>

      <!-- Step 1: Business basics -->
      <div v-if="step === 1" class="mt-5 space-y-4">
        <div>
          <label class="field-label">{{ $t('onboarding.name') }} <span class="text-ember">*</span></label>
          <input v-model="onboarding.name" class="input" :placeholder="$t('onboarding.namePlaceholder')" />
        </div>
        <div>
          <label class="field-label">{{ $t('onboarding.type') }}</label>
          <select v-model="onboarding.businessType" class="input">
            <option value="cafe">{{ $t('onboarding.typeCafe') }}</option>
            <option value="fast_food">{{ $t('onboarding.typeFastFood') }}</option>
            <option value="retail">{{ $t('onboarding.typeRetail') }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">{{ $t('onboarding.ownerPhone') }}</label>
          <input v-model="onboarding.ownerPhone" class="input" readonly />
        </div>
        <button
          class="btn-primary w-full"
          :disabled="!onboarding.name.trim()"
          @click="step = 2"
        >
          {{ $t('onboarding.next') }}
        </button>
      </div>

      <!-- Step 2: Program details -->
      <div v-else-if="step === 2" class="mt-5 space-y-4">
        <div>
          <label class="field-label">{{ $t('onboarding.programName') }} <span class="text-ember">*</span></label>
          <input v-model="onboarding.programName" class="input" :placeholder="$t('onboarding.programNamePlaceholder')" />
        </div>
        <div>
          <label class="field-label">{{ $t('onboarding.programDescription') }} <span class="text-dusk/40 normal-case font-normal tracking-normal">{{ $t('onboarding.optional') }}</span></label>
          <textarea v-model="onboarding.programDescription" class="textarea" :placeholder="$t('onboarding.programDescriptionPlaceholder')"></textarea>
        </div>
        <div>
          <label class="field-label">{{ $t('onboarding.rewardName') }} <span class="text-ember">*</span></label>
          <input v-model="onboarding.rewardName" class="input" :placeholder="$t('onboarding.rewardNamePlaceholder')" />
        </div>
        <div>
          <label class="field-label">{{ $t('onboarding.visitThreshold') }} <span class="text-ember">*</span></label>
          <p class="mb-1.5 text-xs text-dusk/50">{{ $t('onboarding.visitThresholdHint') }}</p>
          <input v-model.number="onboarding.visitThreshold" class="input" type="number" min="1" max="50" />
        </div>
        <div class="flex gap-3">
          <button class="btn-ghost flex-1" @click="step = 1">{{ $t('onboarding.back') }}</button>
          <button
            class="btn-primary flex-1"
            :disabled="!onboarding.programName.trim() || !onboarding.rewardName.trim()"
            @click="step = 3"
          >
            {{ $t('onboarding.next') }}
          </button>
        </div>
      </div>

      <!-- Step 3: Optional extras + confirm -->
      <div v-else class="mt-5 space-y-4">
        <div>
          <label class="field-label">{{ $t('onboarding.optionalNote') }} <span class="text-dusk/40 normal-case font-normal tracking-normal">{{ $t('onboarding.optional') }}</span></label>
          <textarea v-model="onboarding.optionalNote" class="textarea" :placeholder="$t('onboarding.optionalNotePlaceholder')"></textarea>
        </div>
        <div>
          <label class="field-label">{{ $t('onboarding.stampExpiration') }} <span class="text-dusk/40 normal-case font-normal tracking-normal">{{ $t('onboarding.optional') }}</span></label>
          <p class="mb-1.5 text-xs text-dusk/50">{{ $t('onboarding.stampExpirationHint') }}</p>
          <input
            v-model="onboarding.stampExpirationDays"
            class="input"
            type="number"
            min="1"
            :placeholder="$t('onboarding.stampExpirationPlaceholder')"
          />
        </div>

        <!-- Summary -->
        <div class="rounded-xl border border-white/60 bg-white/70 p-4 text-sm space-y-1.5">
          <p class="text-xs font-semibold uppercase tracking-wider text-dusk/50">{{ $t('onboarding.reviewTitle') }}</p>
          <p><span class="text-dusk/60">{{ $t('onboarding.name') }}:</span> <strong>{{ onboarding.name }}</strong></p>
          <p><span class="text-dusk/60">{{ $t('onboarding.programName') }}:</span> <strong>{{ onboarding.programName }}</strong></p>
          <p><span class="text-dusk/60">{{ $t('onboarding.rewardName') }}:</span> <strong>{{ onboarding.rewardName }}</strong></p>
          <p><span class="text-dusk/60">{{ $t('onboarding.visitThreshold') }}:</span> <strong>{{ onboarding.visitThreshold }} {{ $t('onboarding.stamps') }}</strong></p>
        </div>

        <p v-if="!canOnboard" class="rounded-xl bg-ember/10 px-3 py-2 text-xs font-semibold text-ember">
          {{ $t('onboarding.switchOwner') }}
        </p>
        <p v-if="onboardingMessage" :class="messageClass(onboardingMessage.tone)">
          {{ onboardingMessage.text }}
        </p>

        <div class="flex gap-3">
          <button class="btn-ghost flex-1" @click="step = 2">{{ $t('onboarding.back') }}</button>
          <button
            class="btn-primary flex-1"
            :disabled="onboardingLoading || !canOnboard"
            @click="submitOnboarding"
          >
            {{ onboardingLoading ? $t('onboarding.creating') : $t('onboarding.create') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Guide panel -->
    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('onboarding.nextUp') }}</h2>
        <span class="chip">{{ $t('onboarding.setup') }}</span>
      </div>
      <div class="mt-4 space-y-4 text-sm text-dusk/70">
        <p>{{ $t('onboarding.afterOnboarding') }}</p>
        <ul class="space-y-2">
          <li class="flex gap-2">
            <span class="mt-0.5 text-ember font-bold">1.</span>
            <span>{{ $t('onboarding.nextUpItems[0]') }}</span>
          </li>
          <li class="flex gap-2">
            <span class="mt-0.5 text-ember font-bold">2.</span>
            <span>{{ $t('onboarding.nextUpItems[1]') }}</span>
          </li>
          <li class="flex gap-2">
            <span class="mt-0.5 text-ember font-bold">3.</span>
            <span>{{ $t('onboarding.nextUpItems[2]') }}</span>
          </li>
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
import { useLoyaltyApi } from '../composables/useLoyaltyApi';

const session = useSessionStore();
const router = useRouter();
const { t } = useI18n();
const api = useLoyaltyApi(session.token);

const step = ref<1 | 2 | 3>(1);

const stepTitle = computed(() => {
  if (step.value === 1) return t('onboarding.step1Title');
  if (step.value === 2) return t('onboarding.step2Title');
  return t('onboarding.step3Title');
});

const stepDescription = computed(() => {
  if (step.value === 1) return t('onboarding.step1Desc');
  if (step.value === 2) return t('onboarding.step2Desc');
  return t('onboarding.step3Desc');
});

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
