namespace Loyalty.Api.Models;

public sealed class AuthSession
{
    public int Id { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
