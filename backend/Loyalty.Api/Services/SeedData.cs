using Loyalty.Api.Data;
using Loyalty.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Api.Services;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Businesses.AnyAsync())
        {
            return;
        }

        var cafe = new Business
        {
            Name = "Sunrise Cafe",
            OwnerPhone = "+10000000001",
            BusinessType = "cafe",
        };

        var diner = new Business
        {
            Name = "Bayside Diner",
            OwnerPhone = "+10000000002",
            BusinessType = "fast_food",
        };

        db.Businesses.AddRange(cafe, diner);
        await db.SaveChangesAsync();

        var cafeConfig = new LoyaltyConfig
        {
            BusinessId = cafe.Id,
            ProgramName = "Coffee Stamps",
            ProgramDescription = "Buy 9 coffees, get the 10th free.",
            RewardName = "Free regular coffee",
            VisitThreshold = 9,
            OptionalNote = "Upgrade by paying the difference.",
            StampExpirationDays = 90,
            Active = true,
        };

        var dinerConfig = new LoyaltyConfig
        {
            BusinessId = diner.Id,
            ProgramName = "Lunch Club",
            ProgramDescription = "Collect 12 stamps for a free meal.",
            RewardName = "Free lunch item",
            VisitThreshold = 12,
            OptionalNote = "One free entree per redemption.",
            StampExpirationDays = 120,
            Active = true,
        };

        db.LoyaltyConfigs.AddRange(cafeConfig, dinerConfig);
        await db.SaveChangesAsync();

        var staff = new[]
        {
            new Staff
            {
                BusinessId = cafe.Id,
                DisplayName = "Lina",
                PhoneNumber = "+10000000011",
                Active = true,
            },
            new Staff
            {
                BusinessId = diner.Id,
                DisplayName = "Omar",
                PhoneNumber = "+10000000012",
                Active = true,
            },
        };

        db.Staff.AddRange(staff);
        await db.SaveChangesAsync();

        var customers = new[]
        {
            new Customer { PhoneNumber = "+15550000001", DisplayName = "Ava" },
            new Customer { PhoneNumber = "+15550000002", DisplayName = "Noah" },
            new Customer { PhoneNumber = "+15550000003", DisplayName = "Maya" },
            new Customer { PhoneNumber = "+15550000004", DisplayName = "Eli" },
        };

        db.Customers.AddRange(customers);
        await db.SaveChangesAsync();

        var now = DateTime.UtcNow;

        var cafeCycleAva = new LoyaltyCycle
        {
            CustomerId = customers[0].Id,
            BusinessId = cafe.Id,
            VisitCount = 6,
            Status = "PROGRESSING",
            LastStampAt = now.AddDays(-2),
            RewardNameSnapshot = cafeConfig.RewardName,
            VisitThresholdSnapshot = cafeConfig.VisitThreshold,
            OptionalNoteSnapshot = cafeConfig.OptionalNote,
        };

        var cafeCycleNoah = new LoyaltyCycle
        {
            CustomerId = customers[1].Id,
            BusinessId = cafe.Id,
            VisitCount = 9,
            Status = "REWARD_AVAILABLE",
            LastStampAt = now.AddDays(-1),
            RewardAvailableAt = now.AddDays(-1),
            RewardNameSnapshot = cafeConfig.RewardName,
            VisitThresholdSnapshot = cafeConfig.VisitThreshold,
            OptionalNoteSnapshot = cafeConfig.OptionalNote,
        };

        var dinerCycleMaya = new LoyaltyCycle
        {
            CustomerId = customers[2].Id,
            BusinessId = diner.Id,
            VisitCount = 3,
            Status = "PROGRESSING",
            LastStampAt = now.AddDays(-3),
            RewardNameSnapshot = dinerConfig.RewardName,
            VisitThresholdSnapshot = dinerConfig.VisitThreshold,
            OptionalNoteSnapshot = dinerConfig.OptionalNote,
        };

        db.LoyaltyCycles.AddRange(cafeCycleAva, cafeCycleNoah, dinerCycleMaya);
        await db.SaveChangesAsync();

        var transactions = new[]
        {
            new StampTransaction
            {
                CustomerId = customers[0].Id,
                BusinessId = cafe.Id,
                Quantity = 2,
                Reason = "purchase",
                IssuedAt = now.AddDays(-5),
                IssuedByPhone = cafe.OwnerPhone,
            },
            new StampTransaction
            {
                CustomerId = customers[0].Id,
                BusinessId = cafe.Id,
                Quantity = 4,
                Reason = "purchase",
                IssuedAt = now.AddDays(-2),
                IssuedByPhone = staff[0].PhoneNumber,
                StaffId = staff[0].Id,
            },
            new StampTransaction
            {
                CustomerId = customers[1].Id,
                BusinessId = cafe.Id,
                Quantity = 9,
                Reason = "purchase",
                IssuedAt = now.AddDays(-1),
                IssuedByPhone = cafe.OwnerPhone,
            },
            new StampTransaction
            {
                CustomerId = customers[2].Id,
                BusinessId = diner.Id,
                Quantity = 3,
                Reason = "purchase",
                IssuedAt = now.AddDays(-3),
                IssuedByPhone = staff[1].PhoneNumber,
                StaffId = staff[1].Id,
            },
        };

        db.StampTransactions.AddRange(transactions);
        await db.SaveChangesAsync();

        db.Redemptions.Add(new Redemption
        {
            CustomerId = customers[3].Id,
            BusinessId = cafe.Id,
            RewardName = cafeConfig.RewardName,
            RedeemedAt = now.AddDays(-10),
            RedeemedByPhone = cafe.OwnerPhone,
        });

        await db.SaveChangesAsync();
    }
}
