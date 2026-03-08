<template>
  <div class="glass-card animate-rise">
    <div class="flex items-center justify-between">
      <h2 class="section-title">Customer lookup</h2>
      <span class="chip">Status</span>
    </div>
    <p class="mt-2 text-sm text-dusk/70">Look up current progress and optional notes.</p>
    <div class="mt-4 space-y-3">
      <input
        class="input"
        placeholder="Customer phone"
        :value="phone"
        @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
      />
      <button class="btn-ink w-full" :disabled="loading" @click="$emit('fetch')">
        {{ loading ? 'Loading...' : 'Load status' }}
      </button>
      <div v-if="result" class="rounded-xl bg-white/70 p-3 text-sm">
        <p class="font-semibold">{{ result.businessName }}</p>
        <p class="text-dusk/70">Program: {{ result.programName }}</p>
        <p v-if="result.programDescription" class="text-dusk/70">
          {{ result.programDescription }}
        </p>
        <img
          v-if="result.programIconUrl"
          :src="result.programIconUrl"
          alt="Program icon"
          class="mt-2 h-14 w-14 rounded-xl object-cover"
        />
        <p class="text-dusk/70">Reward: {{ result.rewardName }}</p>
        <img
          v-if="result.rewardImageUrl"
          :src="result.rewardImageUrl"
          alt="Reward"
          class="mt-2 h-24 w-full rounded-2xl object-cover"
        />
        <p class="text-dusk/70">
          Progress: {{ result.visitCount }} / {{ result.visitThreshold }} stamps
        </p>
        <p v-if="result.optionalNote" class="text-dusk/70">
          Note: {{ result.optionalNote }}
        </p>
        <p v-if="result.stampExpirationDays" class="text-dusk/70">
          Stamp expiration: {{ result.stampExpirationDays }} days
        </p>
        <p v-if="result.lastStampAt" class="text-dusk/70">
          Last stamp: {{ new Date(result.lastStampAt).toLocaleString() }}
        </p>
        <p v-if="result.rewardAvailableAt" class="text-dusk/70">
          Reward available since: {{ new Date(result.rewardAvailableAt).toLocaleString() }}
        </p>
      </div>
      <button class="btn-ghost w-full" :disabled="historyLoading" @click="$emit('fetch-history')">
        {{ historyLoading ? 'Loading history...' : 'Load visit history' }}
      </button>
      <ul v-if="visitHistory.length" class="space-y-2 text-xs text-dusk/70">
        <li v-for="item in visitHistory" :key="item.createdAt">
          {{ new Date(item.createdAt).toLocaleString() }} · {{ item.quantity }} stamp(s)
          <span v-if="item.reason">· {{ item.reason }}</span>
        </li>
      </ul>
      <button class="btn-ghost w-full" :disabled="stampHistoryLoading" @click="$emit('fetch-stamps')">
        {{ stampHistoryLoading ? 'Loading stamps...' : 'Load stamp history' }}
      </button>
      <ul v-if="stampHistory.length" class="space-y-2 text-xs text-dusk/70">
        <li v-for="item in stampHistory" :key="item.id">
          {{ new Date(item.issuedAt).toLocaleString() }} · {{ item.quantity }} stamp(s) ·
          {{ item.reason }} · {{ item.issuedByPhone }}
        </li>
      </ul>
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
