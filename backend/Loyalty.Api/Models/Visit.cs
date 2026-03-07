namespace Loyalty.Api.Models;

public sealed class Visit
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int BusinessId { get; set; }
    public int? StaffId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
