using Loyalty.Api.Contracts;
using Loyalty.Api.Data;
using Loyalty.Api.Models;
using Loyalty.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=loyalty.db"));
builder.Services.AddScoped<IMessagingService, ConsoleMessagingService>();
builder.Services.AddScoped<OtpService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    EnsureLoyaltyCycleSnapshotColumns(db);
    EnsureCustomerMobileColumn(db);
    EnsureVisitStaffColumn(db);
}

var visitCooldownMinutes = builder.Configuration.GetValue("Loyalty:VisitCooldownMinutes", 5);

app.MapPost("/businesses", async (BusinessCreate request, HttpRequest httpRequest, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.OwnerPhone))
    {
        return Results.BadRequest(new { detail = "Name and owner phone are required" });
    }

    if (string.IsNullOrWhiteSpace(request.BusinessType))
    {
        return Results.BadRequest(new { detail = "Business type is required" });
    }

    var normalizedOwnerPhone = request.OwnerPhone.Trim();
    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!string.Equals(session.PhoneNumber, normalizedOwnerPhone, StringComparison.Ordinal))
    {
        return Results.Forbid();
    }

    var business = new Business
    {
        Name = request.Name.Trim(),
        OwnerPhone = normalizedOwnerPhone,
        BusinessType = request.BusinessType.Trim(),
    };
    db.Businesses.Add(business);
    await db.SaveChangesAsync();

    return Results.Ok(new BusinessResponse(business.Id, business.Name, business.OwnerPhone, business.CreatedAt));
});

app.MapPost("/onboarding", async (BusinessOnboardingRequest request, HttpRequest httpRequest, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.OwnerPhone))
    {
        return Results.BadRequest(new { detail = "Name and owner phone are required" });
    }

    if (string.IsNullOrWhiteSpace(request.BusinessType))
    {
        return Results.BadRequest(new { detail = "Business type is required" });
    }

    if (string.IsNullOrWhiteSpace(request.RewardName) || request.VisitThreshold <= 0)
    {
        return Results.BadRequest(new { detail = "Reward name and positive visit threshold are required" });
    }

    var normalizedOwnerPhone = request.OwnerPhone.Trim();
    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!string.Equals(session.PhoneNumber, normalizedOwnerPhone, StringComparison.Ordinal))
    {
        return Results.Forbid();
    }

    var business = new Business
    {
        Name = request.Name.Trim(),
        OwnerPhone = normalizedOwnerPhone,
        BusinessType = request.BusinessType.Trim(),
    };

    db.Businesses.Add(business);
    await db.SaveChangesAsync();

    var config = new LoyaltyConfig
    {
        BusinessId = business.Id,
        RewardName = request.RewardName.Trim(),
        VisitThreshold = request.VisitThreshold,
        OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim(),
        Active = true,
    };

    db.LoyaltyConfigs.Add(config);
    await db.SaveChangesAsync();

    return Results.Ok(new BusinessDetailResponse(
        business.Id,
        business.Name,
        business.OwnerPhone,
        business.BusinessType,
        business.CreatedAt,
        config.RewardName,
        config.VisitThreshold,
        config.OptionalNote));
});

app.MapPost("/businesses/{businessId:int}/loyalty-config", async (
    int businessId,
    LoyaltyConfigCreate request,
    HttpRequest httpRequest,
    AppDbContext db) =>
{
    var business = await db.Businesses.FindAsync(businessId);
    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!string.Equals(session.PhoneNumber, business.OwnerPhone, StringComparison.Ordinal))
    {
        return Results.Forbid();
    }

    if (string.IsNullOrWhiteSpace(request.RewardName) || request.VisitThreshold <= 0)
    {
        return Results.BadRequest(new { detail = "Reward name and positive visit threshold are required" });
    }

    var config = await db.LoyaltyConfigs
        .FirstOrDefaultAsync(c => c.BusinessId == businessId);

    if (config is null)
    {
        config = new LoyaltyConfig
        {
            BusinessId = businessId,
            RewardName = request.RewardName.Trim(),
            VisitThreshold = request.VisitThreshold,
            OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim(),
            Active = true,
        };

        db.LoyaltyConfigs.Add(config);
    }
    else
    {
        config.RewardName = request.RewardName.Trim();
        config.VisitThreshold = request.VisitThreshold;
        config.OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim();
        config.Active = true;
    }
    await db.SaveChangesAsync();

    return Results.Ok(new { id = config.Id });
});

