using Loyalty.Api.Contracts;
using Loyalty.Api.Data;
using Loyalty.Api.Endpoints;
using Loyalty.Api.Models;
using Loyalty.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IMessagingService, ConsoleMessagingService>();
builder.Services.AddScoped<OtpService>();
builder.Services.AddSingleton<LocalizationService>();
builder.Services.AddScoped<ReportingService>();
builder.Services.Configure<ReportingOptions>(builder.Configuration.GetSection("Reporting"));
builder.Services.Configure<ObjectStorageOptions>(builder.Configuration.GetSection("ObjectStorage"));
builder.Services.AddSingleton<IObjectStorage>(sp =>
{
    var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<ObjectStorageOptions>>().Value;
    return new MinioObjectStorage(options);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    var seedEnabled = builder.Configuration.GetValue("Seed:Enabled", false);
    if (seedEnabled)
    {
        await SeedData.SeedAsync(db);
    }
}

var visitCooldownMinutes = builder.Configuration.GetValue("Loyalty:VisitCooldownMinutes", 5);

app.MapPost("/businesses", async (BusinessCreate request, HttpRequest httpRequest, AppDbContext db, LocalizationService localizer) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.OwnerPhone))
    {
        return BadRequest(httpRequest, localizer, "Name and owner phone are required");
    }

    if (string.IsNullOrWhiteSpace(request.BusinessType))
    {
        return BadRequest(httpRequest, localizer, "Business type is required");
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

app.MapPost("/onboarding", async (BusinessOnboardingRequest request, HttpRequest httpRequest, AppDbContext db, LocalizationService localizer) =>
{
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
        ProgramName = request.ProgramName.Trim(),
        ProgramDescription = string.IsNullOrWhiteSpace(request.ProgramDescription) ? null : request.ProgramDescription.Trim(),
        RewardName = request.RewardName.Trim(),
        VisitThreshold = request.VisitThreshold,
        OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim(),
        StampExpirationDays = request.StampExpirationDays,
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
        config.ProgramName,
        config.ProgramDescription,
        config.ProgramIconUrl,
        config.RewardName,
        config.RewardImageUrl,
        config.VisitThreshold,
        config.OptionalNote,
        config.StampExpirationDays));
});

app.MapPost("/businesses/{businessId:int}/loyalty-config", async (
    int businessId,
    LoyaltyConfigCreate request,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FindAsync(businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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

    var config = await db.LoyaltyConfigs
        .FirstOrDefaultAsync(c => c.BusinessId == businessId);

    if (config is null)
    {
        config = new LoyaltyConfig
        {
            BusinessId = businessId,
            ProgramName = request.ProgramName.Trim(),
            ProgramDescription = string.IsNullOrWhiteSpace(request.ProgramDescription) ? null : request.ProgramDescription.Trim(),
            RewardName = request.RewardName.Trim(),
            VisitThreshold = request.VisitThreshold,
            OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim(),
            StampExpirationDays = request.StampExpirationDays,
            Active = true,
        };

        db.LoyaltyConfigs.Add(config);
    }
    else
    {
        config.ProgramName = request.ProgramName.Trim();
        config.ProgramDescription = string.IsNullOrWhiteSpace(request.ProgramDescription) ? null : request.ProgramDescription.Trim();
        config.RewardName = request.RewardName.Trim();
        config.VisitThreshold = request.VisitThreshold;
        config.OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim();
        config.StampExpirationDays = request.StampExpirationDays;
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
    IMessagingService messagingService,
    LocalizationService localizer) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return BadRequest(httpRequest, localizer, "Business has no active loyalty configuration");
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
        return BadRequest(httpRequest, localizer, "Phone number is required");
    }

    var normalizedPhone = request.PhoneNumber.Trim();

    var customer = await GetOrCreateCustomerAsync(db, normalizedPhone);
    var cycle = await GetOrCreateCycleAsync(db, businessId, customer, config);

    var now = DateTime.UtcNow;
    var expirationApplied = ApplyExpirationRules(cycle, config, now);

    var rewardName = cycle.RewardNameSnapshot ?? config.RewardName;
    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;
    var staffId = await GetStaffIdForSessionAsync(db, business, session.PhoneNumber);

    if (cycle.Status != "REWARD_AVAILABLE" && cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
        cycle.RewardAvailableAt ??= now;
        expirationApplied = true;
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
        if (expirationApplied)
        {
            await db.SaveChangesAsync();
        }

        return Results.Ok(new VisitResponse(
            customerResponse,
            cycle.VisitCount,
            visitThreshold,
            true,
            rewardName));
    }

    var lastStamp = await db.StampTransactions
        .Where(t => t.CustomerId == customer.Id
            && t.BusinessId == businessId
            && t.Reason == "purchase")
        .OrderByDescending(t => t.IssuedAt)
        .FirstOrDefaultAsync();

    if (lastStamp is null || now - lastStamp.IssuedAt >= TimeSpan.FromMinutes(visitCooldownMinutes))
    {
        cycle.VisitCount += 1;
        cycle.LastStampAt = now;
        if (cycle.VisitCount >= visitThreshold)
        {
            cycle.Status = "REWARD_AVAILABLE";
            cycle.RewardAvailableAt ??= now;
        }

        db.StampTransactions.Add(new StampTransaction
        {
            CustomerId = customer.Id,
            BusinessId = businessId,
            Quantity = 1,
            Reason = "purchase",
            StaffId = staffId,
            IssuedByPhone = session.PhoneNumber,
            IssuedAt = now,
        });

        await db.SaveChangesAsync();

        var language = GetRequestLanguage(httpRequest, localizer);
        if (cycle.Status == "REWARD_AVAILABLE")
        {
            await messagingService.SendRewardAvailableAsync(
                customer.PhoneNumber,
                business.Name,
                rewardName,
                language);
        }
        else
        {
            await messagingService.SendVisitProgressAsync(
                customer.PhoneNumber,
                business.Name,
                cycle.VisitCount,
                visitThreshold,
                language);
        }
    }
    else if (expirationApplied)
    {
        await db.SaveChangesAsync();
    }

    return Results.Ok(new VisitResponse(
        customerResponse,
        cycle.VisitCount,
        visitThreshold,
        cycle.Status == "REWARD_AVAILABLE",
        rewardName));
});

