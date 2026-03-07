<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[280px_1fr]">
    <aside class="flex flex-col gap-6">
      <section class="glass-card animate-rise">
        <div class="flex items-center justify-between">
          <h2 class="section-title">Business</h2>
          <span class="chip">Context</span>
        </div>
        <div class="mt-4 space-y-4">
          <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">Active Business</label>
          <select v-model="selectedBusiness" class="input">
            <option value="">Select a business</option>
            <option v-for="option in businessOptions" :key="option.id" :value="option.id">
              {{ option.name }} ({{ option.role }})
            </option>
          </select>
          <div class="divider"></div>
          <div class="space-y-2 text-sm text-dusk/70">
            <p>Signed in: {{ session.phoneNumber || 'Unknown' }}</p>
            <p>Role scope: {{ session.purpose }}</p>
            <p>Owner businesses: {{ session.ownerBusinesses.length }}</p>
            <p>Staff businesses: {{ session.staffBusinesses.length }}</p>
          </div>
          <button class="btn-ghost w-full" @click="refreshMe">Refresh /me</button>
        </div>
      </section>

      <section v-if="activeBusiness" class="glass-card animate-rise">
        <div class="flex items-center justify-between">
          <h2 class="section-title">Quick actions</h2>
          <span class="chip">Shortcuts</span>
        </div>
        <div class="mt-4 space-y-2">
          <button class="btn-ghost w-full" @click="loadStaff" :disabled="staffLoading">Load staff</button>
          <button
            v-if="isOwner"
            class="btn-ghost w-full"
            @click="loadRedemptions"
            :disabled="redemptionsLoading"
          >
            Load redemptions
          </button>
        </div>
      </section>
    </aside>

    <section class="flex flex-col gap-6">
      <section v-if="!activeBusiness" class="glass-card animate-rise">
        <h2 class="section-title">Pick a business</h2>
        <p class="mt-2 text-sm text-dusk/70">
          Use the selector on the left to choose where you are operating right now.
        </p>
      </section>

      <section v-else class="grid gap-6 lg:grid-cols-2">
        <div class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Visit entry</h2>
            <span class="chip">Live</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">
            Record a purchase stamp from a customer visit. Cooldown and reward state are enforced server-side.
          </p>
          <div class="mt-4 space-y-3">
            <input v-model="visit.phone" class="input" placeholder="Customer phone" />
            <button class="btn-primary w-full" :disabled="visitLoading" @click="recordVisit">
              {{ visitLoading ? 'Recording...' : 'Record visit' }}
            </button>
            <div v-if="visitResult" class="rounded-xl bg-sand/70 p-3 text-sm">
              <p class="font-semibold">
                {{ visitResult.rewardAvailable ? 'Reward available' : 'Progress updated' }}
              </p>
              <p class="text-dusk/70">
                {{ visitResult.visitCount }} / {{ visitResult.visitThreshold }} stamps
              </p>
              <p class="text-dusk/70">Reward: {{ visitResult.rewardName }}</p>
            </div>
            <p v-if="visitMessage" :class="messageClass(visitMessage.tone)">
              {{ visitMessage.text }}
            </p>
          </div>
        </div>

        <div class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Stamp issuance</h2>
            <span class="chip">Audit</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">
            Issue one or more stamps with a required reason.
          </p>
          <div class="mt-4 space-y-3">
            <input v-model="stampIssue.phone" class="input" placeholder="Customer phone" />
            <input
              v-model.number="stampIssue.quantity"
              class="input"
              type="number"
              min="1"
              placeholder="Quantity"
            />
            <input v-model="stampIssue.reason" class="input" placeholder="Reason (purchase, adjustment)" />
            <button class="btn-primary w-full" :disabled="stampIssueLoading" @click="issueStamps">
              {{ stampIssueLoading ? 'Issuing...' : 'Issue stamps' }}
            </button>
            <div v-if="stampIssueResult" class="rounded-xl bg-sand/70 p-3 text-sm">
              <p class="font-semibold">
                {{ stampIssueResult.rewardAvailable ? 'Reward available' : 'Stamps issued' }}
              </p>
              <p class="text-dusk/70">
                {{ stampIssueResult.stampCount }} / {{ stampIssueResult.stampThreshold }} stamps
              </p>
              <p class="text-dusk/70">Reward: {{ stampIssueResult.rewardDescription }}</p>
            </div>
            <p v-if="stampIssueMessage" :class="messageClass(stampIssueMessage.tone)">
              {{ stampIssueMessage.text }}
            </p>
          </div>
        </div>

        <div class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Redemption</h2>
            <span class="chip">Counter</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">
            Redeem a reward once the customer has reached the threshold.
          </p>
          <div class="mt-4 space-y-3">
            <input v-model="redeem.phone" class="input" placeholder="Customer phone" />
            <button class="btn-primary w-full" :disabled="redeemLoading" @click="redeemReward">
              {{ redeemLoading ? 'Redeeming...' : 'Redeem reward' }}
            </button>
            <div v-if="redeemResult" class="rounded-xl bg-sand/70 p-3 text-sm">
              <p class="font-semibold">Reward redeemed</p>
              <p class="text-dusk/70">{{ redeemResult.rewardName }}</p>
              <p v-if="redeemResult.redeemedByPhone" class="text-dusk/70">
                Redeemed by: {{ redeemResult.redeemedByPhone }}
              </p>
            </div>
            <p v-if="redeemMessage" :class="messageClass(redeemMessage.tone)">
              {{ redeemMessage.text }}
            </p>
          </div>
        </div>

        <div class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Customer lookup</h2>
            <span class="chip">Status</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">Look up current progress and optional notes.</p>
          <div class="mt-4 space-y-3">
            <input v-model="lookup.phone" class="input" placeholder="Customer phone" />
            <button class="btn-ink w-full" :disabled="lookupLoading" @click="fetchCustomer">
              {{ lookupLoading ? 'Loading...' : 'Load status' }}
            </button>
            <div v-if="lookupResult" class="rounded-xl bg-white/70 p-3 text-sm">
              <p class="font-semibold">{{ lookupResult.businessName }}</p>
              <p class="text-dusk/70">Program: {{ lookupResult.programName }}</p>
              <p v-if="lookupResult.programDescription" class="text-dusk/70">
                {{ lookupResult.programDescription }}
              </p>
              <img
                v-if="lookupResult.programIconUrl"
                :src="lookupResult.programIconUrl"
                alt="Program icon"
                class="mt-2 h-14 w-14 rounded-xl object-cover"
              />
              <p class="text-dusk/70">Reward: {{ lookupResult.rewardName }}</p>
              <img
                v-if="lookupResult.rewardImageUrl"
                :src="lookupResult.rewardImageUrl"
                alt="Reward"
                class="mt-2 h-24 w-full rounded-2xl object-cover"
              />
              <p class="text-dusk/70">
                Progress: {{ lookupResult.visitCount }} / {{ lookupResult.visitThreshold }} stamps
              </p>
              <p v-if="lookupResult.optionalNote" class="text-dusk/70">
                Note: {{ lookupResult.optionalNote }}
              </p>
              <p v-if="lookupResult.stampExpirationDays" class="text-dusk/70">
                Stamp expiration: {{ lookupResult.stampExpirationDays }} days
              </p>
              <p v-if="lookupResult.lastStampAt" class="text-dusk/70">
                Last stamp: {{ new Date(lookupResult.lastStampAt).toLocaleString() }}
              </p>
              <p v-if="lookupResult.rewardAvailableAt" class="text-dusk/70">
                Reward available since: {{ new Date(lookupResult.rewardAvailableAt).toLocaleString() }}
              </p>
            </div>
            <button class="btn-ghost w-full" :disabled="historyLoading" @click="fetchHistory">
              {{ historyLoading ? 'Loading history...' : 'Load visit history' }}
            </button>
            <ul v-if="visitHistory.length" class="space-y-2 text-xs text-dusk/70">
              <li v-for="item in visitHistory" :key="item.createdAt">
                {{ new Date(item.createdAt).toLocaleString() }} · {{ item.quantity }} stamp(s)
                <span v-if="item.reason">· {{ item.reason }}</span>
              </li>
            </ul>
            <button class="btn-ghost w-full" :disabled="stampHistoryLoading" @click="fetchStampHistory">
              {{ stampHistoryLoading ? 'Loading stamps...' : 'Load stamp history' }}
            </button>
            <ul v-if="stampHistory.length" class="space-y-2 text-xs text-dusk/70">
              <li v-for="item in stampHistory" :key="item.id">
                {{ new Date(item.issuedAt).toLocaleString() }} · {{ item.quantity }} stamp(s) ·
                {{ item.reason }} · {{ item.issuedByPhone }}
              </li>
            </ul>
            <p v-if="lookupMessage" :class="messageClass(lookupMessage.tone)">
              {{ lookupMessage.text }}
            </p>
          </div>
        </div>

        <div class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Customer profile</h2>
            <span class="chip">Context</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">Update name, mobile, and notes for staff context.</p>
          <div class="mt-4 space-y-3">
            <input v-model="profile.phone" class="input" placeholder="Customer phone" />
            <input v-model="profile.displayName" class="input" placeholder="Display name" />
            <input v-model="profile.mobileNumber" class="input" placeholder="Optional mobile" />
            <input v-model="profile.usualOrder" class="input" placeholder="Usual order" />
            <textarea v-model="profile.notes" class="textarea" placeholder="Notes"></textarea>
            <button class="btn-primary w-full" :disabled="profileLoading" @click="updateProfile">
              {{ profileLoading ? 'Saving...' : 'Save profile' }}
            </button>
            <p v-if="profileMessage" :class="messageClass(profileMessage.tone)">
              {{ profileMessage.text }}
            </p>
          </div>
        </div>

        <div class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Membership join</h2>
            <span class="chip">Enroll</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">
            Create a loyalty membership for a customer without issuing stamps.
          </p>
          <div class="mt-4 space-y-3">
            <input v-model="membership.phone" class="input" placeholder="Customer phone" />
            <button class="btn-primary w-full" :disabled="membershipLoading" @click="createMembership">
              {{ membershipLoading ? 'Creating...' : 'Create membership' }}
            </button>
            <p v-if="membershipMessage" :class="messageClass(membershipMessage.tone)">
              {{ membershipMessage.text }}
            </p>
          </div>
        </div>

        <div v-if="isOwner" class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Loyalty config</h2>
            <span class="chip">Owner</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">Update the active reward for new cycles.</p>
          <div class="mt-4 space-y-3">
            <input v-model="loyaltyConfig.programName" class="input" placeholder="Program name" />
            <textarea
              v-model="loyaltyConfig.programDescription"
              class="textarea"
              placeholder="Program description"
            ></textarea>
            <div class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">Program icon</label>
              <input
                class="input"
                type="file"
                accept="image/*"
                @change="onProgramIconChange"
              />
              <button class="btn-ghost w-full" :disabled="loyaltyLoading" @click="uploadProgramIcon">
                Upload program icon
              </button>
              <img
                v-if="loyaltyConfig.programIconUrl"
                :src="loyaltyConfig.programIconUrl"
                alt="Program icon"
                class="h-20 w-20 rounded-2xl object-cover"
              />
            </div>
            <input v-model="loyaltyConfig.rewardName" class="input" placeholder="Reward name" />
            <input
              v-model.number="loyaltyConfig.visitThreshold"
              class="input"
              type="number"
              min="1"
            />
            <div class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-wide text-dusk/70">Reward image</label>
              <input
                class="input"
                type="file"
                accept="image/*"
                @change="onRewardImageChange"
              />
              <button class="btn-ghost w-full" :disabled="loyaltyLoading" @click="uploadRewardImage">
                Upload reward image
              </button>
              <img
                v-if="loyaltyConfig.rewardImageUrl"
                :src="loyaltyConfig.rewardImageUrl"
                alt="Reward image"
                class="h-24 w-full rounded-2xl object-cover"
              />
            </div>
            <textarea
              v-model="loyaltyConfig.optionalNote"
              class="textarea"
              placeholder="Optional note"
            ></textarea>
            <input
              v-model="loyaltyConfig.stampExpirationDays"
              class="input"
              type="number"
              min="1"
              placeholder="Stamp expiration days (optional)"
            />
            <div class="flex flex-col gap-2 sm:flex-row">
              <button class="btn-primary w-full" :disabled="loyaltyLoading" @click="saveLoyaltyConfig">
                {{ loyaltyLoading ? 'Saving...' : 'Save config' }}
              </button>
              <button class="btn-ghost w-full" :disabled="loyaltyLoading" @click="loadLoyaltyConfig">
                Refresh config
              </button>
            </div>
            <p v-if="loyaltyMessage" :class="messageClass(loyaltyMessage.tone)">
              {{ loyaltyMessage.text }}
            </p>
          </div>
        </div>

        <div v-if="isOwner" class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Staff management</h2>
            <span class="chip">Owner</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">Add staff and keep phone numbers aligned.</p>
          <div class="mt-4 space-y-3">
            <input v-model="staff.displayName" class="input" placeholder="Staff name" />
            <input v-model="staff.phoneNumber" class="input" placeholder="Staff phone" />
            <button class="btn-primary w-full" :disabled="staffLoading" @click="addStaff">
              {{ staffLoading ? 'Adding...' : 'Add staff' }}
            </button>
            <button class="btn-ghost w-full" :disabled="staffLoading" @click="loadStaff">
              Refresh staff list
            </button>
            <ul v-if="staffList.length" class="space-y-2 text-xs text-dusk/70">
              <li v-for="member in staffList" :key="member.id">
                {{ member.displayName }} · {{ member.phoneNumber }}
              </li>
            </ul>
            <p v-if="staffMessage" :class="messageClass(staffMessage.tone)">
              {{ staffMessage.text }}
            </p>
          </div>
        </div>

        <div v-if="isOwner" class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Redemptions</h2>
            <span class="chip">Owner</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">Track recent reward usage.</p>
          <div class="mt-4 space-y-3">
            <button class="btn-ghost w-full" :disabled="redemptionsLoading" @click="loadRedemptions">
              {{ redemptionsLoading ? 'Loading...' : 'Load redemptions' }}
            </button>
            <ul v-if="redemptions.length" class="space-y-2 text-xs text-dusk/70">
              <li v-for="entry in redemptions" :key="entry.id">
                {{ entry.rewardName }} · {{ new Date(entry.redeemedAt).toLocaleString() }}
                <span v-if="entry.redeemedByPhone"> · {{ entry.redeemedByPhone }}</span>
              </li>
            </ul>
            <p v-if="redemptionsMessage" :class="messageClass(redemptionsMessage.tone)">
              {{ redemptionsMessage.text }}
            </p>
          </div>
        </div>

        <div v-if="isOwner" class="glass-card animate-rise">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Business stats</h2>
            <span class="chip">Owner</span>
          </div>
          <p class="mt-2 text-sm text-dusk/70">Quick loyalty totals for this business.</p>
          <div class="mt-4 space-y-3">
            <button class="btn-ghost w-full" :disabled="statsLoading" @click="loadStats">
              {{ statsLoading ? 'Loading...' : 'Load stats' }}
            </button>
            <div v-if="stats" class="rounded-xl bg-white/70 p-3 text-sm text-dusk/80">
              <p>Enrolled customers: {{ stats.enrolledCustomers }}</p>
              <p>Stamps issued: {{ stats.stampsIssued }}</p>
              <p>Rewards redeemed: {{ stats.rewardsRedeemed }}</p>
            </div>
            <p v-if="statsMessage" :class="messageClass(statsMessage.tone)">
              {{ statsMessage.text }}
            </p>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { apiGet, apiPost, apiPostForm, apiPut } from '../lib/api';