app.MapPost("/businesses/{businessId:int}/visits", async (
    int businessId,
    CustomerLookup request,
    HttpRequest httpRequest,
    AppDbContext db,
    IMessagingService messagingService) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return Results.BadRequest(new { detail = "Business has no active loyalty configuration" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!await HasBusinessAccessAsync(db, business, session.PhoneNumber))
    {
        return Results.Forbid();
    }

    if (string.IsNullOrWhiteSpace(request.PhoneNumber))
    {
        return Results.BadRequest(new { detail = "Phone number is required" });
    }

    var normalizedPhone = request.PhoneNumber.Trim();

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone)
        ?? new Customer { PhoneNumber = normalizedPhone };

    if (customer.Id == 0)
    {
        db.Customers.Add(customer);
        await db.SaveChangesAsync();
    }

    var cycle = await db.LoyaltyCycles
        .FirstOrDefaultAsync(c => c.CustomerId == customer.Id && c.BusinessId == businessId)
        ?? new LoyaltyCycle { CustomerId = customer.Id, BusinessId = businessId, VisitCount = 0 };

    if (cycle.Id == 0)
    {
        SetCycleSnapshot(cycle, config);
        db.LoyaltyCycles.Add(cycle);
        await db.SaveChangesAsync();
    }
    else if (cycle.RewardNameSnapshot is null || cycle.VisitThresholdSnapshot is null)
    {
        EnsureCycleSnapshot(cycle, config);
        await db.SaveChangesAsync();
    }

    var rewardName = cycle.RewardNameSnapshot ?? config.RewardName;
    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;
    var staffId = await GetStaffIdForSessionAsync(db, business, session.PhoneNumber);

    if (cycle.Status != "REWARD_AVAILABLE" && cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
        await db.SaveChangesAsync();
    }

    var customerResponse = new CustomerResponse(
        customer.Id,
        customer.PhoneNumber,
        customer.MobileNumber,
        customer.DisplayName,
        customer.UsualOrder,
        customer.Notes);

    if (cycle.Status == "REWARD_AVAILABLE")
    {
        return Results.Ok(new VisitResponse(
            customerResponse,
            cycle.VisitCount,
            visitThreshold,
            true,
            rewardName));
    }

    var lastVisit = await db.Visits
        .Where(v => v.CustomerId == customer.Id && v.BusinessId == businessId)
        .OrderByDescending(v => v.CreatedAt)
        .FirstOrDefaultAsync();

    if (lastVisit is null || DateTime.UtcNow - lastVisit.CreatedAt >= TimeSpan.FromMinutes(visitCooldownMinutes))
    {
        cycle.VisitCount += 1;
        if (cycle.VisitCount >= visitThreshold)
        {
            cycle.Status = "REWARD_AVAILABLE";
        }

        db.Visits.Add(new Visit
        {
            CustomerId = customer.Id,
            BusinessId = businessId,
            StaffId = staffId,
        });
        await db.SaveChangesAsync();

        if (cycle.Status == "REWARD_AVAILABLE")
        {
            await messagingService.SendRewardAvailableAsync(
                customer.PhoneNumber,
                business.Name,
                rewardName);
        }
        else
        {
            await messagingService.SendVisitProgressAsync(
                customer.PhoneNumber,
                business.Name,
                cycle.VisitCount,
                visitThreshold);
        }
    }

    return Results.Ok(new VisitResponse(
        customerResponse,
        cycle.VisitCount,
        visitThreshold,
        cycle.Status == "REWARD_AVAILABLE",
        rewardName));
});

