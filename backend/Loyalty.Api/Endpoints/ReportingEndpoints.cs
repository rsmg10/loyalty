using Loyalty.Api.Contracts;
using Loyalty.Api.Data;
using Loyalty.Api.Models;
using Loyalty.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Api.Endpoints;

public static class ReportingEndpoints
{
    public static void MapReportingEndpoints(this WebApplication app)
    {
        app.MapGet("/businesses/{businessId:int}/reports/overview", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetVendorOverviewAsync(businessId, range));
        });

        app.MapGet("/businesses/{businessId:int}/reports/customer-growth", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetCustomerGrowthReportAsync(businessId, range));
        });

        app.MapGet("/businesses/{businessId:int}/reports/customer-activity", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            var status = httpRequest.Query["status"].ToString();
            var sort = httpRequest.Query["sort"].ToString();
            var reward = httpRequest.Query["reward"].ToString();
            var (page, pageSize) = GetPaging(httpRequest);

            return Results.Ok(await reporting.GetCustomerActivityReportAsync(businessId, range, page, pageSize, status, sort, reward));
        });

        app.MapGet("/businesses/{businessId:int}/reports/stamp-issuance", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            var (page, pageSize) = GetPaging(httpRequest);
            var staffIdRaw = httpRequest.Query["staffId"].ToString();
            var staffId = int.TryParse(staffIdRaw, out var parsed) ? parsed : (int?)null;
            return Results.Ok(await reporting.GetStampIssuanceReportAsync(businessId, range, page, pageSize, staffId));
        });

        app.MapGet("/businesses/{businessId:int}/reports/redemptions", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            var (page, pageSize) = GetPaging(httpRequest);
            return Results.Ok(await reporting.GetRewardRedemptionReportAsync(businessId, range, page, pageSize));
        });

        app.MapGet("/businesses/{businessId:int}/reports/program-performance", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetProgramPerformanceReportAsync(businessId, range));
        });

        app.MapGet("/businesses/{businessId:int}/reports/progress-funnel", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetProgressFunnelReportAsync(businessId, range));
        });

        app.MapGet("/businesses/{businessId:int}/reports/top-customers", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            var sort = httpRequest.Query["sort"].ToString();
            var (page, pageSize) = GetPaging(httpRequest);
            return Results.Ok(await reporting.GetTopCustomersReportAsync(businessId, range, page, pageSize, sort));
        });

        app.MapGet("/businesses/{businessId:int}/reports/retention", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetRetentionReportAsync(businessId, range));
        });

        app.MapGet("/businesses/{businessId:int}/reports/time-activity", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetTimeActivityReportAsync(businessId, range));
        });

        app.MapGet("/businesses/{businessId:int}/reports/staff-activity", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetStaffActivityReportAsync(businessId, range));
        });

        app.MapGet("/businesses/{businessId:int}/reports/suspicious-activity", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            Microsoft.Extensions.Options.IOptions<ReportingOptions> reportingOptions,
            LocalizationService localizer) =>
        {
            var access = await RequireBusinessAccessAsync(businessId, httpRequest, db, localizer);
            if (access.Error is not null)
            {
                return access.Error;
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetSuspiciousActivityReportAsync(businessId, range, reportingOptions.Value));
        });

        app.MapGet("/admin/reports/overview", async (
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            IConfiguration configuration,
            LocalizationService localizer) =>
        {
            var session = await GetAuthSessionAsync(httpRequest, db);
            if (session is null)
            {
                return Results.Unauthorized();
            }

            if (!IsPlatformAdmin(session.PhoneNumber, configuration))
            {
                return Results.Forbid();
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            return Results.Ok(await reporting.GetPlatformOverviewReportAsync(range));
        });

        app.MapGet("/admin/reports/vendor-comparison", async (
            HttpRequest httpRequest,
            AppDbContext db,
            ReportingService reporting,
            IConfiguration configuration,
            LocalizationService localizer) =>
        {
            var session = await GetAuthSessionAsync(httpRequest, db);
            if (session is null)
            {
                return Results.Unauthorized();
            }

            if (!IsPlatformAdmin(session.PhoneNumber, configuration))
            {
                return Results.Forbid();
            }

            if (!TryGetReportRange(httpRequest, localizer, out var range, out var rangeError))
            {
                return rangeError!;
            }

            var sort = httpRequest.Query["sort"].ToString();
            var (page, pageSize) = GetPaging(httpRequest);

            return Results.Ok(await reporting.GetVendorComparisonReportAsync(range, page, pageSize, sort));
        });
    }

    private static bool TryGetReportRange(
        HttpRequest request,
        LocalizationService localizer,
        out ReportDateRange range,
        out IResult? error)
    {
        var startRaw = request.Query["start"].ToString();
        var endRaw = request.Query["end"].ToString();

        var now = DateTime.UtcNow;
        var parseStyles = System.Globalization.DateTimeStyles.AssumeUniversal
            | System.Globalization.DateTimeStyles.AdjustToUniversal;

        var end = string.IsNullOrWhiteSpace(endRaw)
            ? now
            : DateTime.TryParse(endRaw, System.Globalization.CultureInfo.InvariantCulture, parseStyles, out var endValue)
                ? endValue
                : now;

        var start = string.IsNullOrWhiteSpace(startRaw)
            ? end.AddDays(-30)
            : DateTime.TryParse(startRaw, System.Globalization.CultureInfo.InvariantCulture, parseStyles, out var startValue)
                ? startValue
                : end.AddDays(-30);

        if (start > end)
        {
            error = BadRequest(request, localizer, "Invalid date range");
            range = new ReportDateRange(end.AddDays(-30), end);
            return false;
        }

        range = new ReportDateRange(start, end);
        error = null;
        return true;
    }

    private static (int Page, int PageSize) GetPaging(HttpRequest request)
    {
        var pageValue = int.TryParse(request.Query["page"], out var pageParsed) ? pageParsed : 1;
        var sizeValue = int.TryParse(request.Query["pageSize"], out var sizeParsed) ? sizeParsed : 25;

        var page = Math.Max(pageValue, 1);
        var pageSize = Math.Clamp(sizeValue, 1, 100);

        return (page, pageSize);
    }

    private static bool IsPlatformAdmin(string phoneNumber, IConfiguration configuration)
    {
        var raw = configuration.GetValue<string>("Reporting:AdminPhones") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(raw))
        {
            return false;
        }

        var admins = raw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return admins.Any(admin => string.Equals(admin, phoneNumber, StringComparison.Ordinal));
    }

    private static async Task<(Business? Business, AuthSession? Session, IResult? Error)> RequireBusinessAccessAsync(
        int businessId,
        HttpRequest httpRequest,
        AppDbContext db,
        LocalizationService localizer)
    {
        var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
        if (business is null)
        {
            return (null, null, NotFound(httpRequest, localizer, "Business not found"));
        }

        var session = await GetAuthSessionAsync(httpRequest, db);
        if (session is null)
        {
            return (business, null, Results.Unauthorized());
        }

        var hasAccess = string.Equals(business.OwnerPhone, session.PhoneNumber, StringComparison.Ordinal)
            || await db.Staff.AnyAsync(s =>
                s.BusinessId == business.Id
                && s.PhoneNumber == session.PhoneNumber
                && s.Active);

        if (!hasAccess)
        {
            return (business, session, Results.Forbid());
        }

        return (business, session, null);
    }

    private static async Task<AuthSession?> GetAuthSessionAsync(HttpRequest request, AppDbContext db)
    {
        if (!request.Headers.TryGetValue("Authorization", out var headerValue))
        {
            return null;
        }

        var header = headerValue.ToString();
        if (!header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var token = header["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        return await db.AuthSessions
            .FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);
    }

    private static string GetRequestLanguage(HttpRequest request, LocalizationService localizer)
    {
        string? language = null;

        if (request.Query.TryGetValue("lang", out var queryValue))
        {
            language = queryValue.ToString();
        }

        if (string.IsNullOrWhiteSpace(language) && request.Headers.TryGetValue("X-Lang", out var headerValue))
        {
            language = headerValue.ToString();
        }

        if (string.IsNullOrWhiteSpace(language) && request.Headers.TryGetValue("Accept-Language", out var acceptLanguage))
        {
            language = acceptLanguage
                .ToString()
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault();
        }

        return localizer.ResolveLanguage(language);
    }

    private static IResult BadRequest(HttpRequest request, LocalizationService localizer, string key)
    {
        var language = GetRequestLanguage(request, localizer);
        var message = localizer.Translate(key, language);
        return Results.BadRequest(new { detail = message });
    }

    private static IResult NotFound(HttpRequest request, LocalizationService localizer, string key)
    {
        var language = GetRequestLanguage(request, localizer);
        var message = localizer.Translate(key, language);
        return Results.NotFound(new { detail = message });
    }
}
