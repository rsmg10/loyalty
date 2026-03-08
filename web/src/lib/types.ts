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
