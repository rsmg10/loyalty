namespace Loyalty.Api.Contracts;

public sealed record StaffCreate(string DisplayName, string PhoneNumber);

public sealed record StaffResponse(
    int Id,
    string DisplayName,
    string PhoneNumber,
    bool Active,
    DateTime CreatedAt
);