app.MapPost("/businesses/{businessId:int}/stamps", async (
    int businessId,
    StampIssueRequest request,
    HttpRequest httpRequest,
    AppDbContext db,
    IMessagingService messagingService,
    LocalizationService localizer) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return BadRequest(httpRequest, localizer, "Business has no active loyalty configuration");
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

    if (string.IsNullOrWhiteSpace(request.CustomerPhone))
    {
        return BadRequest(httpRequest, localizer, "Customer phone is required");
    }

    if (request.Quantity <= 0)
    {
        return BadRequest(httpRequest, localizer, "Stamp quantity must be positive");
    }

    if (string.IsNullOrWhiteSpace(request.Reason))
    {
        return BadRequest(httpRequest, localizer, "Reason is required");
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
            return BadRequest(httpRequest, localizer, "Staff member not found");
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

    var normalizedPhone = request.CustomerPhone.Trim();
    var customer = await GetOrCreateCustomerAsync(db, normalizedPhone);
    var cycle = await GetOrCreateCycleAsync(db, businessId, customer, config);

    var now = DateTime.UtcNow;
    var expirationApplied = ApplyExpirationRules(cycle, config, now);

    var rewardName = cycle.RewardNameSnapshot ?? config.RewardName;
    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;

    if (cycle.Status != "REWARD_AVAILABLE" && cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
        cycle.RewardAvailableAt ??= now;
        expirationApplied = true;
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
        if (expirationApplied)
        {
            await db.SaveChangesAsync();
        }

        return Results.Ok(new StampIssueResponse(
            customerResponse,
            cycle.VisitCount,
            visitThreshold,
            true,
            rewardName,
            cycle.RewardAvailableAt,
            cycle.LastStampAt));
    }

    cycle.VisitCount += request.Quantity;
    cycle.LastStampAt = now;
    if (cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
        cycle.RewardAvailableAt ??= now;
    }

    db.StampTransactions.Add(new StampTransaction
    {
        CustomerId = customer.Id,
        BusinessId = businessId,
        Quantity = request.Quantity,
        Reason = request.Reason.Trim(),
        StaffId = request.StaffId,
        IssuedByPhone = session.PhoneNumber,
        IssuedAt = now,
    });

    await db.SaveChangesAsync();

    var language = GetRequestLanguage(httpRequest, localizer);
    if (cycle.Status == "REWARD_AVAILABLE")
    {
        await messagingService.SendRewardAvailableAsync(
            customer.PhoneNumber,
            business.Name,
            rewardName,
            language);
    }
    else
    {
        await messagingService.SendVisitProgressAsync(
            customer.PhoneNumber,
            business.Name,
            cycle.VisitCount,
            visitThreshold,
            language);
    }

    return Results.Ok(new StampIssueResponse(
        customerResponse,
        cycle.VisitCount,
        visitThreshold,
        cycle.Status == "REWARD_AVAILABLE",
        rewardName,
        cycle.RewardAvailableAt,
        cycle.LastStampAt));
});