import { messageClass, setMessage } from '../lib/messages';
import type { Message } from '../lib/messages';
import { useSessionStore } from '../stores/session';

type CustomerResponse = {
  id: number;
  phoneNumber: string;
  mobileNumber?: string | null;
  displayName?: string | null;
  usualOrder?: string | null;
  notes?: string | null;
};

type VisitResponse = {
  customer: CustomerResponse;
  visitCount: number;
  visitThreshold: number;
  rewardAvailable: boolean;
  rewardName: string;
};

type RedemptionResponse = {
  rewardName: string;
  redeemedAt: string;
  visitCount: number;
  redeemedByPhone?: string | null;
};

type CustomerStatusResponse = {
  businessName: string;
  programName: string;
  programDescription?: string | null;
  programIconUrl?: string | null;
  rewardName: string;
  rewardImageUrl?: string | null;
  visitCount: number;
  visitThreshold: number;
  optionalNote?: string | null;
  stampExpirationDays?: number | null;
  rewardAvailableAt?: string | null;
  lastStampAt?: string | null;
};

type VisitHistoryItem = {
  createdAt: string;
  quantity: number;
  reason?: string | null;
};

type StaffResponse = {
  id: number;
  displayName: string;
  phoneNumber: string;
  active: boolean;
  createdAt: string;
};

