namespace Loyalty.Api.Contracts;

public sealed record LoyaltyConfigCreate(
    string ProgramName,
    string? ProgramDescription,
    string RewardName,
    int VisitThreshold,
    string? OptionalNote,
    int? StampExpirationDays
);

public sealed record CustomerLookup(string PhoneNumber);

public sealed record CustomerResponse(
    int Id,
    string PhoneNumber,
    string? MobileNumber,
    string? DisplayName,
    string? UsualOrder,
    string? Notes
);

public sealed record VisitResponse(
    CustomerResponse Customer,
    int VisitCount,
    int VisitThreshold,
    bool RewardAvailable,
    string RewardName
);

public sealed record RedemptionRequest(string CustomerPhone, int? StaffId);

public sealed record RedemptionResponse(string RewardName, DateTime RedeemedAt, int VisitCount, string? RedeemedByPhone);

public sealed record CustomerStatusResponse(
    string BusinessName,
    string ProgramName,
    string? ProgramDescription,
    string? ProgramIconUrl,
    string RewardName,
    string? RewardImageUrl,
    int VisitCount,
    int VisitThreshold,
    string? OptionalNote,
    int? StampExpirationDays,
    DateTime? RewardAvailableAt,
    DateTime? LastStampAt
);

public sealed record CustomerProfileUpdate(
    string? DisplayName,
    string? MobileNumber,
    string? UsualOrder,
    string? Notes
);

public sealed record VisitHistoryItem(DateTime CreatedAt, int Quantity, string? Reason);

public sealed record RedemptionSummary(
    int Id,
    int CustomerId,
    string RewardName,
    DateTime RedeemedAt,
    int? StaffId,
    string? RedeemedByPhone
);

public sealed record StampIssueRequest(string CustomerPhone, int Quantity, string Reason, int? StaffId);

public sealed record StampIssueResponse(
    CustomerResponse Customer,
    int StampCount,
    int StampThreshold,
    bool RewardAvailable,
    string RewardDescription,
    DateTime? RewardAvailableAt,
    DateTime? LastStampAt
);

public sealed record StampTransactionItem(
    int Id,
    int Quantity,
    string Reason,
    DateTime IssuedAt,
    string IssuedByPhone,
    int? StaffId
);

public sealed record BusinessStatsResponse(int EnrolledCustomers, int StampsIssued, int RewardsRedeemed);

public sealed record LoyaltyMediaResponse(string Kind, string Url);
