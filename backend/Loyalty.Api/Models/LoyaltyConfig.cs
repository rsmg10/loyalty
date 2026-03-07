namespace Loyalty.Api.Models;

public sealed class LoyaltyConfig
{
    public int Id { get; set; }
    public int BusinessId { get; set; }
    public required string ProgramName { get; set; }
    public string? ProgramDescription { get; set; }
    public string? ProgramIconUrl { get; set; }
    public required string RewardName { get; set; }
    public string? RewardImageUrl { get; set; }
    public int VisitThreshold { get; set; }
    public string? OptionalNote { get; set; }
    public int? StampExpirationDays { get; set; }
    public bool Active { get; set; } = true;
    public Business? Business { get; set; }
}
