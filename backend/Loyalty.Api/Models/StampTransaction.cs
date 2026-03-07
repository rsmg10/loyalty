namespace Loyalty.Api.Models;

public sealed class StampTransaction
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int BusinessId { get; set; }
    public int Quantity { get; set; }
    public required string Reason { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public int? StaffId { get; set; }
    public required string IssuedByPhone { get; set; }
}