app.MapPost("/businesses/{businessId:int}/redemptions", async (
    int businessId,
    RedemptionRequest request,
    HttpRequest httpRequest,
    AppDbContext db,
    IMessagingService messagingService) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return Results.BadRequest(new { detail = "Business has no active loyalty configuration" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!await HasBusinessAccessAsync(db, business, session.PhoneNumber))
    {
        return Results.Forbid();
    }

    var sessionStaffId = await GetStaffIdForSessionAsync(db, business, session.PhoneNumber);
    if (request.StaffId is not null)
    {
        var staffExists = await db.Staff.AnyAsync(s =>
            s.Id == request.StaffId
            && s.BusinessId == businessId
            && s.Active);

        if (!staffExists)
        {
            return Results.BadRequest(new { detail = "Staff member not found" });
        }

        if (sessionStaffId is not null && request.StaffId != sessionStaffId)
        {
            return Results.Forbid();
        }
    }
    else if (sessionStaffId is not null)
    {
        request = request with { StaffId = sessionStaffId };
    }

    if (string.IsNullOrWhiteSpace(request.CustomerPhone))
    {
        return Results.BadRequest(new { detail = "Customer phone is required" });
    }

    var normalizedPhone = request.CustomerPhone.Trim();
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone);
    if (customer is null)
    {
        return Results.BadRequest(new { detail = "Customer not found" });
    }

    var cycle = await db.LoyaltyCycles
        .FirstOrDefaultAsync(c => c.CustomerId == customer.Id && c.BusinessId == businessId);

    if (cycle is null)
    {
        return Results.BadRequest(new { detail = "Reward not available" });
    }

    if (cycle.RewardNameSnapshot is null || cycle.VisitThresholdSnapshot is null)
    {
        EnsureCycleSnapshot(cycle, config);
    }

    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;
    if (cycle.Status != "REWARD_AVAILABLE" && cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
    }

    if (cycle.Status != "REWARD_AVAILABLE")
    {
        return Results.BadRequest(new { detail = "Reward not available" });
    }

    var redemptionRewardName = cycle.RewardNameSnapshot ?? config.RewardName;

    var redemption = new Redemption
    {
        CustomerId = customer.Id,
        BusinessId = businessId,
        RewardName = redemptionRewardName,
        StaffId = request.StaffId,
    };

    cycle.Status = "PROGRESSING";
    cycle.VisitCount = 0;
    SetCycleSnapshot(cycle, config);

    db.Redemptions.Add(redemption);
    await db.SaveChangesAsync();

    await messagingService.SendRewardRedeemedAsync(
        customer.PhoneNumber,
        business.Name,
        redemptionRewardName);

    return Results.Ok(new RedemptionResponse(redemption.RewardName, redemption.RedeemedAt, cycle.VisitCount));
});

