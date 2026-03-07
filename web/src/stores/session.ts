import { defineStore } from 'pinia';
import { apiGet } from '../lib/api';

const TOKEN_KEY = 'loyalty_token';
const PHONE_KEY = 'loyalty_phone';
const PURPOSE_KEY = 'loyalty_purpose';
const BUSINESS_KEY = 'loyalty_business';

type BusinessSummary = {
  id: number;
  name: string;
  businessType: string;
};

export type SessionPurpose = 'owner' | 'staff' | 'customer';

type SessionState = {
  token: string;
  phoneNumber: string;
  purpose: SessionPurpose;
  ownerBusinesses: BusinessSummary[];
  staffBusinesses: BusinessSummary[];
  activeBusinessId: number | null;
  meLoaded: boolean;
  loading: boolean;
};

const storedPurpose = (localStorage.getItem(PURPOSE_KEY) as SessionPurpose) || 'staff';

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    phoneNumber: localStorage.getItem(PHONE_KEY) || '',
    purpose: storedPurpose,
    ownerBusinesses: [],
    staffBusinesses: [],
    activeBusinessId: Number(localStorage.getItem(BUSINESS_KEY)) || null,
    meLoaded: false,
    loading: false
  }),
  actions: {
    setAuth(token: string, phoneNumber: string, purpose: SessionPurpose) {
      this.token = token;
      this.phoneNumber = phoneNumber;
      this.purpose = purpose;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(PHONE_KEY, phoneNumber);
      localStorage.setItem(PURPOSE_KEY, purpose);
    },
    clearAuth() {
      this.token = '';
      this.phoneNumber = '';
      this.ownerBusinesses = [];
      this.staffBusinesses = [];
      this.activeBusinessId = null;
      this.meLoaded = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PHONE_KEY);
      localStorage.removeItem(PURPOSE_KEY);
      localStorage.removeItem(BUSINESS_KEY);
    },
    setActiveBusiness(id: number | null) {
      this.activeBusinessId = id;
      if (id) {
        localStorage.setItem(BUSINESS_KEY, String(id));
      } else {
        localStorage.removeItem(BUSINESS_KEY);
      }
    },
    async fetchMe() {
      if (!this.token) {
        return;
      }

      this.loading = true;
      try {
        const data = await apiGet<{
          ownerBusinesses: BusinessSummary[];
          staffBusinesses: BusinessSummary[];
        }>('/me', this.token);
        this.ownerBusinesses = data.ownerBusinesses || [];
        this.staffBusinesses = data.staffBusinesses || [];

        const allIds = new Set([
          ...this.ownerBusinesses.map((item) => item.id),
          ...this.staffBusinesses.map((item) => item.id)
        ]);

        if (!allIds.has(this.activeBusinessId)) {
          const first = [...allIds][0];
          this.setActiveBusiness(first || null);
        }
      } finally {
        this.loading = false;
        this.meLoaded = true;
      }
    }
  }
});
