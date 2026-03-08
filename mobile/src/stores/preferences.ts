import { defineStore } from 'pinia';

const BUSINESS_KEY = 'loyalty_mobile_business';

type PreferencesState = {
  businessId: string;
};

export const usePreferencesStore = defineStore('preferences', {
  state: (): PreferencesState => ({
    businessId: localStorage.getItem(BUSINESS_KEY) || ''
  }),
  actions: {
    setBusinessId(value: string) {
      this.businessId = value;
      if (value) {
        localStorage.setItem(BUSINESS_KEY, value);
      } else {
        localStorage.removeItem(BUSINESS_KEY);
      }
    }
  }
});
