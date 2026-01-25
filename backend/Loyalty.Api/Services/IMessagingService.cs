namespace Loyalty.Api.Services;

public interface IMessagingService
{
    Task SendVisitProgressAsync(string phoneNumber, string businessName, int visitCount, int visitThreshold);
    Task SendRewardAvailableAsync(string phoneNumber, string businessName, string rewardName);
    Task SendRewardRedeemedAsync(string phoneNumber, string businessName, string rewardName);
    Task SendOtpAsync(string phoneNumber, string code, string purpose);
}
