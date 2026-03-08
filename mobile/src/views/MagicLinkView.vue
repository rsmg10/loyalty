<template>
  <section class="card animate-floatUp space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-xl text-dusk">{{ $t('magic.title') }}</h2>
      <span class="badge">{{ $t('app.customerWallet') }}</span>
    </div>
    <p class="text-sm text-dusk/70">{{ $t('magic.detail') }}</p>

    <div class="space-y-3">
      <p v-if="loading" class="text-sm font-semibold text-coral">{{ $t('magic.loading') }}</p>
      <p v-else-if="error" class="text-sm font-semibold text-coral">{{ error }}</p>
      <div v-else class="rounded-xl bg-cream/70 p-4 text-sm text-dusk">
        <p class="font-semibold">{{ $t('magic.ready') }}</p>
        <p v-if="businessName" class="text-dusk/70">{{ businessName }}</p>
      </div>

      <button class="btn-primary" :disabled="loading" @click="continueToApp">
        {{ $t('magic.continue') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerApi } from '../composables/useCustomerApi';
import { usePreferencesStore } from '../stores/preferences';
import { useSessionStore } from '../stores/session';
import { getErrorMessage } from '../lib/errors';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const session = useSessionStore();
const preferences = usePreferencesStore();
const customerApi = useCustomerApi(session.token);

const loading = ref(false);
const error = ref<string | null>(null);
const businessName = ref<string | null>(null);

onMounted(async () => {
  const token = String(route.query.token || '').trim();
  if (!token) {
    error.value = t('magic.invalid');
    return;
  }

  loading.value = true;
  try {
    const data = await customerApi.resolveMagicLink(token);
    preferences.setBusinessId(String(data.businessId));
    businessName.value = data.businessName;
  } catch (err) {
    error.value = getErrorMessage(err) || t('magic.invalid');
  } finally {
    loading.value = false;
  }
});

function continueToApp() {
  if (session.isAuthenticated) {
    router.push({ name: 'wallet' });
  } else {
    router.push({ name: 'login' });
  }
}
</script>
