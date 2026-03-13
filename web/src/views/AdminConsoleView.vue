<template>
  <main class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6">
    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('admin.consoleTitle') }}</h2>
        <button class="btn-ghost" @click="backToApp">
          {{ $t('admin.backToApp') }}
        </button>
      </div>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('admin.consoleDescription') }}</p>
    </section>

    <AdminOverviewCard
      :report="overview"
      :loading="overviewLoading"
      :message="overviewMessage"
      @refresh="loadOverview"
    />
    <AdminVendorComparisonCard
      :report="vendorComparison"
      :loading="vendorLoading"
      :message="vendorMessage"
      @refresh="loadVendorComparison"
    />

    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('admin.businessesTitle') }}</h2>
        <span class="chip">{{ $t('admin.platform') }}</span>
      </div>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('admin.businessesDescription') }}</p>
      <div class="mt-4 space-y-3">
        <input v-model="businessSearch" class="input" :placeholder="$t('admin.searchBusinesses')" />
        <button class="btn-ghost w-full" :disabled="businessListLoading" @click="loadBusinesses">
          {{ businessListLoading ? $t('cards.loading') : $t('admin.loadBusinesses') }}
        </button>
        <select class="input" :value="selectedBusinessId" @change="onSelectBusiness">
          <option value="">{{ $t('admin.pickBusiness') }}</option>
          <option v-for="item in businessList?.items || []" :key="item.id" :value="item.id">
            {{ item.name }} · {{ item.ownerPhone }}
          </option>
        </select>
        <p v-if="businessListMessage" :class="messageClass(businessListMessage.tone)">
          {{ businessListMessage.text }}
        </p>
      </div>
    </section>

    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('admin.businessDetailTitle') }}</h2>
        <span class="chip">{{ $t('admin.platform') }}</span>
      </div>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('admin.businessDetailDescription') }}</p>
      <div class="mt-4 space-y-3">
        <input v-model="businessForm.name" class="input" :placeholder="$t('admin.businessName')" />
        <input v-model="businessForm.ownerPhone" class="input" :placeholder="$t('admin.ownerPhone')" />
        <select v-model="businessForm.businessType" class="input">
          <option value="cafe">{{ $t('onboarding.typeCafe') }}</option>
          <option value="fast_food">{{ $t('onboarding.typeFastFood') }}</option>
          <option value="retail">{{ $t('onboarding.typeRetail') }}</option>
        </select>
        <label class="flex items-center gap-2 text-sm text-dusk/80">
          <input v-model="businessForm.programActive" type="checkbox" />
          {{ $t('admin.programActive') }}
        </label>
        <input v-model="businessForm.programName" class="input" :placeholder="$t('onboarding.programName')" />
        <textarea
          v-model="businessForm.programDescription"
          class="textarea"
          :placeholder="$t('onboarding.programDescription')"
        ></textarea>
        <input v-model="businessForm.rewardName" class="input" :placeholder="$t('onboarding.rewardName')" />
        <input v-model.number="businessForm.visitThreshold" class="input" type="number" min="1" />
        <textarea v-model="businessForm.optionalNote" class="textarea" :placeholder="$t('onboarding.optionalNote')"></textarea>
        <input
          v-model="businessForm.stampExpirationDays"
          class="input"
          type="number"
          min="1"
          :placeholder="$t('onboarding.stampExpiration')"
        />
        <button class="btn-primary w-full" :disabled="businessSaveLoading || !businessDetail" @click="saveBusiness">
          {{ businessSaveLoading ? $t('cards.loading') : $t('admin.saveBusiness') }}
        </button>
        <p v-if="businessSaveMessage" :class="messageClass(businessSaveMessage.tone)">
          {{ businessSaveMessage.text }}
        </p>
      </div>
    </section>

    <section class="glass-card animate-rise">
      <div class="flex items-center justify-between">
        <h2 class="section-title">{{ $t('admin.createBusinessTitle') }}</h2>
        <span class="chip">{{ $t('admin.platform') }}</span>
      </div>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('admin.createBusinessDescription') }}</p>
      <div class="mt-4 space-y-3">
        <input v-model="createForm.name" class="input" :placeholder="$t('onboarding.name')" />
        <input v-model="createForm.ownerPhone" class="input" :placeholder="$t('onboarding.ownerPhone')" />
        <select v-model="createForm.businessType" class="input">
          <option value="cafe">{{ $t('onboarding.typeCafe') }}</option>
          <option value="fast_food">{{ $t('onboarding.typeFastFood') }}</option>
          <option value="retail">{{ $t('onboarding.typeRetail') }}</option>
        </select>
        <input v-model="createForm.programName" class="input" :placeholder="$t('onboarding.programName')" />
        <textarea
          v-model="createForm.programDescription"
          class="textarea"
          :placeholder="$t('onboarding.programDescription')"
        ></textarea>
        <input v-model="createForm.rewardName" class="input" :placeholder="$t('onboarding.rewardName')" />
        <input v-model.number="createForm.visitThreshold" class="input" type="number" min="1" />
        <textarea v-model="createForm.optionalNote" class="textarea" :placeholder="$t('onboarding.optionalNote')"></textarea>
        <input
          v-model="createForm.stampExpirationDays"
          class="input"
          type="number"
          min="1"
          :placeholder="$t('onboarding.stampExpiration')"
        />
        <button class="btn-primary w-full" :disabled="createLoading" @click="createBusiness">
          {{ createLoading ? $t('cards.loading') : $t('admin.createBusiness') }}
        </button>
        <p v-if="createMessage" :class="messageClass(createMessage.tone)">
          {{ createMessage.text }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLoyaltyApi } from '../composables/useLoyaltyApi';
