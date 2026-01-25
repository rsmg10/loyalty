using Loyalty.Api.Contracts;
using Loyalty.Api.Data;
using Loyalty.Api.Models;
using Loyalty.Api.Services;
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
}

const int visitCooldownMinutes = 5;

app.MapPost("/businesses", async (BusinessCreate request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.OwnerPhone))
    {
        return Results.BadRequest(new { detail = "Name and owner phone are required" });
    }

    if (string.IsNullOrWhiteSpace(request.BusinessType))
    {
        return Results.BadRequest(new { detail = "Business type is required" });
    }

    var business = new Business
    {
        Name = request.Name.Trim(),
        OwnerPhone = request.OwnerPhone.Trim(),
        BusinessType = request.BusinessType.Trim(),
    };
    db.Businesses.Add(business);
    await db.SaveChangesAsync();

    return Results.Ok(new BusinessResponse(business.Id, business.Name, business.OwnerPhone, business.CreatedAt));
});

app.MapPost("/onboarding", async (BusinessOnboardingRequest request, AppDbContext db) =>
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
    AppDbContext db) =>
{
    var business = await db.Businesses.FindAsync(businessId);
    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    if (string.IsNullOrWhiteSpace(request.RewardName) || request.VisitThreshold <= 0)
    {
        return Results.BadRequest(new { detail = "Reward name and positive visit threshold are required" });
    }

    var existingConfigs = await db.LoyaltyConfigs
        .Where(c => c.BusinessId == businessId && c.Active)
        .ToListAsync();

    foreach (var existingConfig in existingConfigs)
    {
        existingConfig.Active = false;
    }

    var config = new LoyaltyConfig
    {
        BusinessId = businessId,
        RewardName = request.RewardName.Trim(),
        VisitThreshold = request.VisitThreshold,
        OptionalNote = string.IsNullOrWhiteSpace(request.OptionalNote) ? null : request.OptionalNote.Trim(),
        Active = true,
    };

    db.LoyaltyConfigs.Add(config);
    await db.SaveChangesAsync();

    return Results.Ok(new { id = config.Id });
});

app.MapPost("/businesses/{businessId:int}/visits", async (
    int businessId,
    CustomerLookup request,
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
    if (config is null)
    {
        return Results.BadRequest(new { detail = "Business has no active loyalty configuration" });
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
        db.LoyaltyCycles.Add(cycle);
        await db.SaveChangesAsync();
    }

    var lastVisit = await db.Visits
        .Where(v => v.CustomerId == customer.Id && v.BusinessId == businessId)
        .OrderByDescending(v => v.CreatedAt)
        .FirstOrDefaultAsync();

    if (lastVisit is null || DateTime.UtcNow - lastVisit.CreatedAt >= TimeSpan.FromMinutes(visitCooldownMinutes))
    {
        cycle.VisitCount += 1;
        if (cycle.VisitCount >= config.VisitThreshold)
        {
            cycle.Status = "REWARD_AVAILABLE";
        }

        db.Visits.Add(new Visit { CustomerId = customer.Id, BusinessId = businessId });
        await db.SaveChangesAsync();

        if (cycle.Status == "REWARD_AVAILABLE")
        {
            await messagingService.SendRewardAvailableAsync(
                customer.PhoneNumber,
                business.Name,
                config.RewardName);
        }
        else
        {
            await messagingService.SendVisitProgressAsync(
                customer.PhoneNumber,
                business.Name,
                cycle.VisitCount,
                config.VisitThreshold);
        }
    }

    var customerResponse = new CustomerResponse(
        customer.Id,
        customer.PhoneNumber,
        customer.DisplayName,
        customer.UsualOrder,
        customer.Notes);

    return Results.Ok(new VisitResponse(
        customerResponse,
        cycle.VisitCount,
        config.VisitThreshold,
        cycle.Status == "REWARD_AVAILABLE",
        config.RewardName));
});