app.MapPost("/businesses/{businessId:int}/memberships", async (
    int businessId,
    CustomerLookup request,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return BadRequest(httpRequest, localizer, "Business has no active loyalty configuration");
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
        return BadRequest(httpRequest, localizer, "Phone number is required");
    }

    var normalizedPhone = request.PhoneNumber.Trim();
    var customer = await GetOrCreateCustomerAsync(db, normalizedPhone);
    var cycle = await GetOrCreateCycleAsync(db, businessId, customer, config);

    var rewardName = cycle.RewardNameSnapshot ?? config.RewardName;
    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;
    var optionalNote = cycle.OptionalNoteSnapshot ?? config.OptionalNote;
    var now = DateTime.UtcNow;
    var expirationApplied = ApplyExpirationRules(cycle, config, now);

    if (cycle.Status != "REWARD_AVAILABLE" && cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
        cycle.RewardAvailableAt ??= now;
        expirationApplied = true;
    }

    if (expirationApplied)
    {
        await db.SaveChangesAsync();
    }

    return Results.Ok(new CustomerStatusResponse(
        business.Name,
        config.ProgramName,
        config.ProgramDescription,
        config.ProgramIconUrl,
        rewardName,
        config.RewardImageUrl,
        cycle.VisitCount,
        visitThreshold,
        optionalNote,
        config.StampExpirationDays,
        cycle.RewardAvailableAt,
        cycle.LastStampAt));
});

app.MapPost("/businesses/{businessId:int}/loyalty-media", async (
    int businessId,
    HttpRequest httpRequest,
    AppDbContext db,
    IObjectStorage objectStorage,
    LocalizationService localizer) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return BadRequest(httpRequest, localizer, "Business has no active loyalty configuration");
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

    if (!httpRequest.HasFormContentType)
    {
        return BadRequest(httpRequest, localizer, "Multipart form data is required");
    }

    var form = await httpRequest.ReadFormAsync();
    var kind = form["kind"].ToString().Trim();
    var file = form.Files["file"];

    if (string.IsNullOrWhiteSpace(kind))
    {
        return BadRequest(httpRequest, localizer, "Kind is required");
    }

    if (file is null || file.Length == 0)
    {
        return BadRequest(httpRequest, localizer, "File is required");
    }

    if (!string.Equals(kind, "program_icon", StringComparison.OrdinalIgnoreCase)
        && !string.Equals(kind, "reward_image", StringComparison.OrdinalIgnoreCase))
    {
        return BadRequest(httpRequest, localizer, "Invalid kind. Use program_icon or reward_image.");
    }

    var extension = Path.GetExtension(file.FileName);
    if (string.IsNullOrWhiteSpace(extension))
    {
        extension = ".bin";
    }

    var safeKind = kind.ToLowerInvariant();
    var objectKey = $"businesses/{businessId}/loyalty/{safeKind}/{Guid.NewGuid():N}{extension}";

    try
    {
        await using var stream = file.OpenReadStream();
        var url = await objectStorage.UploadAsync(stream, file.ContentType, objectKey, httpRequest.HttpContext.RequestAborted);

        if (safeKind == "program_icon")
        {
            config.ProgramIconUrl = url;
        }
        else
        {
            config.RewardImageUrl = url;
        }

        await db.SaveChangesAsync();

        return Results.Ok(new LoyaltyMediaResponse(safeKind, url));
    }
    catch (InvalidOperationException ex)
    {
        var language = GetRequestLanguage(httpRequest, localizer);
        return Results.BadRequest(new { detail = localizer.Translate(ex.Message, language) });
    }
});

