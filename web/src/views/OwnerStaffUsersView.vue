<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[280px_1fr]">
    <section v-if="!ownerBusinessOptions.length" class="glass-card animate-rise lg:col-span-2">
      <h2 class="section-title">{{ $t('ownerUsers.ownerOnlyTitle') }}</h2>
      <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerUsers.ownerOnlyHint') }}</p>
      <button class="btn-primary mt-4" @click="backToDashboard">
        {{ $t('ownerUsers.backToDashboard') }}
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
          <h2 class="section-title">{{ $t('ownerUsers.title') }}</h2>
          <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerUsers.sidebarHint') }}</p>
          <button class="btn-ghost mt-4 w-full" @click="backToDashboard">
            {{ $t('ownerUsers.backToDashboard') }}
          </button>
        </section>
      </aside>

      <section class="space-y-6">
        <section class="glass-card animate-rise">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="section-title">{{ $t('ownerUsers.title') }}</h2>
              <p class="mt-2 text-sm text-dusk/70">{{ $t('ownerUsers.description') }}</p>
            </div>
            <span class="chip">{{ activeBusiness?.name || $t('dashboard.pickBusiness') }}</span>
          </div>
        </section>

        <StaffUsersManagementCard
          :staff-user="staffUser"
          :staff-users="staffUsers"
          :loading="staffLoading"
          :message="staffMessage"
          @update:display-name="(value) => (staffUser.displayName = value)"
          @update:username="(value) => (staffUser.username = value)"
          @update:password="(value) => (staffUser.password = value)"
          @add="addStaff"
          @refresh="loadStaff"
          @toggle-status="setStaffUserStatus"
          @reset-password="promptStaffUserPasswordReset"
        />
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { useLoyaltyApi } from '../composables/useLoyaltyApi';
import { getErrorMessage } from '../lib/errors';
import { setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import type { StaffUserResponse } from '../lib/types';
import BusinessContextCard from '../components/dashboard/BusinessContextCard.vue';
import StaffUsersManagementCard from '../components/dashboard/StaffUsersManagementCard.vue';

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

const staffUser = reactive({
  displayName: '',
  username: '',
  password: ''
});
const staffUsers = ref<StaffUserResponse[]>([]);
const staffLoading = ref(false);
const staffMessage = ref<Message | null>(null);

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
    staffUsers.value = [];
    staffMessage.value = null;
    if (value) {
      await loadStaff();
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
    setMessage(staffMessage, 'error', getErrorMessage(error));
  }
}

async function addStaff() {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  if (!staffUser.displayName.trim() || !staffUser.username.trim() || !staffUser.password.trim()) {
    setMessage(staffMessage, 'error', t('messages.staffUserRequired'));
    return;
  }
  staffLoading.value = true;
  try {
    await api.value.addStaffUser(activeBusiness.value.id, {
      displayName: staffUser.displayName,
      username: staffUser.username,
      password: staffUser.password
    });
    staffUser.displayName = '';
    staffUser.username = '';
    staffUser.password = '';
    setMessage(staffMessage, 'success', t('messages.staffUserAdded'));
    await loadStaff();
  } catch (error) {
    setMessage(staffMessage, 'error', getErrorMessage(error));
  } finally {
    staffLoading.value = false;
  }
}

async function loadStaff() {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  staffLoading.value = true;
  try {
    staffUsers.value = await api.value.getStaffUsers(activeBusiness.value.id);
    setMessage(staffMessage, 'success', t('messages.staffUsersRefreshed'));
  } catch (error) {
    setMessage(staffMessage, 'error', getErrorMessage(error));
  } finally {
    staffLoading.value = false;
  }
}

async function setStaffUserStatus(staffId: number, active: boolean) {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', t('messages.selectBusiness'));
    return;
  }
  staffLoading.value = true;
  try {
    await api.value.setStaffUserStatus(activeBusiness.value.id, staffId, active);
    setMessage(staffMessage, 'success', active ? t('messages.staffUserActivated') : t('messages.staffUserDeactivated'));
    await loadStaff();
  } catch (error) {
    setMessage(staffMessage, 'error', getErrorMessage(error));
  } finally {
    staffLoading.value = false;
  }
}

async function promptStaffUserPasswordReset(staffId: number, username: string) {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', t('messages.selectBusiness'));
    return;
  }

  const nextPassword = window.prompt(t('messages.staffPasswordPrompt', { username }), '');
  if (!nextPassword?.trim()) {
    return;
  }

  staffLoading.value = true;
  try {
    await api.value.resetStaffUserPassword(activeBusiness.value.id, staffId, nextPassword.trim());
    setMessage(staffMessage, 'success', t('messages.staffPasswordReset'));
  } catch (error) {
    setMessage(staffMessage, 'error', getErrorMessage(error));
  } finally {
    staffLoading.value = false;
  }
}

function backToDashboard() {
  router.push({ name: 'app' });
}
</script>