app.MapGet("/businesses/{businessId:int}/customers/{phoneNumber}", async (
    int businessId,
    string phoneNumber,
    HttpRequest httpRequest,
    AppDbContext db) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return Results.BadRequest(new { detail = "Business has no active loyalty configuration" });
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.BadRequest(new { detail = "Phone number is required" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    var normalizedPhone = phoneNumber.Trim();
    var hasBusinessAccess = await HasBusinessAccessAsync(db, business, session.PhoneNumber);
    var isSelf = string.Equals(session.PhoneNumber, normalizedPhone, StringComparison.Ordinal);
    if (!hasBusinessAccess && !isSelf)
    {
        return Results.Forbid();
    }

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone);
    if (customer is null)
    {
        return Results.NotFound(new { detail = "Customer not found" });
    }

    var cycle = await db.LoyaltyCycles
        .FirstOrDefaultAsync(c => c.CustomerId == customer.Id && c.BusinessId == businessId);

    if (cycle is null)
    {
        cycle = new LoyaltyCycle { CustomerId = customer.Id, BusinessId = businessId, VisitCount = 0 };
        SetCycleSnapshot(cycle, config);
        db.LoyaltyCycles.Add(cycle);
        await db.SaveChangesAsync();
    }
    else if (cycle.RewardNameSnapshot is null || cycle.VisitThresholdSnapshot is null)
    {
        EnsureCycleSnapshot(cycle, config);
        await db.SaveChangesAsync();
    }

    var rewardName = cycle.RewardNameSnapshot ?? config.RewardName;
    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;
    var optionalNote = cycle.OptionalNoteSnapshot ?? config.OptionalNote;

    return Results.Ok(new CustomerStatusResponse(
        business.Name,
        rewardName,
        cycle.VisitCount,
        visitThreshold,
        optionalNote));
});

app.MapPut("/businesses/{businessId:int}/customers/{phoneNumber}/profile", async (
    int businessId,
    string phoneNumber,
    CustomerProfileUpdate request,
    HttpRequest httpRequest,
    AppDbContext db) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!await HasBusinessAccessAsync(db, business, session.PhoneNumber))
    {
        return Results.Forbid();
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.BadRequest(new { detail = "Phone number is required" });
    }

    var normalizedPhone = phoneNumber.Trim();
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone)
        ?? new Customer { PhoneNumber = normalizedPhone };

    customer.DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? null : request.DisplayName.Trim();
    customer.MobileNumber = string.IsNullOrWhiteSpace(request.MobileNumber) ? null : request.MobileNumber.Trim();
    customer.UsualOrder = string.IsNullOrWhiteSpace(request.UsualOrder) ? null : request.UsualOrder.Trim();
    customer.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

    if (customer.Id == 0)
    {
        db.Customers.Add(customer);
    }

    await db.SaveChangesAsync();

    return Results.Ok(new CustomerResponse(
        customer.Id,
        customer.PhoneNumber,
        customer.MobileNumber,
        customer.DisplayName,
        customer.UsualOrder,
        customer.Notes));
});

app.MapGet("/businesses/{businessId:int}/customers/{phoneNumber}/visits", async (
    int businessId,
    string phoneNumber,
    HttpRequest httpRequest,
    AppDbContext db) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.BadRequest(new { detail = "Phone number is required" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    var normalizedPhone = phoneNumber.Trim();
    var hasBusinessAccess = await HasBusinessAccessAsync(db, business, session.PhoneNumber);
    var isSelf = string.Equals(session.PhoneNumber, normalizedPhone, StringComparison.Ordinal);
    if (!hasBusinessAccess && !isSelf)
    {
        return Results.Forbid();
    }

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone);
    if (customer is null)
    {
        return Results.NotFound(new { detail = "Customer not found" });
    }

    var visits = await db.Visits
        .Where(v => v.CustomerId == customer.Id && v.BusinessId == businessId)
        .OrderByDescending(v => v.CreatedAt)
        .Select(v => new VisitHistoryItem(v.CreatedAt))
        .ToListAsync();

    return Results.Ok(visits);
});

app.MapGet("/businesses/{businessId:int}/redemptions", async (
    int businessId,
    HttpRequest httpRequest,
    AppDbContext db) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!string.Equals(session.PhoneNumber, business.OwnerPhone, StringComparison.Ordinal))
    {
        return Results.Forbid();
    }

    var redemptions = await db.Redemptions
        .Where(r => r.BusinessId == businessId)
        .OrderByDescending(r => r.RedeemedAt)
        .Select(r => new RedemptionSummary(
            r.Id,
            r.CustomerId,
            r.RewardName,
            r.RedeemedAt,
            r.StaffId))
        .ToListAsync();

    return Results.Ok(redemptions);
});

