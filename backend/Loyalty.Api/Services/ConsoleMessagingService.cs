namespace Loyalty.Api.Services;

public sealed class ConsoleMessagingService(LocalizationService localizer) : IMessagingService
{
    private readonly LocalizationService _localizer = localizer;

    public Task SendVisitProgressAsync(string phoneNumber, string businessName, int visitCount, int visitThreshold, string? language = null)
    {
        var lang = _localizer.ResolveLanguage(language);
        var message = lang == "ar"
            ? $"[SMS] {phoneNumber}: شكراً لزيارتك {businessName}. أصبحت الآن {visitCount} من {visitThreshold} أختام."
            : $"[SMS] {phoneNumber}: Thanks for visiting {businessName}. You're now at {visitCount} out of {visitThreshold} stamps.";
        Console.WriteLine(message);
        return Task.CompletedTask;
    }

    public Task SendRewardAvailableAsync(string phoneNumber, string businessName, string rewardName, string? language = null)
    {
        var lang = _localizer.ResolveLanguage(language);
        var message = lang == "ar"
            ? $"[SMS] {phoneNumber}: لقد حصلت على {rewardName} لدى {businessName}! اطلب من الموظف الاستبدال في زيارتك القادمة."
            : $"[SMS] {phoneNumber}: You've earned a {rewardName} at {businessName}! Ask staff to redeem on your next visit.";
        Console.WriteLine(message);
        return Task.CompletedTask;
    }

    public Task SendRewardRedeemedAsync(string phoneNumber, string businessName, string rewardName, string? language = null)
    {
        var lang = _localizer.ResolveLanguage(language);
        var message = lang == "ar"
            ? $"[SMS] {phoneNumber}: استمتع بـ {rewardName}! تم بدء دورة ولاء جديدة لدى {businessName}."
            : $"[SMS] {phoneNumber}: Enjoy your {rewardName}! Your loyalty at {businessName} has restarted.";
        Console.WriteLine(message);
        return Task.CompletedTask;
    }

    public Task SendOtpAsync(string phoneNumber, string code, string purpose, string? language = null)
    {
        var lang = _localizer.ResolveLanguage(language);
        var message = lang == "ar"
            ? $"[SMS] {phoneNumber}: رمز {purpose} الخاص بك هو {code}."
            : $"[SMS] {phoneNumber}: Your {purpose} code is {code}.";
        Console.WriteLine(message);
        return Task.CompletedTask;
    }
}
