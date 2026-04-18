<template>
  <section class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('nav.quickActions') }}</h2>
      <span class="chip">{{ $t('dashboard.shortcuts') }}</span>
    </div>
    <div class="mt-4 space-y-2">
      <button v-if="isOwner" class="btn-ghost w-full" @click="$emit('open-user-management')">
        {{ $t('dashboard.openUserManagement') }}
      </button>
      <button v-if="isOwner" class="btn-ghost w-full" @click="$emit('open-settings')">
        {{ $t('dashboard.openSettings') }}
      </button>
      <button v-if="isOwner" class="btn-ghost w-full" @click="$emit('open-reports')">
        {{ $t('dashboard.openReports') }}
      </button>
      <button
        v-if="isOwner"
        class="btn-ghost w-full"
        @click="$emit('load-redemptions')"
        :disabled="redemptionsLoading"
      >
        {{ $t('dashboard.loadRedemptions') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isOwner: boolean;
  redemptionsLoading: boolean;
}>();

defineEmits<{
  (e: 'open-user-management'): void;
  (e: 'open-settings'): void;
  (e: 'open-reports'): void;
  (e: 'load-redemptions'): void;
}>();
</script>
