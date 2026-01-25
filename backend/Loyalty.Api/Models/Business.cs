namespace Loyalty.Api.Models;

public sealed class Business
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string OwnerPhone { get; set; }
    public required string BusinessType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public LoyaltyConfig? LoyaltyConfig { get; set; }
}
