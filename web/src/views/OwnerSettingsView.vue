<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[280px_1fr]">
    <section v-if="!ownerBusinessOptions.length" class="glass-card animate-rise lg:col-span-2">
      <h2 class="section-title">{{ $t('ownerSettings.ownerOnlyTitle') }}</h2>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerSettings.ownerOnlyHint') }}</p>
      <button class="btn-primary mt-4" @click="backToDashboard">
        {{ $t('ownerSettings.backToDashboard') }}
      </button>
    </section>

    <template v-else>
      <aside class="flex flex-col gap-6">
        <BusinessContextCard
          :business-options="ownerBusinessOptions"
          :selected-business="selectedBusiness"
          :phone-number="session.phoneNumber"
          :purpose="session.purpose"
          :owner-count="session.ownerBusinesses.length"
          :staff-count="session.staffBusinesses.length"
          :lock-business-selection="lockBusinessSelection"
          @update:selected-business="(value) => (selectedBusiness = value)"
          @refresh="refreshMe"
        />

        <section class="glass-card animate-rise">
          <h2 class="section-title">{{ $t('ownerSettings.title') }}</h2>
          <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerSettings.sidebarHint') }}</p>
          <button class="btn-ghost mt-4 w-full" @click="backToDashboard">
            {{ $t('ownerSettings.backToDashboard') }}
          </button>
        </section>
      </aside>

      <section class="space-y-6">
        <section class="glass-card animate-rise">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="section-title">{{ $t('ownerSettings.title') }}</h2>
              <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerSettings.description') }}</p>
            </div>
            <span class="chip">{{ activeBusiness?.name || $t('dashboard.pickBusiness') }}</span>
          </div>
        </section>

        <LoyaltyConfigCard
          :config="loyaltyConfig"
          :loading="loyaltyLoading"
          :message="loyaltyMessage"
          @update:program-name="(value) => (loyaltyConfig.programName = value)"
          @update:program-description="(value) => (loyaltyConfig.programDescription = value)"
          @update:reward-name="(value) => (loyaltyConfig.rewardName = value)"
          @update:visit-threshold="(value) => (loyaltyConfig.visitThreshold = value)"
          @update:optional-note="(value) => (loyaltyConfig.optionalNote = value)"
          @update:stamp-expiration-days="(value) => (loyaltyConfig.stampExpirationDays = value)"
          @program-icon-change="onProgramIconChange"
          @reward-image-change="onRewardImageChange"
          @upload-program-icon="uploadProgramIcon"
          @upload-reward-image="uploadRewardImage"
          @save="saveLoyaltyConfig"
          @refresh="loadLoyaltyConfig"
        />

        <MagicLinkCard
          :link="magicLink?.url || null"
          :expires-at="magicLink?.expiresAt || null"
          :business-name="magicLink?.businessName || null"
          :qr-data-url="magicLinkQr"
          :loading="magicLinkLoading"
          :message="magicLinkMessage"
          @generate="generateMagicLink"
          @copy="copyMagicLink"
        />
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import QRCode from 'qrcode';
import { useSessionStore } from '../stores/session';
import { useLoyaltyApi } from '../composables/useLoyaltyApi';
import { getErrorMessage } from '../lib/errors';
import { setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import type { MagicLinkResponse } from '../lib/types';
import BusinessContextCard from '../components/dashboard/BusinessContextCard.vue';
import LoyaltyConfigCard from '../components/dashboard/LoyaltyConfigCard.vue';
import MagicLinkCard from '../components/dashboard/MagicLinkCard.vue';

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'owner';
};

const router = useRouter();
const session = useSessionStore();
const api = computed(() => useLoyaltyApi(session.token));
const { t } = useI18n();

const loyaltyConfig = reactive({
  programName: '',
  programDescription: '',
  rewardName: '',
  programIconUrl: '',
  rewardImageUrl: '',
  visitThreshold: 9,
  optionalNote: '',
  stampExpirationDays: '' as string | number
});
const loyaltyLoading = ref(false);
const loyaltyMessage = ref<Message | null>(null);

const media = reactive({
  programIconFile: null as File | null,
  rewardImageFile: null as File | null
});

const magicLink = ref<MagicLinkResponse | null>(null);
const magicLinkQr = ref<string | null>(null);
const magicLinkLoading = ref(false);
const magicLinkMessage = ref<Message | null>(null);

const ownerBusinessOptions = computed<BusinessOption[]>(() =>
  session.ownerBusinesses.map((business) => ({
    ...business,
    role: 'owner'
  }))
);

const selectedBusiness = ref<number | ''>(session.activeBusinessId || '');

const activeBusiness = computed<BusinessOption | null>(() => {
  const id = Number(selectedBusiness.value);
  if (!id) {
    return null;
  }
  return ownerBusinessOptions.value.find((item) => item.id === id) || null;
});

