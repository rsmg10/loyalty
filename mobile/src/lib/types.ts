export type AuthTokenResponse = {
  token: string;
  expiresAt: string;
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

export type StampTransactionItem = {
  id: number;
  quantity: number;
  reason: string;
  issuedAt: string;
  issuedByPhone: string;
  staffId?: number | null;
};
