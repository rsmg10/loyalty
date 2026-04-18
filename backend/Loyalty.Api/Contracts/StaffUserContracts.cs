namespace Loyalty.Api.Contracts;

public sealed record StaffUserCreate(string DisplayName, string Username, string Password);

public sealed record StaffUserResponse(
    int Id,
    string DisplayName,
    string Username,
    bool Active,
    DateTime CreatedAt
);

public sealed record StaffUserStatusUpdate(bool Active);

public sealed record StaffUserPasswordUpdate(string Password);

public sealed record StaffLoginRequest(string Username, string Password);