type RedemptionSummary = {
  id: number;
  customerId: number;
  rewardName: string;
  redeemedAt: string;
  staffId?: number | null;
  redeemedByPhone?: string | null;
};

type BusinessDetailResponse = {
  programName: string;
  programDescription?: string | null;
  programIconUrl?: string | null;
  rewardName: string;
  rewardImageUrl?: string | null;
  visitThreshold: number;
  optionalNote?: string | null;
  stampExpirationDays?: number | null;
};

type StampIssueResponse = {
  customer: CustomerResponse;
  stampCount: number;
  stampThreshold: number;
  rewardAvailable: boolean;
  rewardDescription: string;
  rewardAvailableAt?: string | null;
  lastStampAt?: string | null;
};

type StampTransactionItem = {
  id: number;
  quantity: number;
  reason: string;
  issuedAt: string;
  issuedByPhone: string;
  staffId?: number | null;
};

type BusinessStatsResponse = {
  enrolledCustomers: number;
  stampsIssued: number;
  rewardsRedeemed: number;
};

type LoyaltyMediaResponse = {
  kind: string;
  url: string;
};

type BusinessOption = {
  id: number;
  name: string;
  businessType: string;
  role: 'Owner' | 'Staff';
};

const session = useSessionStore();

const visit = reactive({
  phone: ''
});
const visitResult = ref<VisitResponse | null>(null);
const visitLoading = ref(false);
const visitMessage = ref<Message | null>(null);

