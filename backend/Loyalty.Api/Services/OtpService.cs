using Loyalty.Api.Data;
using Loyalty.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Loyalty.Api.Services;

public sealed class OtpService
{
    private readonly AppDbContext _db;
    private readonly IMessagingService _messagingService;
    private readonly OtpOptions _options;
    private readonly TimeSpan _otpTtl = TimeSpan.FromMinutes(10);

    public OtpService(AppDbContext db, IMessagingService messagingService, IOptions<OtpOptions> options)
    {
        _db = db;
        _messagingService = messagingService;
        _options = options.Value;
    }

    public async Task RequestOtpAsync(string phoneNumber, string purpose, string? language = null)
    {
        var code = string.IsNullOrWhiteSpace(_options.FixedCode)
            ? GenerateCode()
            : _options.FixedCode.Trim();
        var otp = new AuthOtp
        {
            PhoneNumber = phoneNumber,
            Code = code,
            Purpose = purpose,
            ExpiresAt = DateTime.UtcNow.Add(_otpTtl),
        };

        _db.AuthOtps.Add(otp);
        await _db.SaveChangesAsync();
        await _messagingService.SendOtpAsync(phoneNumber, code, purpose, language);
    }

    public async Task<AuthSession?> VerifyOtpAsync(string phoneNumber, string code, string purpose)
    {
        var otp = await _db.AuthOtps
            .Where(o => o.PhoneNumber == phoneNumber && o.Purpose == purpose && o.ConsumedAt == null)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null || otp.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        if (!string.Equals(otp.Code, code, StringComparison.Ordinal))
        {
            return null;
        }

        otp.ConsumedAt = DateTime.UtcNow;

        var session = new AuthSession
        {
            PhoneNumber = phoneNumber,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddHours(12),
        };

        _db.AuthSessions.Add(session);
        await _db.SaveChangesAsync();

        return session;
    }

    private static string GenerateCode()
    {
        var value = Random.Shared.Next(100000, 999999);
        return value.ToString();
    }
}
