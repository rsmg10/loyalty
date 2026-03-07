namespace Loyalty.Api.Models;

public sealed class LoyaltyCycle
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int BusinessId { get; set; }
    public int VisitCount { get; set; }
    public string Status { get; set; } = "PROGRESSING";
    public string? RewardNameSnapshot { get; set; }
    public int? VisitThresholdSnapshot { get; set; }
    public string? OptionalNoteSnapshot { get; set; }
}
