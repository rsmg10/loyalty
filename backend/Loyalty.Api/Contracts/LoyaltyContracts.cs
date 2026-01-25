namespace Loyalty.Api.Contracts;

public sealed record LoyaltyConfigCreate(string RewardName, int VisitThreshold, string? OptionalNote);

public sealed record CustomerLookup(string PhoneNumber);

public sealed record CustomerResponse(
    int Id,
    string PhoneNumber,
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

public sealed record RedemptionResponse(string RewardName, DateTime RedeemedAt, int VisitCount);

public sealed record CustomerStatusResponse(
    string BusinessName,
    string RewardName,
    int VisitCount,
    int VisitThreshold,
    string? OptionalNote
);

public sealed record CustomerProfileUpdate(
    string? DisplayName,
    string? UsualOrder,
    string? Notes
);

public sealed record VisitHistoryItem(DateTime CreatedAt);

public sealed record RedemptionSummary(
    int Id,
    int CustomerId,
    string RewardName,
    DateTime RedeemedAt,
    int? StaffId
);