app.MapPost("/auth/request-otp", async (
    AuthRequestOtp request,
    OtpService otpService) =>
{
    if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Purpose))
    {
        return Results.BadRequest(new { detail = "Phone number and purpose are required" });
    }

    var normalizedPhone = request.PhoneNumber.Trim();
    var purpose = request.Purpose.Trim();

    await otpService.RequestOtpAsync(normalizedPhone, purpose);

    return Results.Ok(new { status = "sent" });
});

app.MapPost("/auth/verify-otp", async (
    AuthVerifyOtp request,
    OtpService otpService) =>
{
    if (string.IsNullOrWhiteSpace(request.PhoneNumber)
        || string.IsNullOrWhiteSpace(request.Purpose)
        || string.IsNullOrWhiteSpace(request.Code))
    {
        return Results.BadRequest(new { detail = "Phone number, purpose, and code are required" });
    }

    var normalizedPhone = request.PhoneNumber.Trim();
    var purpose = request.Purpose.Trim();
    var code = request.Code.Trim();

    var session = await otpService.VerifyOtpAsync(normalizedPhone, code, purpose);
    if (session is null)
    {
        return Results.BadRequest(new { detail = "Invalid or expired code" });
    }

    return Results.Ok(new AuthTokenResponse(session.Token, session.ExpiresAt));
});

app.MapGet("/me", async (HttpRequest httpRequest, AppDbContext db) =>
{
    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    var ownerBusinesses = await db.Businesses
        .Where(b => b.OwnerPhone == session.PhoneNumber)
        .OrderBy(b => b.Name)
        .Select(b => new BusinessSummary(b.Id, b.Name, b.BusinessType))
        .ToListAsync();

    var staffBusinessIds = await db.Staff
        .Where(s => s.PhoneNumber == session.PhoneNumber && s.Active)
        .Select(s => s.BusinessId)
        .Distinct()
        .ToListAsync();

    var staffBusinesses = staffBusinessIds.Count == 0
        ? []
        : await db.Businesses
            .Where(b => staffBusinessIds.Contains(b.Id))
            .OrderBy(b => b.Name)
            .Select(b => new BusinessSummary(b.Id, b.Name, b.BusinessType))
            .ToListAsync();

    return Results.Ok(new AuthMeResponse(session.PhoneNumber, ownerBusinesses, staffBusinesses));
});

app.MapPost("/businesses/{businessId:int}/staff", async (
    int businessId,
    StaffCreate request,
    HttpRequest httpRequest,
    AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.DisplayName) || string.IsNullOrWhiteSpace(request.PhoneNumber))
    {
        return Results.BadRequest(new { detail = "Display name and phone number are required" });
    }

    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!string.Equals(session.PhoneNumber, business.OwnerPhone, StringComparison.Ordinal))
    {
        return Results.Forbid();
    }

    var staff = new Staff
    {
        BusinessId = businessId,
        DisplayName = request.DisplayName.Trim(),
        PhoneNumber = request.PhoneNumber.Trim(),
        Active = true,
    };

    db.Staff.Add(staff);
    await db.SaveChangesAsync();

    return Results.Ok(new StaffResponse(
        staff.Id,
        staff.DisplayName,
        staff.PhoneNumber,
        staff.Active,
        staff.CreatedAt));
});

app.MapGet("/businesses/{businessId:int}/staff", async (
    int businessId,
    HttpRequest httpRequest,
    AppDbContext db) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!string.Equals(session.PhoneNumber, business.OwnerPhone, StringComparison.Ordinal))
    {
        return Results.Forbid();
    }

    var staffMembers = await db.Staff
        .Where(s => s.BusinessId == businessId)
        .OrderByDescending(s => s.CreatedAt)
        .Select(s => new StaffResponse(
            s.Id,
            s.DisplayName,
            s.PhoneNumber,
            s.Active,
            s.CreatedAt))
        .ToListAsync();

    return Results.Ok(staffMembers);
});

