<template>
  <div class="glass-card animate-rise">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-dusk/60">{{ $t('nav.jumpTo') }}</p>
        <h2 class="section-title">{{ $t('nav.quickActions') }}</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-ghost" @click="$emit('jump', 'front-counter')">{{ $t('dashboard.frontCounter') }}</button>
        <button class="btn-ghost" @click="$emit('open-customer-care')">{{ $t('dashboard.openCustomerCare') }}</button>
        <button v-if="isOwner" class="btn-ghost" @click="$emit('open-operations')">{{ $t('dashboard.openOperations') }}</button>
        <button v-if="isOwner" class="btn-ghost" @click="$emit('open-user-management')">{{ $t('dashboard.openUserManagement') }}</button>
        <button v-if="isOwner" class="btn-ghost" @click="$emit('open-settings')">{{ $t('dashboard.openSettings') }}</button>
        <button v-if="isOwner" class="btn-ghost" @click="$emit('open-reports')">{{ $t('dashboard.openReports') }}</button>
      </div>
    </div>
  </div>
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
