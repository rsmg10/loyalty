<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.staffUsers') }}</h2>
      <span class="chip">{{ $t('cards.owner') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.staffUsersDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('forms.staffName')"
        :value="staffUser.displayName"
        @input="$emit('update:displayName', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        :placeholder="$t('forms.username')"
        :value="staffUser.username"
        @input="$emit('update:username', ($event.target as HTMLInputElement).value)"
      />
      <input
        class="input"
        :placeholder="$t('forms.password')"
        :value="staffUser.password"
        type="password"
        autocomplete="new-password"
        @input="$emit('update:password', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-primary w-full" :disabled="loading" @click="$emit('add')">
        {{ loading ? $t('cards.adding') : $t('cards.addStaffUser') }}
      </button>
      <button class="btn-ghost w-full" :disabled="loading" @click="$emit('refresh')">
        {{ $t('cards.refreshStaffUsers') }}
      </button>
      <ul v-if="staffUsers.length" class="space-y-2 text-xs text-dusk/70">
        <li
          v-for="member in staffUsers"
          :key="member.id"
          class="flex flex-col gap-2 rounded-xl border border-white/60 bg-white/70 p-2.5"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold"
                :style="avatarStyle(member.username)"
              >
                {{ initialsFromValue(member.displayName || member.username) }}
              </span>
              <div>
                <p class="font-semibold text-dusk">{{ member.displayName }}</p>
                <p class="text-[11px] text-dusk/70">@{{ member.username }}</p>
              </div>
            </div>
            <span class="chip">{{ member.active ? $t('admin.active') : $t('admin.inactive') }}</span>
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            <button
              class="btn-mini w-full justify-center"
              :disabled="loading"
              @click="$emit('toggleStatus', member.id, !member.active)"
            >
              {{ member.active ? $t('cards.deactivateUser') : $t('cards.activateUser') }}
            </button>
            <button
              class="btn-mini w-full justify-center"
              :disabled="loading"
              @click="$emit('resetPassword', member.id, member.username)"
            >
              {{ $t('cards.resetPassword') }}
            </button>
          </div>
        </li>
      </ul>
      <p v-else-if="!loading" class="rounded-xl bg-dusk/5 px-3 py-2 text-xs text-dusk/70">
        {{ $t('cards.noStaffUsersYet') }}
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
import type { StaffUserResponse } from '../../lib/types';
import { avatarStyle, initialsFromValue } from '../../lib/avatar';

type StaffUserForm = {
  displayName: string;
  username: string;
  password: string;
};

defineProps<{
  staffUser: StaffUserForm;
  staffUsers: StaffUserResponse[];
  loading: boolean;
  message: Message | null;
}>();

defineEmits<{
  (e: 'update:displayName', value: string): void;
  (e: 'update:username', value: string): void;
  (e: 'update:password', value: string): void;
  (e: 'add'): void;
  (e: 'refresh'): void;
  (e: 'toggleStatus', staffId: number, active: boolean): void;
  (e: 'resetPassword', staffId: number, username: string): void;
}>();
</script>
