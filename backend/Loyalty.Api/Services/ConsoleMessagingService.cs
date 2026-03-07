namespace Loyalty.Api.Services;

public sealed class ConsoleMessagingService : IMessagingService
{
    public Task SendVisitProgressAsync(string phoneNumber, string businessName, int visitCount, int visitThreshold)
    {
        Console.WriteLine($"[SMS] {phoneNumber}: Thanks for visiting {businessName}. You're now at {visitCount} out of {visitThreshold} stamps.");
        return Task.CompletedTask;
    }

    public Task SendRewardAvailableAsync(string phoneNumber, string businessName, string rewardName)
    {
        Console.WriteLine($"[SMS] {phoneNumber}: You've earned a {rewardName} at {businessName}! Ask staff to redeem on your next visit.");
        return Task.CompletedTask;
    }

    public Task SendRewardRedeemedAsync(string phoneNumber, string businessName, string rewardName)
    {
        Console.WriteLine($"[SMS] {phoneNumber}: Enjoy your {rewardName}! Your loyalty at {businessName} has restarted.");
        return Task.CompletedTask;
    }

    public Task SendOtpAsync(string phoneNumber, string code, string purpose)
    {
        Console.WriteLine($"[SMS] {phoneNumber}: Your {purpose} code is {code}.");
        return Task.CompletedTask;
    }
}