app.MapPost("/businesses/{businessId:int}/redemptions", async (
    int businessId,
    RedemptionRequest request,
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
    if (config is null)
    {
        return Results.BadRequest(new { detail = "Business has no active loyalty configuration" });
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
        .FirstOrDefaultAsync(c => c.CustomerId == customer.Id && c.BusinessId == businessId)
        ?? new LoyaltyCycle { CustomerId = customer.Id, BusinessId = businessId, VisitCount = 0 };

    if (cycle.Status != "REWARD_AVAILABLE")
    {
        return Results.BadRequest(new { detail = "Reward not available" });
    }

    var redemption = new Redemption
    {
        CustomerId = customer.Id,
        BusinessId = businessId,
        RewardName = config.RewardName,
        StaffId = request.StaffId,
    };

    cycle.Status = "PROGRESSING";
    cycle.VisitCount = 0;

    db.Redemptions.Add(redemption);
    await db.SaveChangesAsync();

    await messagingService.SendRewardRedeemedAsync(
        customer.PhoneNumber,
        business.Name,
        config.RewardName);

    return Results.Ok(new RedemptionResponse(redemption.RewardName, redemption.RedeemedAt, cycle.VisitCount));
});

app.MapGet("/businesses/{businessId:int}/customers/{phoneNumber}", async (
    int businessId,
    string phoneNumber,
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
    if (config is null)
    {
        return Results.BadRequest(new { detail = "Business has no active loyalty configuration" });
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.BadRequest(new { detail = "Phone number is required" });
    }

    var normalizedPhone = phoneNumber.Trim();
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
        db.LoyaltyCycles.Add(cycle);
        await db.SaveChangesAsync();
    }

    return Results.Ok(new CustomerStatusResponse(
        business.Name,
        config.RewardName,
        cycle.VisitCount,
        config.VisitThreshold,
        config.OptionalNote));
});

app.MapPut("/businesses/{businessId:int}/customers/{phoneNumber}/profile", async (
    int businessId,
    string phoneNumber,
    CustomerProfileUpdate request,
    AppDbContext db) =>
{
    var businessExists = await db.Businesses.AnyAsync(b => b.Id == businessId);
    if (!businessExists)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.BadRequest(new { detail = "Phone number is required" });
    }

    var normalizedPhone = phoneNumber.Trim();
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone)
        ?? new Customer { PhoneNumber = normalizedPhone };

    customer.DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? null : request.DisplayName.Trim();
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
        customer.DisplayName,
        customer.UsualOrder,
        customer.Notes));
});

app.MapGet("/businesses/{businessId:int}/customers/{phoneNumber}/visits", async (
    int businessId,
    string phoneNumber,
    AppDbContext db) =>
{
    var businessExists = await db.Businesses.AnyAsync(b => b.Id == businessId);
    if (!businessExists)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.BadRequest(new { detail = "Phone number is required" });
    }

    var normalizedPhone = phoneNumber.Trim();
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
    AppDbContext db) =>
{
    var businessExists = await db.Businesses.AnyAsync(b => b.Id == businessId);
    if (!businessExists)
    {
        return Results.NotFound(new { detail = "Business not found" });
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

app.MapPost("/businesses/{businessId:int}/staff", async (
    int businessId,
    StaffCreate request,
    AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.DisplayName) || string.IsNullOrWhiteSpace(request.PhoneNumber))
    {
        return Results.BadRequest(new { detail = "Display name and phone number are required" });
    }

    var businessExists = await db.Businesses.AnyAsync(b => b.Id == businessId);
    if (!businessExists)
    {
        return Results.NotFound(new { detail = "Business not found" });
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
    AppDbContext db) =>
{
    var businessExists = await db.Businesses.AnyAsync(b => b.Id == businessId);
    if (!businessExists)
    {
        return Results.NotFound(new { detail = "Business not found" });
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

app.MapGet("/businesses/{businessId:int}", async (int businessId, AppDbContext db) =>
{
    var business = await db.Businesses
        .Include(b => b.LoyaltyConfig)
        .FirstOrDefaultAsync(b => b.Id == businessId);

    if (business is null)
    {
        return Results.NotFound(new { detail = "Business not found" });
    }

    if (business.LoyaltyConfig is null)
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