const stampIssue = reactive({
  phone: '',
  quantity: 1,
  reason: ''
});
const stampIssueResult = ref<StampIssueResponse | null>(null);
const stampIssueLoading = ref(false);
const stampIssueMessage = ref<Message | null>(null);

const redeem = reactive({
  phone: ''
});
const redeemResult = ref<RedemptionResponse | null>(null);
const redeemLoading = ref(false);
const redeemMessage = ref<Message | null>(null);

const lookup = reactive({
  phone: ''
});
const lookupResult = ref<CustomerStatusResponse | null>(null);
const visitHistory = ref<VisitHistoryItem[]>([]);
const stampHistory = ref<StampTransactionItem[]>([]);
const lookupLoading = ref(false);
const historyLoading = ref(false);
const stampHistoryLoading = ref(false);
const lookupMessage = ref<Message | null>(null);

const profile = reactive({
  phone: '',
  displayName: '',
  mobileNumber: '',
  usualOrder: '',
  notes: ''
});
const profileLoading = ref(false);
const profileMessage = ref<Message | null>(null);

const staff = reactive({
  displayName: '',
  phoneNumber: ''
});
const staffList = ref<StaffResponse[]>([]);
const staffLoading = ref(false);
const staffMessage = ref<Message | null>(null);

const loyaltyConfig = reactive({
  programName: '',
  programDescription: '',
  rewardName: '',
  programIconUrl: '',
  rewardImageUrl: '',
  visitThreshold: 9,
  optionalNote: '',
  stampExpirationDays: '' as string | number
});
const loyaltyLoading = ref(false);
const loyaltyMessage = ref<Message | null>(null);

