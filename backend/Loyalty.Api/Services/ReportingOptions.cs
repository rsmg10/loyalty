namespace Loyalty.Api.Services;

public sealed class ReportingOptions
{
    public string? AdminPhones { get; set; }
    public int SuspiciousWindowMinutes { get; set; } = 60;
    public int SuspiciousStaffStampThreshold { get; set; } = 40;
    public int SuspiciousCustomerRedemptionThreshold { get; set; } = 3;
    public int SuspiciousAdjustmentThreshold { get; set; } = 6;
}