const lockBusinessSelection = computed(() => ownerBusinessOptions.value.length <= 1);

watch(
  ownerBusinessOptions,
  (options) => {
    if (!options.length) {
      selectedBusiness.value = '';
      session.setActiveBusiness(null);
      return;
    }

    const selectedId = Number(selectedBusiness.value);
    const stillValid = options.some((item) => item.id === selectedId);
    if (!stillValid) {
      selectedBusiness.value = options[0].id;
      session.setActiveBusiness(options[0].id);
    }
  },
  { immediate: true }
);

watch(selectedBusiness, (value) => {
  session.setActiveBusiness(value ? Number(value) : null);
});

watch(
  () => activeBusiness.value?.id,
  async (value) => {
    magicLink.value = null;
    magicLinkQr.value = null;
    magicLinkMessage.value = null;

    if (value) {
      await loadLoyaltyConfig();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (session.token && !session.meLoaded) {
    await session.fetchMe();
  }
});

async function refreshMe() {
  try {
    await session.fetchMe();
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  }
}

async function loadLoyaltyConfig() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    const data = await api.value.getBusiness(activeBusiness.value.id);
    loyaltyConfig.programName = data.programName || '';
    loyaltyConfig.programDescription = data.programDescription || '';
    loyaltyConfig.programIconUrl = data.programIconUrl || '';
    loyaltyConfig.rewardName = data.rewardName || '';
    loyaltyConfig.rewardImageUrl = data.rewardImageUrl || '';
    loyaltyConfig.visitThreshold = data.visitThreshold || 1;
    loyaltyConfig.optionalNote = data.optionalNote || '';
    loyaltyConfig.stampExpirationDays = data.stampExpirationDays ?? '';
    setMessage(loyaltyMessage, 'success', t('messages.configLoaded'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}

async function saveLoyaltyConfig() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!loyaltyConfig.programName.trim()) {
    setMessage(loyaltyMessage, 'error', t('messages.programNameRequired'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    await api.value.updateLoyaltyConfig(activeBusiness.value.id, {
      programName: loyaltyConfig.programName,
      programDescription: loyaltyConfig.programDescription,
      rewardName: loyaltyConfig.rewardName,
      visitThreshold: loyaltyConfig.visitThreshold,
      optionalNote: loyaltyConfig.optionalNote,
      stampExpirationDays: loyaltyConfig.stampExpirationDays || null
    });
    setMessage(loyaltyMessage, 'success', t('messages.configUpdated'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}

async function generateMagicLink() {
  if (!activeBusiness.value) {
    setMessage(magicLinkMessage, 'error', t('messages.selectBusiness'));
    return;
  }

  magicLinkLoading.value = true;
  try {
    const data = await api.value.createMagicLink(activeBusiness.value.id);
    magicLink.value = data;
    magicLinkQr.value = await QRCode.toDataURL(data.url, { width: 240, margin: 1 });
    setMessage(magicLinkMessage, 'success', t('messages.magicLinkCreated'));
  } catch (error) {
    setMessage(magicLinkMessage, 'error', getErrorMessage(error));
  } finally {
    magicLinkLoading.value = false;
  }
}

async function copyMagicLink() {
  if (!magicLink.value?.url) {
    return;
  }

  try {
    await navigator.clipboard.writeText(magicLink.value.url);
    setMessage(magicLinkMessage, 'success', t('messages.magicLinkCopied'));
  } catch (error) {
    setMessage(magicLinkMessage, 'error', getErrorMessage(error));
  }
}

function onProgramIconChange(event: Event) {
  const target = event.target as HTMLInputElement;
  media.programIconFile = target.files?.[0] ?? null;
}

function onRewardImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  media.rewardImageFile = target.files?.[0] ?? null;
}

async function uploadProgramIcon() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!media.programIconFile) {
    setMessage(loyaltyMessage, 'error', t('messages.imageRequired'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('kind', 'program_icon');
    formData.append('file', media.programIconFile);
    const data = await api.value.uploadMedia(activeBusiness.value.id, formData);
    loyaltyConfig.programIconUrl = data.url;
    setMessage(loyaltyMessage, 'success', t('messages.programIconUploaded'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}

async function uploadRewardImage() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!media.rewardImageFile) {
    setMessage(loyaltyMessage, 'error', t('messages.imageRequired'));
    return;
  }
  loyaltyLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('kind', 'reward_image');
    formData.append('file', media.rewardImageFile);
    const data = await api.value.uploadMedia(activeBusiness.value.id, formData);
    loyaltyConfig.rewardImageUrl = data.url;
    setMessage(loyaltyMessage, 'success', t('messages.rewardImageUploaded'));
  } catch (error) {
    setMessage(loyaltyMessage, 'error', getErrorMessage(error));
  } finally {
    loyaltyLoading.value = false;
  }
}

function backToDashboard() {
  router.push({ name: 'app' });
}
</script>
