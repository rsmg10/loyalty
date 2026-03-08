namespace Loyalty.Api.Services;

public interface IMessagingService
{
    Task SendVisitProgressAsync(string phoneNumber, string businessName, int visitCount, int visitThreshold, string? language = null);
    Task SendRewardAvailableAsync(string phoneNumber, string businessName, string rewardName, string? language = null);
    Task SendRewardRedeemedAsync(string phoneNumber, string businessName, string rewardName, string? language = null);
    Task SendOtpAsync(string phoneNumber, string code, string purpose, string? language = null);
}
