namespace Loyalty.Api.Models;

public sealed class LoyaltyCycle
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int BusinessId { get; set; }
    public int VisitCount { get; set; }
    public string Status { get; set; } = "PROGRESSING";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastStampAt { get; set; }
    public DateTime? RewardAvailableAt { get; set; }
    public string? RewardNameSnapshot { get; set; }
    public int? VisitThresholdSnapshot { get; set; }
    public string? OptionalNoteSnapshot { get; set; }
}
