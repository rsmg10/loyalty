namespace Loyalty.Api.Contracts;

public sealed record AuthRequestOtp(string PhoneNumber, string Purpose);

public sealed record AuthVerifyOtp(string PhoneNumber, string Code, string Purpose);

public sealed record AuthTokenResponse(string Token, DateTime ExpiresAt);

public sealed record BusinessSummary(int Id, string Name, string BusinessType);

public sealed record AuthMeResponse(
    string PhoneNumber,
    IReadOnlyList<BusinessSummary> OwnerBusinesses,
    IReadOnlyList<BusinessSummary> StaffBusinesses
);
