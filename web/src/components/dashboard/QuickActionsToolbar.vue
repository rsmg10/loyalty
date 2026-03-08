<template>
  <div class="glass-card animate-rise">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-dusk/60">{{ $t('nav.jumpTo') }}</p>
        <h2 class="section-title">{{ $t('nav.quickActions') }}</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-ghost" @click="$emit('jump', 'front-counter')">{{ $t('dashboard.frontCounter') }}</button>
        <button class="btn-ghost" @click="$emit('jump', 'customer-care')">{{ $t('dashboard.customerCare') }}</button>
        <button v-if="isOwner" class="btn-ghost" @click="$emit('jump', 'owner-tools')">{{ $t('dashboard.ownerTools') }}</button>
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
}>();
</script>