app.MapPost("/businesses/{businessId:int}/magic-links", async (
    int businessId,
    HttpRequest httpRequest,
    AppDbContext db,
    IConfiguration configuration,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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

    var ttlDays = configuration.GetValue("MagicLinks:DefaultTtlDays", 180);
    if (ttlDays <= 0)
    {
        ttlDays = 180;
    }

    var expiresAt = DateTime.UtcNow.AddDays(ttlDays);
    var token = Guid.NewGuid().ToString("N");

    var magicLink = new MagicLinkToken
    {
        BusinessId = businessId,
        Token = token,
        ExpiresAt = expiresAt,
        CreatedByPhone = session.PhoneNumber
    };

    db.MagicLinkTokens.Add(magicLink);
    await db.SaveChangesAsync();

    var baseUrl = configuration.GetValue<string>("MagicLinks:CustomerAppBaseUrl") ?? "http://localhost:5174";
    var url = $"{baseUrl.TrimEnd('/')}/magic?token={token}";

    return Results.Ok(new MagicLinkResponse(token, url, expiresAt, businessId, business.Name));
});

app.MapGet("/magic-links/{token}", async (
    string token,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    if (string.IsNullOrWhiteSpace(token))
    {
        return NotFound(httpRequest, localizer, "Magic link not found or expired");
    }

    var trimmedToken = token.Trim();
    var magicLink = await db.MagicLinkTokens
        .FirstOrDefaultAsync(m => m.Token == trimmedToken);

    if (magicLink is null || magicLink.ExpiresAt <= DateTime.UtcNow)
    {
        return NotFound(httpRequest, localizer, "Magic link not found or expired");
    }

    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == magicLink.BusinessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Magic link not found or expired");
    }

    return Results.Ok(new MagicLinkResolveResponse(
        magicLink.BusinessId,
        business.Name,
        magicLink.ExpiresAt));
});

app.MapPost("/businesses/{businessId:int}/redemptions", async (
    int businessId,
    RedemptionRequest request,
    HttpRequest httpRequest,
    AppDbContext db,
    IMessagingService messagingService,
    LocalizationService localizer) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return BadRequest(httpRequest, localizer, "Business has no active loyalty configuration");
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
            return BadRequest(httpRequest, localizer, "Staff member not found");
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
        return BadRequest(httpRequest, localizer, "Customer phone is required");
    }

    var normalizedPhone = request.CustomerPhone.Trim();
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone);
    if (customer is null)
    {
        return BadRequest(httpRequest, localizer, "Customer not found");
    }

    var cycle = await db.LoyaltyCycles
        .FirstOrDefaultAsync(c => c.CustomerId == customer.Id && c.BusinessId == businessId);

    if (cycle is null)
    {
        return BadRequest(httpRequest, localizer, "Reward not available");
    }

    if (cycle.RewardNameSnapshot is null || cycle.VisitThresholdSnapshot is null)
    {
        EnsureCycleSnapshot(cycle, config);
    }

    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;
    var now = DateTime.UtcNow;
    var expirationApplied = ApplyExpirationRules(cycle, config, now);
    if (cycle.Status != "REWARD_AVAILABLE" && cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
        cycle.RewardAvailableAt ??= now;
    }

    if (cycle.Status != "REWARD_AVAILABLE")
    {
        if (expirationApplied)
        {
            await db.SaveChangesAsync();
        }
        return BadRequest(httpRequest, localizer, "Reward not available");
    }

    var redemptionRewardName = cycle.RewardNameSnapshot ?? config.RewardName;

    var redemption = new Redemption
    {
        CustomerId = customer.Id,
        BusinessId = businessId,
        RewardName = redemptionRewardName,
        StaffId = request.StaffId,
        RedeemedByPhone = session.PhoneNumber,
    };

    cycle.Status = "PROGRESSING";
    cycle.VisitCount = 0;
    cycle.LastStampAt = null;
    cycle.RewardAvailableAt = null;
    SetCycleSnapshot(cycle, config);

    db.Redemptions.Add(redemption);
    await db.SaveChangesAsync();

    var language = GetRequestLanguage(httpRequest, localizer);
    await messagingService.SendRewardRedeemedAsync(
        customer.PhoneNumber,
        business.Name,
        redemptionRewardName,
        language);

    return Results.Ok(new RedemptionResponse(
        redemption.RewardName,
        redemption.RedeemedAt,
        cycle.VisitCount,
        redemption.RedeemedByPhone));
});

