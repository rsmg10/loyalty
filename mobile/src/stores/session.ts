import { defineStore } from 'pinia';

const TOKEN_KEY = 'loyalty_mobile_token';
const PHONE_KEY = 'loyalty_mobile_phone';

type SessionState = {
  token: string;
  phoneNumber: string;
};

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    phoneNumber: localStorage.getItem(PHONE_KEY) || ''
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    setAuth(token: string, phoneNumber: string) {
      this.token = token;
      this.phoneNumber = phoneNumber;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(PHONE_KEY, phoneNumber);
    },
    clearAuth() {
      this.token = '';
      this.phoneNumber = '';
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PHONE_KEY);
    }
  }
});
