import { apiGet, apiPost } from '../lib/api';
import type {
  AuthTokenResponse,
  CustomerStatusResponse,
  MagicLinkResolveResponse,
  StampTransactionItem,
  VisitHistoryItem
} from '../lib/types';

export function useCustomerApi(token: string) {
  return {
    requestOtp: (phoneNumber: string) => apiPost('/auth/request-otp', { phoneNumber, purpose: 'customer' }),
    verifyOtp: (payload: { phoneNumber: string; code: string }) =>
      apiPost<AuthTokenResponse>('/auth/verify-otp', { ...payload, purpose: 'customer' }),
    selfSignup: (businessId: string, payload: { phoneNumber?: string; displayName?: string; mobileNumber?: string }) =>
      apiPost<CustomerStatusResponse>(`/businesses/${businessId}/self-signup`, payload, token),
    getStatus: (businessId: string, phoneNumber: string) =>
      apiGet<CustomerStatusResponse>(
        `/businesses/${businessId}/customers/${encodeURIComponent(phoneNumber)}`,
        token
      ),
    getVisitHistory: (businessId: string, phoneNumber: string) =>
      apiGet<VisitHistoryItem[]>(
        `/businesses/${businessId}/customers/${encodeURIComponent(phoneNumber)}/visits`,
        token
      ),
    getStampHistory: (businessId: string, phoneNumber: string) =>
      apiGet<StampTransactionItem[]>(
        `/businesses/${businessId}/customers/${encodeURIComponent(phoneNumber)}/stamps`,
        token
      ),
    resolveMagicLink: (magicToken: string) =>
      apiGet<MagicLinkResolveResponse>(`/magic-links/${encodeURIComponent(magicToken)}`, token)
  };
}
