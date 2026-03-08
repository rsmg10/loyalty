<template>
  <section class="glass-card animate-rise">
    <details open class="group">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <h2 class="section-title">Workspace</h2>
          <p class="mt-1 text-sm text-dusk/70">Jump to a section</p>
        </div>
        <span class="chip group-open:hidden">Expand</span>
        <span class="chip hidden group-open:inline-flex">Collapse</span>
      </summary>
      <div class="mt-4 space-y-2">
        <button
          class="btn-ghost w-full"
          :class="activeSection === 'front-counter' ? 'border-ember/40 text-ember' : ''"
          @click="$emit('jump', 'front-counter')"
        >
          Front counter
        </button>
        <button
          class="btn-ghost w-full"
          :class="activeSection === 'customer-care' ? 'border-ember/40 text-ember' : ''"
          @click="$emit('jump', 'customer-care')"
        >
          Customer care
        </button>
        <button
          v-if="isOwner"
          class="btn-ghost w-full"
          :class="activeSection === 'owner-tools' ? 'border-ember/40 text-ember' : ''"
          @click="$emit('jump', 'owner-tools')"
        >
          Owner tools
        </button>
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isOwner: boolean;
  activeSection: string;
}>();

defineEmits<{
  (e: 'jump', sectionId: string): void;
}>();
</script>