app.MapGet("/businesses/{businessId:int}/customers/{phoneNumber}", async (
    int businessId,
    string phoneNumber,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    var config = business.LoyaltyConfig;
    if (config is null || !config.Active)
    {
        return BadRequest(httpRequest, localizer, "Business has no active loyalty configuration");
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return BadRequest(httpRequest, localizer, "Phone number is required");
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
        return NotFound(httpRequest, localizer, "Customer not found");
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
    var snapshotApplied = false;
    if (cycle.RewardNameSnapshot is null || cycle.VisitThresholdSnapshot is null)
    {
        EnsureCycleSnapshot(cycle, config);
        snapshotApplied = true;
    }

    var rewardName = cycle.RewardNameSnapshot ?? config.RewardName;
    var visitThreshold = cycle.VisitThresholdSnapshot ?? config.VisitThreshold;
    var optionalNote = cycle.OptionalNoteSnapshot ?? config.OptionalNote;
    var now = DateTime.UtcNow;
    var expirationApplied = ApplyExpirationRules(cycle, config, now);

    if (cycle.Status != "REWARD_AVAILABLE" && cycle.VisitCount >= visitThreshold)
    {
        cycle.Status = "REWARD_AVAILABLE";
        cycle.RewardAvailableAt ??= now;
        expirationApplied = true;
    }

    if (expirationApplied || snapshotApplied)
    {
        await db.SaveChangesAsync();
    }

    return Results.Ok(new CustomerStatusResponse(
        business.Name,
        config.ProgramName,
        config.ProgramDescription,
        config.ProgramIconUrl,
        rewardName,
        config.RewardImageUrl,
        cycle.VisitCount,
        visitThreshold,
        optionalNote,
        config.StampExpirationDays,
        cycle.RewardAvailableAt,
        cycle.LastStampAt));
});

app.MapPut("/businesses/{businessId:int}/customers/{phoneNumber}/profile", async (
    int businessId,
    string phoneNumber,
    CustomerProfileUpdate request,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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
        return BadRequest(httpRequest, localizer, "Phone number is required");
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
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return BadRequest(httpRequest, localizer, "Phone number is required");
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
        return NotFound(httpRequest, localizer, "Customer not found");
    }

    var stampVisits = await db.StampTransactions
        .Where(t => t.CustomerId == customer.Id
            && t.BusinessId == businessId
            && t.Reason == "purchase")
        .Select(t => new VisitHistoryItem(t.IssuedAt, t.Quantity, t.Reason))
        .ToListAsync();

    var legacyVisits = await db.Visits
        .Where(v => v.CustomerId == customer.Id && v.BusinessId == businessId)
        .Select(v => new VisitHistoryItem(v.CreatedAt, 1, null))
        .ToListAsync();

    var visits = stampVisits
        .Concat(legacyVisits)
        .OrderByDescending(v => v.CreatedAt)
        .ToList();

    return Results.Ok(visits);
});

app.MapGet("/businesses/{businessId:int}/customers/{phoneNumber}/stamps", async (
    int businessId,
    string phoneNumber,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return BadRequest(httpRequest, localizer, "Phone number is required");
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
        return NotFound(httpRequest, localizer, "Customer not found");
    }

    var stamps = await db.StampTransactions
        .Where(t => t.CustomerId == customer.Id && t.BusinessId == businessId)
        .OrderByDescending(t => t.IssuedAt)
        .Select(t => new StampTransactionItem(
            t.Id,
            t.Quantity,
            t.Reason,
            t.IssuedAt,
            t.IssuedByPhone,
            t.StaffId))
        .ToListAsync();

    return Results.Ok(stamps);
});

app.MapGet("/businesses/{businessId:int}/redemptions", async (
    int businessId,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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
            r.StaffId,
            r.RedeemedByPhone))
        .ToListAsync();

    return Results.Ok(redemptions);
});

app.MapGet("/businesses/{businessId:int}/stats", async (
    int businessId,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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

    var enrolledCustomers = await db.LoyaltyCycles
        .Where(c => c.BusinessId == businessId)
        .Select(c => c.CustomerId)
        .Distinct()
        .CountAsync();

    var stampsIssued = await db.StampTransactions
        .Where(t => t.BusinessId == businessId)
        .SumAsync(t => (int?)t.Quantity) ?? 0;

    var rewardsRedeemed = await db.Redemptions
        .Where(r => r.BusinessId == businessId)
        .CountAsync();

    return Results.Ok(new BusinessStatsResponse(enrolledCustomers, stampsIssued, rewardsRedeemed));
});

app.MapPost("/auth/request-otp", async (
    AuthRequestOtp request,
    HttpRequest httpRequest,
    OtpService otpService,
    LocalizationService localizer) =>
{
    if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Purpose))
    {
        return BadRequest(httpRequest, localizer, "Phone number and purpose are required");
    }

    var normalizedPhone = request.PhoneNumber.Trim();
    var purpose = request.Purpose.Trim();
    var language = GetRequestLanguage(httpRequest, localizer);

    await otpService.RequestOtpAsync(normalizedPhone, purpose, language);

    return Results.Ok(new { status = "sent" });
});

