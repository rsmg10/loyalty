<template>
  <section class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('dashboard.business') }}</h2>
      <span class="chip">{{ $t('dashboard.context') }}</span>
    </div>
    <div class="mt-4 space-y-4">
      <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">
        {{ $t('dashboard.activeBusiness') }}
      </label>
      <input
        v-if="lockBusinessSelection"
        class="input"
        type="text"
        :value="selectedBusinessLabel"
        readonly
      />
      <select v-else class="input" :value="selectedBusiness" @change="onSelect">
        <option value="">{{ $t('dashboard.pickBusiness') }}</option>
        <option v-for="option in businessOptions" :key="option.id" :value="option.id">
          {{ option.name }} ({{ roleLabel(option.role) }})
        </option>
      </select>
      <div class="divider"></div>
      <div class="space-y-2 text-sm text-dusk/70">
        <p>{{ $t('dashboard.signedIn') }}: {{ phoneNumber || $t('dashboard.unknown') }}</p>
        <p>{{ $t('dashboard.roleScope') }}: {{ purposeLabel }}</p>
        <p>{{ $t('dashboard.ownerBusinesses') }}: {{ ownerCount }}</p>
        <p>{{ $t('dashboard.staffBusinesses') }}: {{ staffCount }}</p>
      </div>
      <button class="btn-ghost w-full" @click="$emit('refresh')">
        {{ $t('dashboard.refreshMe') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'owner' | 'staff';
};

const props = defineProps<{
  businessOptions: BusinessOption[];
  selectedBusiness: number | '';
  phoneNumber: string;
  purpose: string;
  ownerCount: number;
  staffCount: number;
  lockBusinessSelection: boolean;
}>();

const { t } = useI18n();

const purposeLabel = computed(() => {
  if (props.purpose === 'owner') {
    return t('auth.purposeOwner');
  }
  if (props.purpose === 'staff') {
    return t('auth.purposeStaff');
  }
  if (props.purpose === 'customer') {
    return t('auth.purposeCustomer');
  }
  return props.purpose;
});

const selectedBusinessLabel = computed(() => {
  if (!props.selectedBusiness) {
    return t('dashboard.pickBusiness');
  }

  const selected = props.businessOptions.find((item) => item.id === Number(props.selectedBusiness));
  return selected ? `${selected.name} (${roleLabel(selected.role)})` : t('dashboard.pickBusiness');
});

function roleLabel(role: BusinessOption['role']) {
  if (role === 'owner') {
    return t('auth.purposeOwner');
  }
  if (role === 'staff') {
    return t('auth.purposeStaff');
  }
  return role;
}

const emit = defineEmits<{
  (e: 'update:selectedBusiness', value: number | ''): void;
  (e: 'refresh'): void;
}>();

function onSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emit('update:selectedBusiness', value ? Number(value) : '');
}
</script>