const media = reactive({
  programIconFile: null as File | null,
  rewardImageFile: null as File | null
});

const redemptions = ref<RedemptionSummary[]>([]);
const redemptionsLoading = ref(false);
const redemptionsMessage = ref<Message | null>(null);

const membership = reactive({
  phone: ''
});
const membershipLoading = ref(false);
const membershipMessage = ref<Message | null>(null);

const stats = ref<BusinessStatsResponse | null>(null);
const statsLoading = ref(false);
const statsMessage = ref<Message | null>(null);

const businessOptions = computed<BusinessOption[]>(() => {
  const map = new Map();
  session.ownerBusinesses.forEach((business) => {
    map.set(business.id, { ...business, role: 'Owner' });
  });
  session.staffBusinesses.forEach((business) => {
    if (!map.has(business.id)) {
      map.set(business.id, { ...business, role: 'Staff' });
    }
  });
  return Array.from(map.values());
});

const selectedBusiness = ref<number | ''>(session.activeBusinessId || '');

const activeBusiness = computed<BusinessOption | null>(() => {
  const id = Number(selectedBusiness.value);
  if (!id) {
    return null;
  }
  return businessOptions.value.find((item) => item.id === id) || null;
});

const isOwner = computed(() => {
  if (!activeBusiness.value) {
    return false;
  }
  return session.ownerBusinesses.some((item) => item.id === activeBusiness.value.id);
});

