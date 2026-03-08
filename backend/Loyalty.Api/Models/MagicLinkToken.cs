namespace Loyalty.Api.Models;

public sealed class MagicLinkToken
{
    public int Id { get; set; }
    public int BusinessId { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public required string CreatedByPhone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
