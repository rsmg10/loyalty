using Loyalty.Api.Contracts;
using Loyalty.Api.Data;
using Loyalty.Api.Models;
using Loyalty.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Api.Endpoints;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        app.MapGet("/admin/businesses", async (
            HttpRequest httpRequest,
            AppDbContext db,
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

            var search = httpRequest.Query["search"].ToString();
            var (page, pageSize) = GetPaging(httpRequest);

            var query = db.Businesses
                .Include(b => b.LoyaltyConfig)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(b =>
                    b.Name.Contains(term)
                    || b.OwnerPhone.Contains(term));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new AdminBusinessSummary(
                    b.Id,
                    b.Name,
                    b.OwnerPhone,
                    b.BusinessType,
                    b.CreatedAt,
                    b.LoyaltyConfig != null,
                    b.LoyaltyConfig == null || b.LoyaltyConfig.Active))
                .ToListAsync();

            return Results.Ok(new PagedResponse<AdminBusinessSummary>(items, page, pageSize, total));
        });

        app.MapGet("/admin/businesses/{businessId:int}", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
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

            var business = await db.Businesses
                .Include(b => b.LoyaltyConfig)
                .FirstOrDefaultAsync(b => b.Id == businessId);

            if (business is null)
            {
                return NotFound(httpRequest, localizer, "Business not found");
            }

            var config = business.LoyaltyConfig;

            return Results.Ok(new AdminBusinessDetail(
                business.Id,
                business.Name,
                business.OwnerPhone,
                business.BusinessType,
                business.CreatedAt,
                config != null,
                config == null || config.Active,
                config?.ProgramName,
                config?.ProgramDescription,
                config?.RewardName,
                config?.VisitThreshold,
                config?.OptionalNote,
                config?.StampExpirationDays));
        });

        app.MapPost("/admin/businesses", async (
            BusinessOnboardingRequest request,
            HttpRequest httpRequest,
            AppDbContext db,
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

            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.OwnerPhone))
            {
                return BadRequest(httpRequest, localizer, "Name and owner phone are required");
            }

            if (string.IsNullOrWhiteSpace(request.BusinessType))
            {
                return BadRequest(httpRequest, localizer, "Business type is required");
            }

            if (string.IsNullOrWhiteSpace(request.ProgramName)
                || string.IsNullOrWhiteSpace(request.RewardName)
                || request.VisitThreshold <= 0)
            {
                return BadRequest(httpRequest, localizer, "Program name, reward name, and positive stamp threshold are required");
            }

            if (request.StampExpirationDays is not null && request.StampExpirationDays <= 0)
            {
                return BadRequest(httpRequest, localizer, "Stamp expiration days must be positive when provided");
            }

            var business = new Business
            {
                Name = request.Name.Trim(),
                OwnerPhone = request.OwnerPhone.Trim(),
                BusinessType = request.BusinessType.Trim(),
            };

            db.Businesses.Add(business);
            await db.SaveChangesAsync();

            var config = new LoyaltyConfig
            {
                BusinessId = business.Id,
                ProgramName = request.ProgramName.Trim(),
                ProgramDescription = string.IsNullOrWhiteSpace(request.ProgramDescription) ? null : request.ProgramDescription.Trim(),
                RewardName = request.RewardName.Trim(),
                VisitThreshold = request.VisitThreshold,
                OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim(),
                StampExpirationDays = request.StampExpirationDays,
                Active = true
            };

            db.LoyaltyConfigs.Add(config);
            await db.SaveChangesAsync();

            return Results.Ok(new AdminBusinessDetail(
                business.Id,
                business.Name,
                business.OwnerPhone,
                business.BusinessType,
                business.CreatedAt,
                true,
                true,
                config.ProgramName,
                config.ProgramDescription,
                config.RewardName,
                config.VisitThreshold,
                config.OptionalNote,
                config.StampExpirationDays));
        });

        app.MapPut("/admin/businesses/{businessId:int}", async (
            int businessId,
            AdminBusinessUpdate request,
            HttpRequest httpRequest,
            AppDbContext db,
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

            var business = await db.Businesses
                .Include(b => b.LoyaltyConfig)
                .FirstOrDefaultAsync(b => b.Id == businessId);

            if (business is null)
            {
                return NotFound(httpRequest, localizer, "Business not found");
            }

            var updated = false;
            var oldOwnerPhone = business.OwnerPhone;

            if (request.Name is not null)
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return BadRequest(httpRequest, localizer, "Business name is required");
                }
                business.Name = request.Name.Trim();
                updated = true;
            }

            if (request.OwnerPhone is not null)
            {
                if (string.IsNullOrWhiteSpace(request.OwnerPhone))
                {
                    return BadRequest(httpRequest, localizer, "Owner phone is required");
                }
                business.OwnerPhone = request.OwnerPhone.Trim();
                updated = true;
            }

            if (request.BusinessType is not null)
            {
                if (string.IsNullOrWhiteSpace(request.BusinessType))
                {
                    return BadRequest(httpRequest, localizer, "Business type is required");
                }
                business.BusinessType = request.BusinessType.Trim();
                updated = true;
            }

            var config = business.LoyaltyConfig;
            var hasConfigUpdate = request.ProgramActive is not null
                || request.ProgramName is not null
                || request.ProgramDescription is not null
                || request.RewardName is not null
                || request.VisitThreshold is not null
                || request.OptionalNote is not null
                || request.StampExpirationDays is not null;

            if (config is null && hasConfigUpdate)
            {
                if (string.IsNullOrWhiteSpace(request.ProgramName)
                    || string.IsNullOrWhiteSpace(request.RewardName)
                    || request.VisitThreshold is null
                    || request.VisitThreshold <= 0)
                {
                    return BadRequest(httpRequest, localizer, "Program name, reward name, and positive stamp threshold are required");
                }

                config = new LoyaltyConfig
                {
                    BusinessId = business.Id,
                    ProgramName = request.ProgramName.Trim(),
                    ProgramDescription = string.IsNullOrWhiteSpace(request.ProgramDescription) ? null : request.ProgramDescription.Trim(),
                    RewardName = request.RewardName.Trim(),
                    VisitThreshold = request.VisitThreshold.Value,
                    OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim(),
                    StampExpirationDays = request.StampExpirationDays,
                    Active = request.ProgramActive ?? true
                };

                db.LoyaltyConfigs.Add(config);
                updated = true;
            }
            else if (config is not null && hasConfigUpdate)
            {
                if (request.ProgramName is not null)
                {
                    if (string.IsNullOrWhiteSpace(request.ProgramName))
                    {
                        return BadRequest(httpRequest, localizer, "Program name is required");
                    }
                    config.ProgramName = request.ProgramName.Trim();
                    updated = true;
                }

                if (request.ProgramDescription is not null)
                {
                    config.ProgramDescription = string.IsNullOrWhiteSpace(request.ProgramDescription)
                        ? null
                        : request.ProgramDescription.Trim();
                    updated = true;
                }

                if (request.RewardName is not null)
                {
                    if (string.IsNullOrWhiteSpace(request.RewardName))
                    {
                        return BadRequest(httpRequest, localizer, "Reward name is required");
                    }
                    config.RewardName = request.RewardName.Trim();
                    updated = true;
                }

                if (request.VisitThreshold is not null)
                {
                    if (request.VisitThreshold <= 0)
                    {
                        return BadRequest(httpRequest, localizer, "Stamp threshold must be positive");
                    }
                    config.VisitThreshold = request.VisitThreshold.Value;
                    updated = true;
                }

                if (request.OptionalNote is not null)
                {
                    config.OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote)
                        ? null
                        : request.OptionalNote.Trim();
                    updated = true;
                }

                if (request.StampExpirationDays is not null)
                {
                    if (request.StampExpirationDays <= 0)
                    {
                        return BadRequest(httpRequest, localizer, "Stamp expiration days must be positive");
                    }
                    config.StampExpirationDays = request.StampExpirationDays;
                    updated = true;
                }

                if (request.ProgramActive is not null)
                {
                    config.Active = request.ProgramActive.Value;
                    updated = true;
                }
            }

            if (updated)
            {
                await db.SaveChangesAsync();
            }

            if (!string.Equals(oldOwnerPhone, business.OwnerPhone, StringComparison.Ordinal))
            {
                var sessions = await db.AuthSessions
                    .Where(s => s.PhoneNumber == oldOwnerPhone)
                    .ToListAsync();
                if (sessions.Count > 0)
                {
                    db.AuthSessions.RemoveRange(sessions);
                    await db.SaveChangesAsync();
                }
            }

            var currentConfig = config ?? business.LoyaltyConfig;

            return Results.Ok(new AdminBusinessDetail(
                business.Id,
                business.Name,
                business.OwnerPhone,
                business.BusinessType,
                business.CreatedAt,
                currentConfig != null,
                currentConfig == null || currentConfig.Active,
                currentConfig?.ProgramName,
                currentConfig?.ProgramDescription,
                currentConfig?.RewardName,
                currentConfig?.VisitThreshold,
                currentConfig?.OptionalNote,
                currentConfig?.StampExpirationDays));
        });

        app.MapGet("/admin/businesses/{businessId:int}/staff-users", async (
            int businessId,
            HttpRequest httpRequest,
            AppDbContext db,
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

            var businessExists = await db.Businesses.AnyAsync(b => b.Id == businessId);
            if (!businessExists)
            {
                return NotFound(httpRequest, localizer, "Business not found");
            }

            var staffMembers = await db.Staff
                .Where(s => s.BusinessId == businessId && s.NormalizedUsername != null)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new StaffUserResponse(
                    s.Id,
                    s.DisplayName,
                    s.Username ?? string.Empty,
                    s.Active,
                    s.CreatedAt))
                .ToListAsync();

            return Results.Ok(staffMembers);
        });

        app.MapPost("/admin/businesses/{businessId:int}/staff-users", async (
            int businessId,
            StaffUserCreate request,
            HttpRequest httpRequest,
            AppDbContext db,
            IConfiguration configuration,
            LocalizationService localizer) =>
        {
            if (string.IsNullOrWhiteSpace(request.DisplayName)
                || string.IsNullOrWhiteSpace(request.Username)
                || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(httpRequest, localizer, "Display name, username, and password are required");
            }

            var session = await GetAuthSessionAsync(httpRequest, db);
            if (session is null)
            {
                return Results.Unauthorized();
            }

            if (!IsPlatformAdmin(session.PhoneNumber, configuration))
            {
                return Results.Forbid();
            }

            var businessExists = await db.Businesses.AnyAsync(b => b.Id == businessId);
            if (!businessExists)
            {
                return NotFound(httpRequest, localizer, "Business not found");
            }

            var username = request.Username.Trim();
            var normalizedUsername = username.ToLowerInvariant();
            if (!IsValidStaffUsername(username))
            {
                return BadRequest(httpRequest, localizer, "Username must be 3-40 chars and use letters, numbers, dot, underscore, or hyphen");
            }

            var usernameExists = await db.Staff.AnyAsync(s => s.NormalizedUsername == normalizedUsername);
            if (usernameExists)
            {
                return BadRequest(httpRequest, localizer, "Username already exists");
            }

            var password = request.Password.Trim();
            if (password.Length < 8)
            {
                return BadRequest(httpRequest, localizer, "Password must be at least 8 characters");
            }

            var (hash, salt) = PasswordHasher.Hash(password);

            var staff = new Staff
            {
                BusinessId = businessId,
                DisplayName = request.DisplayName.Trim(),
                Username = username,
                NormalizedUsername = normalizedUsername,
                PasswordHash = hash,
                PasswordSalt = salt,
                PhoneNumber = BuildInternalStaffPhone(businessId, normalizedUsername),
                Active = true
            };

            db.Staff.Add(staff);
            await db.SaveChangesAsync();

            return Results.Ok(new StaffUserResponse(
                staff.Id,
                staff.DisplayName,
                staff.Username,
                staff.Active,
                staff.CreatedAt));
        });

        app.MapPut("/admin/businesses/{businessId:int}/staff-users/{staffId:int}/status", async (
            int businessId,
            int staffId,
            StaffUserStatusUpdate request,
            HttpRequest httpRequest,
            AppDbContext db,
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

            var staff = await db.Staff
                .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.Id == staffId && s.NormalizedUsername != null);
            if (staff is null)
            {
                return NotFound(httpRequest, localizer, "Staff not found");
            }

            staff.Active = request.Active;
            await db.SaveChangesAsync();

            return Results.Ok(new StaffUserResponse(
                staff.Id,
                staff.DisplayName,
                staff.Username ?? string.Empty,
                staff.Active,
                staff.CreatedAt));
        });

        app.MapPut("/admin/businesses/{businessId:int}/staff-users/{staffId:int}/password", async (
            int businessId,
            int staffId,
            StaffUserPasswordUpdate request,
            HttpRequest httpRequest,
            AppDbContext db,
            IConfiguration configuration,
            LocalizationService localizer) =>
        {
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(httpRequest, localizer, "Password is required");
            }

            var session = await GetAuthSessionAsync(httpRequest, db);
            if (session is null)
            {
                return Results.Unauthorized();
            }

            if (!IsPlatformAdmin(session.PhoneNumber, configuration))
            {
                return Results.Forbid();
            }

            var staff = await db.Staff
                .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.Id == staffId && s.NormalizedUsername != null);
            if (staff is null)
            {
                return NotFound(httpRequest, localizer, "Staff not found");
            }

            var password = request.Password.Trim();
            if (password.Length < 8)
            {
                return BadRequest(httpRequest, localizer, "Password must be at least 8 characters");
            }

            var (hash, salt) = PasswordHasher.Hash(password);
            staff.PasswordHash = hash;
            staff.PasswordSalt = salt;
            await db.SaveChangesAsync();

            return Results.Ok(new StaffUserResponse(
                staff.Id,
                staff.DisplayName,
                staff.Username ?? string.Empty,
                staff.Active,
                staff.CreatedAt));
        });
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

        var allowed = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return allowed.Any(value => string.Equals(value, phoneNumber, StringComparison.Ordinal));
    }

    private static string BuildInternalStaffPhone(int businessId, string normalizedUsername)
    {
        return $"staff:{businessId}:{normalizedUsername}";
    }

    private static bool IsValidStaffUsername(string username)
    {
        if (username.Length is < 3 or > 40)
        {
            return false;
        }

        foreach (var ch in username)
        {
            var isAllowed = char.IsLetterOrDigit(ch) || ch is '.' or '_' or '-';
            if (!isAllowed)
            {
                return false;
            }
        }

        return true;
    }

    private static IResult BadRequest(HttpRequest request, LocalizationService localizer, string key)
    {
        var language = request.Query["lang"].ToString();
        var message = localizer.Translate(key, language);
        return Results.BadRequest(new { detail = message });
    }

    private static IResult NotFound(HttpRequest request, LocalizationService localizer, string key)
    {
        var language = request.Query["lang"].ToString();
        var message = localizer.Translate(key, language);
        return Results.NotFound(new { detail = message });
    }
}
