<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">{{ $t('cards.customerLookup') }}</h2>
      <span class="chip">{{ $t('cards.status') }}</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">{{ $t('cards.lookupDescription') }}</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        :placeholder="$t('forms.customerPhone')"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-ink w-full" :disabled="loading" @click="$emit('fetch')">
        {{ loading ? $t('cards.loading') : $t('cards.loadStatus') }}
      </button>
      <div v-if="result" class="rounded-xl bg-white/70 p-3 text-sm">
        <div class="flex items-center gap-3">
          <img
            v-if="result.programIconUrl"
            :src="result.programIconUrl"
            alt="Program icon"
            class="h-12 w-12 rounded-xl border border-white/70 object-cover"
          />
          <span
            v-else
            class="inline-flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-semibold"
            :style="avatarStyle(result.businessName)"
          >
            {{ initialsFromValue(result.businessName, 'BP') }}
          </span>
          <p class="font-semibold">{{ result.businessName }}</p>
        </div>
        <p class="text-dusk/70">{{ $t('cards.program') }}: {{ result.programName }}</p>
        <p v-if="result.programDescription" class="text-dusk/70">
          {{ result.programDescription }}
        </p>
        <p class="text-dusk/70">{{ $t('cards.reward') }}: {{ result.rewardName }}</p>
        <img
          v-if="result.rewardImageUrl"
          :src="result.rewardImageUrl"
          alt="Reward"
          class="mt-2 h-24 w-full rounded-2xl object-cover"
        />
        <p class="text-dusk/70">
          {{ result.visitCount }} / {{ result.visitThreshold }} {{ $t('cards.stamps') }}
        </p>
        <p v-if="result.optionalNote" class="text-dusk/70">
          {{ $t('cards.note') }}: {{ result.optionalNote }}
        </p>
        <p v-if="result.stampExpirationDays" class="text-dusk/70">
          {{ $t('cards.stampExpiration') }}: {{ result.stampExpirationDays }}
        </p>
        <p v-if="result.lastStampAt" class="text-dusk/70">
          {{ $t('cards.lastStamp') }}: {{ new Date(result.lastStampAt).toLocaleString() }}
        </p>
        <p v-if="result.rewardAvailableAt" class="text-dusk/70">
          {{ $t('cards.rewardAvailableSince') }}: {{ new Date(result.rewardAvailableAt).toLocaleString() }}
        </p>
      </div>
      <button class="btn-ghost w-full" :disabled="historyLoading" @click="$emit('fetch-history')">
        {{ historyLoading ? $t('cards.loadingHistory') : $t('cards.loadVisitHistory') }}
      </button>
      <ul v-if="visitHistory.length" class="space-y-2 text-xs text-dusk/70">
        <li
          v-for="item in visitHistory"
          :key="item.createdAt"
          class="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 p-2.5"
        >
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold"
            :style="avatarStyle(item.reason || String(item.quantity))"
          >
            {{ initialsFromValue(item.reason || 'visit', 'VT') }}
          </span>
          <div>
            <p class="text-[11px] text-dusk">{{ new Date(item.createdAt).toLocaleString() }}</p>
            <p class="text-[11px] text-dusk/70">
              {{ item.quantity }} stamp(s)
              <span v-if="item.reason">· {{ item.reason }}</span>
            </p>
          </div>
        </li>
      </ul>
      <p v-else-if="!historyLoading" class="rounded-xl bg-dusk/5 px-3 py-2 text-xs text-dusk/70">
        {{ $t('cards.noVisitHistoryYet') }}
      </p>
      <button class="btn-ghost w-full" :disabled="stampHistoryLoading" @click="$emit('fetch-stamps')">
        {{ stampHistoryLoading ? $t('cards.loadingStamps') : $t('cards.loadStampHistory') }}
      </button>
      <ul v-if="stampHistory.length" class="space-y-2 text-xs text-dusk/70">
        <li
          v-for="item in stampHistory"
          :key="item.id"
          class="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 p-2.5"
        >
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold"
            :style="avatarStyle(item.issuedByPhone)"
          >
            {{ initialsFromValue(item.issuedByPhone, 'ST') }}
          </span>
          <div>
            <p class="text-[11px] text-dusk">{{ new Date(item.issuedAt).toLocaleString() }}</p>
            <p class="text-[11px] text-dusk/70">
              {{ item.quantity }} stamp(s) · {{ item.reason }} · {{ item.issuedByPhone }}
            </p>
          </div>
        </li>
      </ul>
      <p v-else-if="!stampHistoryLoading" class="rounded-xl bg-dusk/5 px-3 py-2 text-xs text-dusk/70">
        {{ $t('cards.noStampHistoryYet') }}
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
import type { CustomerStatusResponse, StampTransactionItem, VisitHistoryItem } from '../../lib/types';
import { avatarStyle, initialsFromValue } from '../../lib/avatar';

defineProps<{
  phone: string;
  loading: boolean;
  result: CustomerStatusResponse | null;
  message: Message | null;
  visitHistory: VisitHistoryItem[];
  historyLoading: boolean;
  stampHistory: StampTransactionItem[];
  stampHistoryLoading: boolean;
}>();

defineEmits<{
  (e: 'update:phone', value: string): void;
  (e: 'fetch'): void;
  (e: 'fetch-history'): void;
  (e: 'fetch-stamps'): void;
}>();
</script>
