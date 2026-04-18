<template>
  <section class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('dashboard.flowGuideTitle') }}</h2>
      <span class="chip">{{ $t('dashboard.flowGuideChip') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('dashboard.flowGuideSubtitle') }}</p>

    <ul class="mt-4 space-y-3 text-sm text-dusk/80">
      <li class="rounded-xl border border-white/60 bg-white/70 p-3">
        <p class="font-semibold text-dusk">{{ $t('dashboard.flowOwnerTitle') }}</p>
        <p class="mt-1 text-xs">{{ $t('dashboard.flowOwnerBody') }}</p>
      </li>
      <li class="rounded-xl border border-white/60 bg-white/70 p-3">
        <p class="font-semibold text-dusk">{{ $t('dashboard.flowStaffTitle') }}</p>
        <p class="mt-1 text-xs">{{ $t('dashboard.flowStaffBody') }}</p>
      </li>
      <li class="rounded-xl border border-white/60 bg-white/70 p-3">
        <p class="font-semibold text-dusk">{{ $t('dashboard.flowCustomerTitle') }}</p>
        <p class="mt-1 text-xs">{{ $t('dashboard.flowCustomerBody') }}</p>
      </li>
      <li class="rounded-xl border border-white/60 bg-white/70 p-3">
        <p class="font-semibold text-dusk">{{ $t('dashboard.flowAdminTitle') }}</p>
        <p class="mt-1 text-xs">{{ $t('dashboard.flowAdminBody') }}</p>
      </li>
    </ul>

    <div class="mt-4 flex flex-wrap gap-2">
      <button class="btn-mini" @click="$emit('jump', 'front-counter')">{{ $t('nav.counter') }}</button>
      <button class="btn-mini" @click="$emit('open-customer-care')">{{ $t('nav.customers') }}</button>
      <button v-if="isOwner" class="btn-mini" @click="$emit('open-operations')">{{ $t('nav.operations') }}</button>
      <button v-if="isOwner" class="btn-mini" @click="$emit('open-user-management')">{{ $t('nav.users') }}</button>
      <button v-if="isOwner" class="btn-mini" @click="$emit('open-settings')">{{ $t('nav.settings') }}</button>
      <button v-if="isOwner" class="btn-mini" @click="$emit('open-reports')">{{ $t('nav.reports') }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isOwner: boolean;
}>();

defineEmits<{
  (e: 'jump', sectionId: string): void;
  (e: 'open-customer-care'): void;
  (e: 'open-operations'): void;
  (e: 'open-user-management'): void;
  (e: 'open-settings'): void;
  (e: 'open-reports'): void;
}>();
</script>
