namespace Loyalty.Api.Contracts;

public sealed record BusinessCreate(string Name, string OwnerPhone, string BusinessType);

public sealed record BusinessResponse(int Id, string Name, string OwnerPhone, DateTime CreatedAt);

public sealed record BusinessOnboardingRequest(
    string Name,
    string OwnerPhone,
    string BusinessType,
    string RewardName,
    int VisitThreshold,
    string? OptionalNote
);

public sealed record BusinessDetailResponse(
    int Id,
    string Name,
    string OwnerPhone,
    string BusinessType,
    DateTime CreatedAt,
    string RewardName,
    int VisitThreshold,
    string? OptionalNote
);
