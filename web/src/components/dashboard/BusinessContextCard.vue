<template>
  <section class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Business</h2>
      <span class="chip">Context</span>
    </div>
    <div class="mt-4 space-y-4">
      <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">Active Business</label>
      <select class="input" :value="selectedBusiness" @change="onSelect">
        <option value="">Select a business</option>
        <option v-for="option in businessOptions" :key="option.id" :value="option.id">
          {{ option.name }} ({{ option.role }})
        </option>
      </select>
      <div class="divider"></div>
      <div class="space-y-2 text-sm text-dusk/70">
        <p>Signed in: {{ phoneNumber || 'Unknown' }}</p>
        <p>Role scope: {{ purpose }}</p>
        <p>Owner businesses: {{ ownerCount }}</p>
        <p>Staff businesses: {{ staffCount }}</p>
      </div>
      <button class="btn-ghost w-full" @click="$emit('refresh')">Refresh /me</button>
    </div>
  </section>
</template>

<script setup lang="ts">
type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'Owner' | 'Staff';
};

defineProps<{
  businessOptions: BusinessOption[];
  selectedBusiness: number | '';
  phoneNumber: string;
  purpose: string;
  ownerCount: number;
  staffCount: number;
}>();

const emit = defineEmits<{
  (e: 'update:selectedBusiness', value: number | ''): void;
  (e: 'refresh'): void;
}>();

function onSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  emit('update:selectedBusiness', value ? Number(value) : '');
}
</script>
