import { apiPost } from '../lib/api';

export function useAuthApi() {
  return {
    requestOtp: (payload: { phoneNumber: string; purpose: string }) =>
      apiPost('/auth/request-otp', payload),
    verifyOtp: (payload: { phoneNumber: string; purpose: string; code: string }) =>
      apiPost<{ token: string; expiresAt: string }>('/auth/verify-otp', payload),
    staffLogin: (payload: { username: string; password: string }) =>
      apiPost<{ token: string; expiresAt: string }>('/auth/staff/login', payload)
  };
}