watch(selectedBusiness, (value) => {
  session.setActiveBusiness(value ? Number(value) : null);
});

watch(
  () => session.activeBusinessId,
  (value) => {
    if (!value) {
      selectedBusiness.value = '';
      return;
    }
    selectedBusiness.value = value;
  }
);

watch(
  () => activeBusiness.value?.id,
  async (value) => {
    if (value && isOwner.value) {
      await loadLoyaltyConfig();
    }
  }
);

onMounted(async () => {
  if (session.token && !session.meLoaded) {
    await session.fetchMe();
  }
});

async function refreshMe() {
  try {
    await session.fetchMe();
  } catch (error) {
    setMessage(visitMessage, 'error', error.message);
  }
}

async function recordVisit() {
  if (!activeBusiness.value) {
    setMessage(visitMessage, 'error', 'Select a business first.');
    return;
  }
  visitLoading.value = true;
  try {
    const data = await apiPost<VisitResponse>(
      `/businesses/${activeBusiness.value.id}/visits`,
      { phoneNumber: visit.phone },
      session.token
    );
    visitResult.value = data;
    setMessage(visitMessage, 'success', 'Visit processed.');
  } catch (error) {
    setMessage(visitMessage, 'error', error.message);
  } finally {
    visitLoading.value = false;
  }
}

async function redeemReward() {
  if (!activeBusiness.value) {
    setMessage(redeemMessage, 'error', 'Select a business first.');
    return;
  }
  redeemLoading.value = true;
  try {
    const data = await apiPost<RedemptionResponse>(
      `/businesses/${activeBusiness.value.id}/redemptions`,
      { customerPhone: redeem.phone },
      session.token
    );
    redeemResult.value = data;
    setMessage(redeemMessage, 'success', 'Reward redeemed.');
  } catch (error) {
    setMessage(redeemMessage, 'error', error.message);
  } finally {
    redeemLoading.value = false;
  }
}

async function fetchCustomer() {
  if (!activeBusiness.value) {
    setMessage(lookupMessage, 'error', 'Select a business first.');
    return;
  }
  lookupLoading.value = true;
  try {
    const data = await apiGet<CustomerStatusResponse>(
      `/businesses/${activeBusiness.value.id}/customers/${encodeURIComponent(lookup.phone)}`,
      session.token
    );
    lookupResult.value = data;
    profile.phone = lookup.phone;
    setMessage(lookupMessage, 'success', 'Customer loaded.');
  } catch (error) {
    setMessage(lookupMessage, 'error', error.message);
  } finally {
    lookupLoading.value = false;
  }
}

async function fetchHistory() {
  if (!activeBusiness.value) {
    setMessage(lookupMessage, 'error', 'Select a business first.');
    return;
  }
  historyLoading.value = true;
  try {
    const data = await apiGet<VisitHistoryItem[]>(
      `/businesses/${activeBusiness.value.id}/customers/${encodeURIComponent(lookup.phone)}/visits`,
      session.token
    );
    visitHistory.value = data || [];
    setMessage(lookupMessage, 'success', 'Visit history loaded.');
  } catch (error) {
    setMessage(lookupMessage, 'error', error.message);
  } finally {
    historyLoading.value = false;
  }
}

async function fetchStampHistory() {
  if (!activeBusiness.value) {
    setMessage(lookupMessage, 'error', 'Select a business first.');
    return;
  }
  stampHistoryLoading.value = true;
  try {
    const data = await apiGet<StampTransactionItem[]>(
      `/businesses/${activeBusiness.value.id}/customers/${encodeURIComponent(lookup.phone)}/stamps`,
      session.token
    );
    stampHistory.value = data || [];
    setMessage(lookupMessage, 'success', 'Stamp history loaded.');
  } catch (error) {
    setMessage(lookupMessage, 'error', error.message);
  } finally {
    stampHistoryLoading.value = false;
  }
}

