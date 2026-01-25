namespace Loyalty.Api.Models;

public sealed class AuthOtp
{
    public int Id { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Code { get; set; }
    public required string Purpose { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConsumedAt { get; set; }
}
