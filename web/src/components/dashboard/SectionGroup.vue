<template>
  <section :id="sectionId" class="glass-card animate-rise">
    <details :open="defaultOpen" class="group">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <h3 class="section-title">{{ title }}</h3>
          <p v-if="subtitle" class="mt-1 text-sm text-dusk/70">
            {{ subtitle }}
          </p>
        </div>
        <span class="chip group-open:hidden">{{ $t('nav.expand') }}</span>
        <span class="chip hidden group-open:inline-flex">{{ $t('nav.collapse') }}</span>
      </summary>
      <div class="mt-4 grid gap-6 lg:grid-cols-2">
        <slot />
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  sectionId: string;
  defaultOpen?: boolean;
}>();
</script>