async function updateProfile() {
  if (!activeBusiness.value) {
    setMessage(profileMessage, 'error', 'Select a business first.');
    return;
  }
  profileLoading.value = true;
  try {
    await apiPut(
      `/businesses/${activeBusiness.value.id}/customers/${encodeURIComponent(profile.phone)}/profile`,
      {
        displayName: profile.displayName,
        mobileNumber: profile.mobileNumber,
        usualOrder: profile.usualOrder,
        notes: profile.notes
      },
      session.token
    );
    setMessage(profileMessage, 'success', 'Profile updated.');
  } catch (error) {
    setMessage(profileMessage, 'error', error.message);
  } finally {
    profileLoading.value = false;
  }
}

async function addStaff() {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', 'Select a business first.');
    return;
  }
  staffLoading.value = true;
  try {
    await apiPost(
      `/businesses/${activeBusiness.value.id}/staff`,
      { displayName: staff.displayName, phoneNumber: staff.phoneNumber },
      session.token
    );
    staff.displayName = '';
    staff.phoneNumber = '';
    setMessage(staffMessage, 'success', 'Staff added.');
    await loadStaff();
  } catch (error) {
    setMessage(staffMessage, 'error', error.message);
  } finally {
    staffLoading.value = false;
  }
}

async function loadStaff() {
  if (!activeBusiness.value) {
    setMessage(staffMessage, 'error', 'Select a business first.');
    return;
  }
  staffLoading.value = true;
  try {
    staffList.value = await apiGet<StaffResponse[]>(
      `/businesses/${activeBusiness.value.id}/staff`,
      session.token
    );
    setMessage(staffMessage, 'success', 'Staff list refreshed.');
  } catch (error) {
    setMessage(staffMessage, 'error', error.message);
  } finally {
    staffLoading.value = false;
  }
}

async function loadRedemptions() {
  if (!activeBusiness.value) {
    setMessage(redemptionsMessage, 'error', 'Select a business first.');
    return;
  }
  redemptionsLoading.value = true;
  try {
    redemptions.value = await apiGet<RedemptionSummary[]>(
      `/businesses/${activeBusiness.value.id}/redemptions`,
      session.token
    );
    setMessage(redemptionsMessage, 'success', 'Redemptions loaded.');
  } catch (error) {
    setMessage(redemptionsMessage, 'error', error.message);
  } finally {
    redemptionsLoading.value = false;
  }
}

async function loadLoyaltyConfig() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', 'Select a business first.');
    return;
  }
  loyaltyLoading.value = true;
  try {
    const data = await apiGet<BusinessDetailResponse>(
      `/businesses/${activeBusiness.value.id}`,
      session.token
    );
    loyaltyConfig.programName = data.programName || '';
    loyaltyConfig.programDescription = data.programDescription || '';
    loyaltyConfig.programIconUrl = data.programIconUrl || '';
    loyaltyConfig.rewardName = data.rewardName || '';
    loyaltyConfig.rewardImageUrl = data.rewardImageUrl || '';
    loyaltyConfig.visitThreshold = data.visitThreshold || 1;
    loyaltyConfig.optionalNote = data.optionalNote || '';
    loyaltyConfig.stampExpirationDays = data.stampExpirationDays ?? '';
    setMessage(loyaltyMessage, 'success', 'Loyalty config loaded.');
  } catch (error) {
    setMessage(loyaltyMessage, 'error', error.message);
  } finally {
    loyaltyLoading.value = false;
  }
}

async function saveLoyaltyConfig() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', 'Select a business first.');
    return;
  }
  if (!loyaltyConfig.programName.trim()) {
    setMessage(loyaltyMessage, 'error', 'Program name is required.');
    return;
  }
  loyaltyLoading.value = true;
  try {
    await apiPost(
      `/businesses/${activeBusiness.value.id}/loyalty-config`,
      {
        programName: loyaltyConfig.programName,
        programDescription: loyaltyConfig.programDescription,
        rewardName: loyaltyConfig.rewardName,
        visitThreshold: loyaltyConfig.visitThreshold,
        optionalNote: loyaltyConfig.optionalNote,
        stampExpirationDays: loyaltyConfig.stampExpirationDays || null
      },
      session.token
    );
    setMessage(loyaltyMessage, 'success', 'Loyalty config updated.');
  } catch (error) {
    setMessage(loyaltyMessage, 'error', error.message);
  } finally {
    loyaltyLoading.value = false;
  }
}