app.MapGet("/businesses/{businessId:int}", async (int businessId, HttpRequest httpRequest, AppDbContext db) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    var session = await GetAuthSessionAsync(httpRequest, db);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    if (!string.Equals(session.PhoneNumber, business.OwnerPhone, StringComparison.Ordinal))
    {
        return Results.Forbid();
    }

    if (business.LoyaltyConfig is null || !business.LoyaltyConfig.Active)
    {
        return Results.BadRequest(new { detail = "Business has no active loyalty configuration" });
    }

    return Results.Ok(new BusinessDetailResponse(
        business.Id,
        business.Name,
        business.OwnerPhone,
        business.BusinessType,
        business.CreatedAt,
        business.LoyaltyConfig.RewardName,
        business.LoyaltyConfig.VisitThreshold,
        business.LoyaltyConfig.OptionalNote));
});

app.Run();

static void EnsureLoyaltyCycleSnapshotColumns(AppDbContext db)
{
    var tableName = db.Model.FindEntityType(typeof(LoyaltyCycle))?.GetTableName() ?? "LoyaltyCycles";
    TryAddColumn(db, tableName, "RewardNameSnapshot TEXT");
    TryAddColumn(db, tableName, "VisitThresholdSnapshot INTEGER");
    TryAddColumn(db, tableName, "OptionalNoteSnapshot TEXT");
}

static void EnsureCustomerMobileColumn(AppDbContext db)
{
    var tableName = db.Model.FindEntityType(typeof(Customer))?.GetTableName() ?? "Customers";
    TryAddColumn(db, tableName, "MobileNumber TEXT");
}

static void EnsureVisitStaffColumn(AppDbContext db)
{
    var tableName = db.Model.FindEntityType(typeof(Visit))?.GetTableName() ?? "Visits";
    TryAddColumn(db, tableName, "StaffId INTEGER");
}

static async Task<AuthSession?> GetAuthSessionAsync(HttpRequest request, AppDbContext db)
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

static async Task<bool> HasBusinessAccessAsync(AppDbContext db, Business business, string phoneNumber)
{
    if (string.Equals(business.OwnerPhone, phoneNumber, StringComparison.Ordinal))
    {
        return true;
    }

    return await db.Staff.AnyAsync(s =>
        s.BusinessId == business.Id
        && s.PhoneNumber == phoneNumber
        && s.Active);
}

static async Task<int?> GetStaffIdForSessionAsync(AppDbContext db, Business business, string phoneNumber)
{
    if (string.Equals(business.OwnerPhone, phoneNumber, StringComparison.Ordinal))
    {
        return null;
    }

    return await db.Staff
        .Where(s => s.BusinessId == business.Id && s.PhoneNumber == phoneNumber && s.Active)
        .Select(s => (int?)s.Id)
        .FirstOrDefaultAsync();
}

static void TryAddColumn(AppDbContext db, string tableName, string columnDefinition)
{
    try
    {
        var sql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnDefinition + ";";
        db.Database.ExecuteSqlRaw(sql);
    }
    catch (SqliteException ex) when (ex.SqliteErrorCode == 1
        && ex.Message.Contains("duplicate column name", StringComparison.OrdinalIgnoreCase))
    {
        // Column already exists.
    }
}

static void SetCycleSnapshot(LoyaltyCycle cycle, LoyaltyConfig config)
{
    cycle.RewardNameSnapshot = config.RewardName;
    cycle.VisitThresholdSnapshot = config.VisitThreshold;
    cycle.OptionalNoteSnapshot = config.OptionalNote;
}

static void EnsureCycleSnapshot(LoyaltyCycle cycle, LoyaltyConfig config)
{
    cycle.RewardNameSnapshot ??= config.RewardName;
    cycle.VisitThresholdSnapshot ??= config.VisitThreshold;
    cycle.OptionalNoteSnapshot ??= config.OptionalNote;
}
