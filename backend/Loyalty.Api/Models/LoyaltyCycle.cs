namespace Loyalty.Api.Models;

public sealed class LoyaltyCycle
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int BusinessId { get; set; }
    public int VisitCount { get; set; }
    public string Status { get; set; } = "PROGRESSING";
}
