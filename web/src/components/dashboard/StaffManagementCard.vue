<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.staffManagement') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.staffDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('forms.staffName')"
        :value="staff.displayName"
        @input="$emit('update:displayName', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        :placeholder="$t('forms.staffPhone')"
        :value="staff.phoneNumber"
        @input="$emit('update:phoneNumber', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('add')">
        {{ loading ? $t('cards.adding') : $t('cards.addStaff') }}
      </button>
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ $t('cards.refreshStaff') }}
      </button>
      <ul v-if="staffList.length" class="space-y-2 text-xs text-dusk/70">
        <li
          v-for="member in staffList"
          :key="member.id"
          class="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 p-2.5"
        >
          <div class="flex items-center gap-2.5">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold"
              :style="avatarStyle(member.phoneNumber)"
            >
              {{ initialsFromValue(member.displayName || member.phoneNumber) }}
            </span>
            <div>
              <p class="font-semibold text-dusk">{{ member.displayName }}</p>
              <p class="text-[11px] text-dusk/70">{{ member.phoneNumber }}</p>
            </div>
          </div>
          <span class="chip">{{ member.active ? $t('admin.active') : $t('admin.inactive') }}</span>
        </li>
      </ul>
      <p v-else-if="!loading" class="rounded-xl bg-dusk/5 px-3 py-2 text-xs text-dusk/70">
        {{ $t('cards.noStaffYet') }}
      </p>
      <p v-if="message" :class="messageClass(message.tone)">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { messageClass } from '../../lib/messages';
import type { Message } from '../../lib/messages';
import type { StaffResponse } from '../../lib/types';
import { avatarStyle, initialsFromValue } from '../../lib/avatar';

type StaffForm = {
  displayName: string;
  phoneNumber: string;
};

defineProps<{
  staff: StaffForm;
  staffList: StaffResponse[];
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:displayName', value: string): void;
  (e: 'update:phoneNumber', value: string): void;
  (e: 'add'): void;
  (e: 'refresh'): void;
}>();
</script>
