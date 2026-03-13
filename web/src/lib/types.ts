export type BusinessSummary = {
  id: number;
  name: string;
  businessType: string;
};

export type CustomerResponse = {
  id: number;
  phoneNumber: string;
  mobileNumber?: string | null;
  displayName?: string | null;
  usualOrder?: string | null;
  notes?: string | null;
};

export type VisitResponse = {
  customer: CustomerResponse;
  visitCount: number;
  visitThreshold: number;
  rewardAvailable: boolean;
  rewardName: string;
};

export type RedemptionResponse = {
  rewardName: string;
  redeemedAt: string;
  visitCount: number;
  redeemedByPhone?: string | null;
};

export type CustomerStatusResponse = {
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

export type VisitHistoryItem = {
  createdAt: string;
  quantity: number;
  reason?: string | null;
};

export type StaffResponse = {
  id: number;
  displayName: string;
  phoneNumber: string;
  active: boolean;
  createdAt: string;
};

export type RedemptionSummary = {
  id: number;
  customerId: number;
  rewardName: string;
  redeemedAt: string;
  staffId?: number | null;
  redeemedByPhone?: string | null;
};

export type BusinessDetailResponse = {
  programName: string;
  programDescription?: string | null;
  programIconUrl?: string | null;
  rewardName: string;
  rewardImageUrl?: string | null;
  visitThreshold: number;
  optionalNote?: string | null;
  stampExpirationDays?: number | null;
};

export type StampIssueResponse = {
  customer: CustomerResponse;
  stampCount: number;
  stampThreshold: number;
  rewardAvailable: boolean;
  rewardDescription: string;
  rewardAvailableAt?: string | null;
  lastStampAt?: string | null;
};

export type StampTransactionItem = {
  id: number;
  quantity: number;
  reason: string;
  issuedAt: string;
  issuedByPhone: string;
  staffId?: number | null;
};

export type BusinessStatsResponse = {
  enrolledCustomers: number;
  stampsIssued: number;
  rewardsRedeemed: number;
};

export type ReportDateRange = {
  start: string;
  end: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type CustomerActivityItem = {
  customerId: number;
  phoneNumber: string;
  displayName?: string | null;
  memberSince: string;
  lastStampAt?: string | null;
  totalStampsIssued: number;
  totalRewardsRedeemed: number;
  currentStampCount: number;
  stampThreshold: number;
  rewardAvailable: boolean;
  isActive: boolean;
};

export type CustomerActivityReport = {
  range: ReportDateRange;
  activeCustomers: number;
  inactiveCustomers: number;
  customers: PagedResponse<CustomerActivityItem>;
};

export type StaffCount = {
  staffId?: number | null;
  staffName?: string | null;
  staffPhone?: string | null;
  value: number;
};

export type ReasonCount = {
  reason: string;
  value: number;
};

export type StampTransactionReportItem = {
  id: number;
  customerId: number;
  customerPhone: string;
  customerName?: string | null;
  quantity: number;
  reason: string;
  issuedAt: string;
  staffId?: number | null;
  staffName?: string | null;
  issuedByPhone?: string | null;
};

export type StampIssuanceReport = {
  range: ReportDateRange;
  totalStampsIssued: number;
  stampsByDay: { periodStart: string; value: number }[];
  stampsByWeek: { periodStart: string; value: number }[];
  stampsByMonth: { periodStart: string; value: number }[];
  stampsByStaff: StaffCount[];
  stampsByReason: ReasonCount[];
  recentTransactions: PagedResponse<StampTransactionReportItem>;
};

export type PlatformOverviewReport = {
  range: ReportDateRange;
  totalVendors: number;
  activeVendors: number;
  disabledVendors: number;
  totalMemberships: number;
  newMemberships: number;
  totalStampsIssued: number;
  totalRewardsRedeemed: number;
  topVendorsByMembers: ReasonCount[];
  topVendorsByStamps: ReasonCount[];
  topVendorsByRewards: ReasonCount[];
};

export type VendorComparisonItem = {
  businessId: number;
  businessName: string;
  totalMembers: number;
  newMembers: number;
  activeCustomers: number;
  stampsIssued: number;
  rewardsRedeemed: number;
  redemptionRate: number;
  activePrograms: number;
};

export type VendorComparisonReport = {
  range: ReportDateRange;
  vendors: PagedResponse<VendorComparisonItem>;
};

export type AdminBusinessSummary = {
  id: number;
  name: string;
  ownerPhone: string;
  businessType: string;
  createdAt: string;
  hasProgram: boolean;
  programActive: boolean;
};

export type AdminBusinessDetail = {
  id: number;
  name: string;
  ownerPhone: string;
  businessType: string;
  createdAt: string;
  hasProgram: boolean;
  programActive: boolean;
  programName?: string | null;
  programDescription?: string | null;
  rewardName?: string | null;
  visitThreshold?: number | null;
  optionalNote?: string | null;
  stampExpirationDays?: number | null;
};

export type AdminBusinessUpdate = {
  name?: string | null;
  ownerPhone?: string | null;
  businessType?: string | null;
  programActive?: boolean | null;
  programName?: string | null;
  programDescription?: string | null;
  rewardName?: string | null;
  visitThreshold?: number | null;
  optionalNote?: string | null;
  stampExpirationDays?: number | null;
};

export type VendorOverviewReport = {
  range: ReportDateRange;
  totalMembers: number;
  newMembers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalStampsIssued: number;
  totalRewardsRedeemed: number;
  redemptionRate: number;
  redeemableRewards: number;
  avgStampsPerActiveCustomer: number;
  avgRewardsPerActiveCustomer: number;
};

export type LoyaltyMediaResponse = {
  kind: string;
  url: string;
};

export type MagicLinkResponse = {
  token: string;
  url: string;
  expiresAt: string;
  businessId: number;
  businessName: string;
};

export type AuthMeResponse = {
  phoneNumber: string;
  ownerBusinesses: BusinessSummary[];
  staffBusinesses: BusinessSummary[];
};
