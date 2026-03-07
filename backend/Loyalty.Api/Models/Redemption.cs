namespace Loyalty.Api.Models;

public sealed class Redemption
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int BusinessId { get; set; }
    public required string RewardName { get; set; }
    public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;
    public int? StaffId { get; set; }
    public string? RedeemedByPhone { get; set; }
}
