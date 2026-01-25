namespace Loyalty.Api.Models;

public sealed class Customer
{
    public int Id { get; set; }
    public required string PhoneNumber { get; set; }
    public string? DisplayName { get; set; }
    public string? UsualOrder { get; set; }
    public string? Notes { get; set; }
}
