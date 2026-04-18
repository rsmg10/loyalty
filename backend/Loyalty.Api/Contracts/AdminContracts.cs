namespace Loyalty.Api.Contracts;

public sealed record AdminBusinessSummary(
    int Id,
    string Name,
    string OwnerPhone,
    string BusinessType,
    DateTime CreatedAt,
    bool HasProgram,
    bool ProgramActive
);

public sealed record AdminBusinessDetail(
    int Id,
    string Name,
    string OwnerPhone,
    string BusinessType,
    DateTime CreatedAt,
    bool HasProgram,
    bool ProgramActive,
    string? ProgramName,
    string? ProgramDescription,
    string? RewardName,
    int? VisitThreshold,
    string? OptionalNote,
    int? StampExpirationDays
);

public sealed record AdminBusinessUpdate(
    string? Name,
    string? OwnerPhone,
    string? BusinessType,
    bool? ProgramActive,
    string? ProgramName,
    string? ProgramDescription,
    string? RewardName,
    int? VisitThreshold,
    string? OptionalNote,
    int? StampExpirationDays
);
