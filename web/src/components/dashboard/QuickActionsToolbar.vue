<template>
  <div class="glass-card animate-rise">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-dusk/60">Jump to</p>
        <h2 class="section-title">Quick actions</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-ghost" @click="$emit('jump', 'front-counter')">Front counter</button>
        <button class="btn-ghost" @click="$emit('jump', 'customer-care')">Customer care</button>
        <button v-if="isOwner" class="btn-ghost" @click="$emit('jump', 'owner-tools')">Owner tools</button>
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