async function issueStamps() {
  if (!activeBusiness.value) {
    setMessage(stampIssueMessage, 'error', 'Select a business first.');
    return;
  }
  if (!stampIssue.phone.trim()) {
    setMessage(stampIssueMessage, 'error', 'Customer phone is required.');
    return;
  }
  if (!stampIssue.reason.trim()) {
    setMessage(stampIssueMessage, 'error', 'Reason is required.');
    return;
  }
  if (!stampIssue.quantity || stampIssue.quantity <= 0) {
    setMessage(stampIssueMessage, 'error', 'Stamp quantity must be positive.');
    return;
  }
  stampIssueLoading.value = true;
  try {
    const data = await apiPost<StampIssueResponse>(
      `/businesses/${activeBusiness.value.id}/stamps`,
      {
        customerPhone: stampIssue.phone,
        quantity: stampIssue.quantity,
        reason: stampIssue.reason
      },
      session.token
    );
    stampIssueResult.value = data;
    setMessage(stampIssueMessage, 'success', 'Stamps issued.');
  } catch (error) {
    setMessage(stampIssueMessage, 'error', error.message);
  } finally {
    stampIssueLoading.value = false;
  }
}

async function createMembership() {
  if (!activeBusiness.value) {
    setMessage(membershipMessage, 'error', 'Select a business first.');
    return;
  }
  if (!membership.phone.trim()) {
    setMessage(membershipMessage, 'error', 'Customer phone is required.');
    return;
  }
  membershipLoading.value = true;
  try {
    await apiPost(
      `/businesses/${activeBusiness.value.id}/memberships`,
      { phoneNumber: membership.phone },
      session.token
    );
    setMessage(membershipMessage, 'success', 'Membership created.');
  } catch (error) {
    setMessage(membershipMessage, 'error', error.message);
  } finally {
    membershipLoading.value = false;
  }
}

async function loadStats() {
  if (!activeBusiness.value) {
    setMessage(statsMessage, 'error', 'Select a business first.');
    return;
  }
  statsLoading.value = true;
  try {
    stats.value = await apiGet<BusinessStatsResponse>(
      `/businesses/${activeBusiness.value.id}/stats`,
      session.token
    );
    setMessage(statsMessage, 'success', 'Stats loaded.');
  } catch (error) {
    setMessage(statsMessage, 'error', error.message);
  } finally {
    statsLoading.value = false;
  }
}

function onProgramIconChange(event: Event) {
  const target = event.target as HTMLInputElement;
  media.programIconFile = target.files?.[0] ?? null;
}

function onRewardImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  media.rewardImageFile = target.files?.[0] ?? null;
}

async function uploadProgramIcon() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', 'Select a business first.');
    return;
  }
  if (!media.programIconFile) {
    setMessage(loyaltyMessage, 'error', 'Select an image first.');
    return;
  }
  loyaltyLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('kind', 'program_icon');
    formData.append('file', media.programIconFile);
    const data = await apiPostForm<LoyaltyMediaResponse>(
      `/businesses/${activeBusiness.value.id}/loyalty-media`,
      formData,
      session.token
    );
    loyaltyConfig.programIconUrl = data.url;
    setMessage(loyaltyMessage, 'success', 'Program icon uploaded.');
  } catch (error) {
    setMessage(loyaltyMessage, 'error', error.message);
  } finally {
    loyaltyLoading.value = false;
  }
}

async function uploadRewardImage() {
  if (!activeBusiness.value) {
    setMessage(loyaltyMessage, 'error', 'Select a business first.');
    return;
  }
  if (!media.rewardImageFile) {
    setMessage(loyaltyMessage, 'error', 'Select an image first.');
    return;
  }
  loyaltyLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('kind', 'reward_image');
    formData.append('file', media.rewardImageFile);
    const data = await apiPostForm<LoyaltyMediaResponse>(
      `/businesses/${activeBusiness.value.id}/loyalty-media`,
      formData,
      session.token
    );
    loyaltyConfig.rewardImageUrl = data.url;
    setMessage(loyaltyMessage, 'success', 'Reward image uploaded.');
  } catch (error) {
    setMessage(loyaltyMessage, 'error', error.message);
  } finally {
    loyaltyLoading.value = false;
  }
}
</script>