import { useSessionStore } from '../stores/session';
import { getErrorMessage } from '../lib/errors';
import { messageClass, setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import type {
  AdminBusinessDetail,
  AdminBusinessSummary,
  AdminBusinessUpdate,
  PagedResponse,
  PlatformOverviewReport,
  VendorComparisonReport
} from '../lib/types';
import AdminOverviewCard from '../components/admin/AdminOverviewCard.vue';
import AdminVendorComparisonCard from '../components/admin/AdminVendorComparisonCard.vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const session = useSessionStore();
const api = useLoyaltyApi(session.token);
const { t } = useI18n();

const overview = ref<PlatformOverviewReport | null>(null);
const overviewLoading = ref(false);
const overviewMessage = ref<Message | null>(null);

const vendorComparison = ref<VendorComparisonReport | null>(null);
const vendorLoading = ref(false);
const vendorMessage = ref<Message | null>(null);

const businessSearch = ref('');
const businessList = ref<PagedResponse<AdminBusinessSummary> | null>(null);
const businessListLoading = ref(false);
const businessListMessage = ref<Message | null>(null);
const selectedBusinessId = ref<number | ''>('');
const businessDetail = ref<AdminBusinessDetail | null>(null);
const businessDetailLoading = ref(false);
const businessSaveLoading = ref(false);
const businessSaveMessage = ref<Message | null>(null);

const businessForm = reactive({
  name: '',
  ownerPhone: '',
  businessType: 'cafe',
  programActive: true,
  programName: '',
  programDescription: '',
  rewardName: '',
  visitThreshold: 9,
  optionalNote: '',
  stampExpirationDays: '' as string | number
});

const createForm = reactive({
  name: '',
  ownerPhone: '',
  businessType: 'cafe',
  programName: '',
  programDescription: '',
  rewardName: '',
  visitThreshold: 9,
  optionalNote: '',
  stampExpirationDays: '' as string | number
});
const createLoading = ref(false);
const createMessage = ref<Message | null>(null);

watch(
  () => businessDetail.value,
  (detail) => {
    if (!detail) {
      return;
    }
    businessForm.name = detail.name;
    businessForm.ownerPhone = detail.ownerPhone;
    businessForm.businessType = detail.businessType;
    businessForm.programActive = detail.programActive;
    businessForm.programName = detail.programName || '';
    businessForm.programDescription = detail.programDescription || '';
    businessForm.rewardName = detail.rewardName || '';
    businessForm.visitThreshold = detail.visitThreshold || 1;
    businessForm.optionalNote = detail.optionalNote || '';
    businessForm.stampExpirationDays = detail.stampExpirationDays ?? '';
  }
);

async function loadOverview() {
  overviewLoading.value = true;
  try {
    overview.value = await api.getAdminOverview();
    setMessage(overviewMessage, 'success', t('messages.adminOverviewLoaded'));
  } catch (error) {
    setMessage(overviewMessage, 'error', getErrorMessage(error));
  } finally {
    overviewLoading.value = false;
  }
}

async function loadVendorComparison() {
  vendorLoading.value = true;
  try {
    vendorComparison.value = await api.getAdminVendorComparison();
    setMessage(vendorMessage, 'success', t('messages.adminVendorComparisonLoaded'));
  } catch (error) {
    setMessage(vendorMessage, 'error', getErrorMessage(error));
  } finally {
    vendorLoading.value = false;
  }
}

async function loadBusinesses() {
  businessListLoading.value = true;
  try {
    businessList.value = await api.getAdminBusinesses(businessSearch.value);
    setMessage(businessListMessage, 'success', t('messages.adminBusinessesLoaded'));
  } catch (error) {
    setMessage(businessListMessage, 'error', getErrorMessage(error));
  } finally {
    businessListLoading.value = false;
  }
}

async function loadBusinessDetail() {
  const id = Number(selectedBusinessId.value);
  if (!id) {
    return;
  }
  businessDetailLoading.value = true;
  try {
    businessDetail.value = await api.getAdminBusiness(id);
    setMessage(businessSaveMessage, 'success', t('messages.adminBusinessLoaded'));
  } catch (error) {
    setMessage(businessSaveMessage, 'error', getErrorMessage(error));
  } finally {
    businessDetailLoading.value = false;
  }
}

async function saveBusiness() {
  const id = businessDetail.value?.id;
  if (!id) {
    return;
  }

  if (!businessForm.name.trim() || !businessForm.ownerPhone.trim() || !businessForm.businessType.trim()) {
    setMessage(businessSaveMessage, 'error', t('messages.adminBusinessRequired'));
    return;
  }

  if (!businessForm.programName.trim() || !businessForm.rewardName.trim() || businessForm.visitThreshold <= 0) {
    setMessage(businessSaveMessage, 'error', t('messages.adminBusinessRequired'));
    return;
  }

  const payload: AdminBusinessUpdate = {
    name: businessForm.name,
    ownerPhone: businessForm.ownerPhone,
    businessType: businessForm.businessType,
    programActive: businessForm.programActive,
    programName: businessForm.programName,
    programDescription: businessForm.programDescription || '',
    rewardName: businessForm.rewardName,
    visitThreshold: businessForm.visitThreshold,
    optionalNote: businessForm.optionalNote || '',
    stampExpirationDays: businessForm.stampExpirationDays === '' ? null : Number(businessForm.stampExpirationDays)
  };

  businessSaveLoading.value = true;
  try {
    businessDetail.value = await api.updateAdminBusiness(id, payload);
    setMessage(businessSaveMessage, 'success', t('messages.adminBusinessSaved'));
  } catch (error) {
    setMessage(businessSaveMessage, 'error', getErrorMessage(error));
  } finally {
    businessSaveLoading.value = false;
  }
}

async function createBusiness() {
  if (!createForm.name.trim()
    || !createForm.ownerPhone.trim()
    || !createForm.businessType.trim()
    || !createForm.programName.trim()
    || !createForm.rewardName.trim()
    || createForm.visitThreshold <= 0) {
    setMessage(createMessage, 'error', t('messages.adminBusinessRequired'));
    return;
  }

  createLoading.value = true;
  try {
    await api.createAdminBusiness({
      name: createForm.name,
      ownerPhone: createForm.ownerPhone,
      businessType: createForm.businessType,
      programName: createForm.programName,
      programDescription: createForm.programDescription,
      rewardName: createForm.rewardName,
      visitThreshold: createForm.visitThreshold,
      optionalNote: createForm.optionalNote,
      stampExpirationDays: createForm.stampExpirationDays === '' ? null : Number(createForm.stampExpirationDays)
    });
    setMessage(createMessage, 'success', t('messages.adminBusinessCreated'));
    await loadBusinesses();
  } catch (error) {
    setMessage(createMessage, 'error', getErrorMessage(error));
  } finally {
    createLoading.value = false;
  }
}

function onSelectBusiness(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  selectedBusinessId.value = value ? Number(value) : '';
  loadBusinessDetail();
}

function backToApp() {
  router.push({ name: 'app' });
}
</script>
