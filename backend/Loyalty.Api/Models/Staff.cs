namespace Loyalty.Api.Models;

public sealed class Staff
{
    public int Id { get; set; }
    public int BusinessId { get; set; }
    public required string DisplayName { get; set; }
    public required string PhoneNumber { get; set; }
    public bool Active { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
