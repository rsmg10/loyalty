<template>
  <section class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Quick actions</h2>
      <span class="chip">Shortcuts</span>
    </div>
    <div class="mt-4 space-y-2">
      <button class="btn-ghost w-full" @click="$emit('load-staff')" :disabled="staffLoading">
        Load staff
      </button>
      <button
        v-if="isOwner"
        class="btn-ghost w-full"
        @click="$emit('load-redemptions')"
        :disabled="redemptionsLoading"
      >
        Load redemptions
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isOwner: boolean;
  staffLoading: boolean;
  redemptionsLoading: boolean;
}>();

defineEmits<{
  (e: 'load-staff'): void;
  (e: 'load-redemptions'): void;
}>();
</script>