app.MapPost("/auth/verify-otp", async (
    AuthVerifyOtp request,
    HttpRequest httpRequest,
    OtpService otpService,
    LocalizationService localizer) =>
{
    if (string.IsNullOrWhiteSpace(request.PhoneNumber)
        || string.IsNullOrWhiteSpace(request.Purpose)
        || string.IsNullOrWhiteSpace(request.Code))
    {
        return BadRequest(httpRequest, localizer, "Phone number, purpose, and code are required");
    }

    var normalizedPhone = request.PhoneNumber.Trim();
    var purpose = request.Purpose.Trim();
    var code = request.Code.Trim();

    var session = await otpService.VerifyOtpAsync(normalizedPhone, code, purpose);
    if (session is null)
    {
        return BadRequest(httpRequest, localizer, "Invalid or expired code");
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
    AppDbContext db,
    LocalizationService localizer) =>
{
    if (string.IsNullOrWhiteSpace(request.DisplayName) || string.IsNullOrWhiteSpace(request.PhoneNumber))
    {
        return BadRequest(httpRequest, localizer, "Display name and phone number are required");
    }

    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses.FirstOrDefaultAsync(b => b.Id == businessId);
    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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

app.MapGet("/businesses/{businessId:int}", async (
    int businessId,
    HttpRequest httpRequest,
    AppDbContext db,
    LocalizationService localizer) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return NotFound(httpRequest, localizer, "Business not found");
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
        return BadRequest(httpRequest, localizer, "Business has no active loyalty configuration");
    }

    return Results.Ok(new BusinessDetailResponse(
        business.Id,
        business.Name,
        business.OwnerPhone,
        business.BusinessType,
        business.CreatedAt,
        business.LoyaltyConfig.ProgramName,
        business.LoyaltyConfig.ProgramDescription,
        business.LoyaltyConfig.ProgramIconUrl,
        business.LoyaltyConfig.RewardName,
        business.LoyaltyConfig.RewardImageUrl,
        business.LoyaltyConfig.VisitThreshold,
        business.LoyaltyConfig.OptionalNote,
        business.LoyaltyConfig.StampExpirationDays));
});

app.MapReportingEndpoints();

app.Run();

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

static async Task<Customer> GetOrCreateCustomerAsync(AppDbContext db, string phoneNumber)
{
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == phoneNumber)
        ?? new Customer { PhoneNumber = phoneNumber };

    if (customer.Id == 0)
    {
        db.Customers.Add(customer);
        await db.SaveChangesAsync();
    }

    return customer;
}

static async Task<LoyaltyCycle> GetOrCreateCycleAsync(
    AppDbContext db,
    int businessId,
    Customer customer,
    LoyaltyConfig config)
{
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

    return cycle;
}

static bool ApplyExpirationRules(LoyaltyCycle cycle, LoyaltyConfig config, DateTime now)
{
    if (config.StampExpirationDays is null || config.StampExpirationDays <= 0)
    {
        return false;
    }

    var expiration = TimeSpan.FromDays(config.StampExpirationDays.Value);

    if (cycle.Status == "REWARD_AVAILABLE" && cycle.RewardAvailableAt is not null)
    {
        if (now - cycle.RewardAvailableAt.Value >= expiration)
        {
            ResetCycle(cycle);
            return true;
        }
    }

    if (cycle.LastStampAt is not null && now - cycle.LastStampAt.Value >= expiration)
    {
        ResetCycle(cycle);
        return true;
    }

    return false;
}

static void ResetCycle(LoyaltyCycle cycle)
{
    cycle.VisitCount = 0;
    cycle.Status = "PROGRESSING";
    cycle.LastStampAt = null;
    cycle.RewardAvailableAt = null;
}

static string GetRequestLanguage(HttpRequest request, LocalizationService localizer)
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

static IResult BadRequest(HttpRequest request, LocalizationService localizer, string key)
{
    var language = GetRequestLanguage(request, localizer);
    var message = localizer.Translate(key, language);
    return Results.BadRequest(new { detail = message });
}

static IResult NotFound(HttpRequest request, LocalizationService localizer, string key)
{
    var language = GetRequestLanguage(request, localizer);
    var message = localizer.Translate(key, language);
    return Results.NotFound(new { detail = message });
}
