import { apiGet, apiPost, apiPostForm, apiPut } from '../lib/api';
import type {
  AuthMeResponse,
  BusinessDetailResponse,
  BusinessStatsResponse,
  CustomerActivityReport,
  CustomerStatusResponse,
  LoyaltyMediaResponse,
  MagicLinkResponse,
  AdminBusinessDetail,
  AdminBusinessSummary,
  AdminBusinessUpdate,
  PagedResponse,
  PlatformOverviewReport,
  RedemptionResponse,
  RedemptionSummary,
  StampIssuanceReport,
  StampIssueResponse,
  StampTransactionItem,
  VendorComparisonReport,
  VendorOverviewReport,
  StaffResponse,
  VisitHistoryItem,
  VisitResponse
} from '../lib/types';

type ReportQuery = {
  start?: string;
  end?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  sort?: string;
  reward?: string;
  staffId?: number;
};

function withQuery(path: string, params?: ReportQuery) {
  if (!params) {
    return path;
  }
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export function useLoyaltyApi(token: string) {
  return {
    getMe: () => apiGet<AuthMeResponse>('/me', token),
    onboard: (payload: unknown) => apiPost('/onboarding', payload, token),
    recordVisit: (businessId: number, phoneNumber: string) =>
      apiPost<VisitResponse>(`/businesses/${businessId}/visits`, { phoneNumber }, token),
    issueStamps: (businessId: number, payload: { customerPhone: string; quantity: number; reason: string }) =>
      apiPost<StampIssueResponse>(`/businesses/${businessId}/stamps`, payload, token),
    redeem: (businessId: number, customerPhone: string) =>
      apiPost<RedemptionResponse>(`/businesses/${businessId}/redemptions`, { customerPhone }, token),
    getCustomerStatus: (businessId: number, phoneNumber: string) =>
      apiGet<CustomerStatusResponse>(`/businesses/${businessId}/customers/${encodeURIComponent(phoneNumber)}`, token),
    updateCustomerProfile: (businessId: number, phoneNumber: string, payload: unknown) =>
      apiPut(`/businesses/${businessId}/customers/${encodeURIComponent(phoneNumber)}/profile`, payload, token),
    getVisitHistory: (businessId: number, phoneNumber: string) =>
      apiGet<VisitHistoryItem[]>(`/businesses/${businessId}/customers/${encodeURIComponent(phoneNumber)}/visits`, token),
    getStampHistory: (businessId: number, phoneNumber: string) =>
      apiGet<StampTransactionItem[]>(
        `/businesses/${businessId}/customers/${encodeURIComponent(phoneNumber)}/stamps`,
        token
      ),
    getBusiness: (businessId: number) =>
      apiGet<BusinessDetailResponse>(`/businesses/${businessId}`, token),
    updateLoyaltyConfig: (businessId: number, payload: unknown) =>
      apiPost(`/businesses/${businessId}/loyalty-config`, payload, token),
    createMembership: (businessId: number, phoneNumber: string) =>
      apiPost(`/businesses/${businessId}/memberships`, { phoneNumber }, token),
    addStaff: (businessId: number, payload: { displayName: string; phoneNumber: string }) =>
      apiPost(`/businesses/${businessId}/staff`, payload, token),
    getStaff: (businessId: number) =>
      apiGet<StaffResponse[]>(`/businesses/${businessId}/staff`, token),
    getRedemptions: (businessId: number) =>
      apiGet<RedemptionSummary[]>(`/businesses/${businessId}/redemptions`, token),
    getStats: (businessId: number) =>
      apiGet<BusinessStatsResponse>(`/businesses/${businessId}/stats`, token),
    getCustomerActivityReport: (businessId: number, query?: ReportQuery) =>
      apiGet<CustomerActivityReport>(
        withQuery(`/businesses/${businessId}/reports/customer-activity`, query),
        token
      ),
    getStampIssuanceReport: (businessId: number, query?: ReportQuery) =>
      apiGet<StampIssuanceReport>(
        withQuery(`/businesses/${businessId}/reports/stamp-issuance`, query),
        token
      ),
    getReportOverview: (businessId: number, query?: ReportQuery) =>
      apiGet<VendorOverviewReport>(withQuery(`/businesses/${businessId}/reports/overview`, query), token),
    getAdminOverview: (query?: ReportQuery) =>
      apiGet<PlatformOverviewReport>(withQuery('/admin/reports/overview', query), token),
    getAdminVendorComparison: (query?: ReportQuery) =>
      apiGet<VendorComparisonReport>(withQuery('/admin/reports/vendor-comparison', query), token),
    getAdminBusinesses: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return apiGet<PagedResponse<AdminBusinessSummary>>(`/admin/businesses${query}`, token);
    },
    getAdminBusiness: (businessId: number) =>
      apiGet<AdminBusinessDetail>(`/admin/businesses/${businessId}`, token),
    updateAdminBusiness: (businessId: number, payload: AdminBusinessUpdate) =>
      apiPut<AdminBusinessDetail>(`/admin/businesses/${businessId}`, payload, token),
    createAdminBusiness: (payload: unknown) =>
      apiPost<AdminBusinessDetail>('/admin/businesses', payload, token),
    getAdminStaff: (businessId: number) =>
      apiGet<StaffResponse[]>(`/admin/businesses/${businessId}/staff`, token),
    addAdminStaff: (businessId: number, payload: { displayName: string; phoneNumber: string }) =>
      apiPost<StaffResponse>(`/admin/businesses/${businessId}/staff`, payload, token),
    updateAdminStaff: (businessId: number, staffId: number, payload: { displayName?: string; phoneNumber?: string; active?: boolean }) =>
      apiPut<StaffResponse>(`/admin/businesses/${businessId}/staff/${staffId}`, payload, token),
    uploadMedia: (businessId: number, formData: FormData) =>
      apiPostForm<LoyaltyMediaResponse>(`/businesses/${businessId}/loyalty-media`, formData, token),
    createMagicLink: (businessId: number) =>
      apiPost<MagicLinkResponse>(`/businesses/${businessId}/magic-links`, {}, token)
  };
}
