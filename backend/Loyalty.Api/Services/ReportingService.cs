using Loyalty.Api.Contracts;
using Loyalty.Api.Data;
using Loyalty.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Api.Services;

public sealed class ReportingService(AppDbContext db)
{
    private readonly AppDbContext _db = db;

    public async Task<VendorOverviewReport> GetVendorOverviewAsync(int businessId, ReportDateRange range)
    {
        var totalMembers = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var newMembers = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId && c.CreatedAt >= range.Start && c.CreatedAt <= range.End)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var activeCustomers = await _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .Select(t => t.CustomerId)
            .Distinct()
            .CountAsync();

        var totalStamps = await _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .SumAsync(t => (int?)t.Quantity) ?? 0;

        var totalRedemptions = await _db.Redemptions
            .Where(r => r.BusinessId == businessId && r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End)
            .CountAsync();

        var redeemableRewards = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId && c.Status == "REWARD_AVAILABLE")
            .CountAsync();

        var inactiveCustomers = Math.Max(totalMembers - activeCustomers, 0);
        var redemptionRate = totalStamps == 0 ? 0m : (decimal)totalRedemptions / totalStamps;
        var avgStampsPerActive = activeCustomers == 0 ? 0m : (decimal)totalStamps / activeCustomers;
        var avgRewardsPerActive = activeCustomers == 0 ? 0m : (decimal)totalRedemptions / activeCustomers;

        return new VendorOverviewReport(
            range,
            totalMembers,
            newMembers,
            activeCustomers,
            inactiveCustomers,
            totalStamps,
            totalRedemptions,
            redemptionRate,
            redeemableRewards,
            avgStampsPerActive,
            avgRewardsPerActive);
    }

    public async Task<CustomerGrowthReport> GetCustomerGrowthReportAsync(int businessId, ReportDateRange range)
    {
        var daily = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId && c.CreatedAt >= range.Start && c.CreatedAt <= range.End)
            .GroupBy(c => c.CreatedAt.Date)
            .Select(g => new TimeSeriesPoint(g.Key, g.Count()))
            .OrderBy(p => p.PeriodStart)
            .ToListAsync();

        var totalMembers = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId && c.CreatedAt <= range.End)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var baseCount = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId && c.CreatedAt < range.Start)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var cumulative = BuildCumulative(daily, baseCount);
        var weekly = GroupByWeek(daily);
        var monthly = GroupByMonth(daily);

        return new CustomerGrowthReport(range, daily, weekly, monthly, cumulative, totalMembers);
    }

    public async Task<CustomerActivityReport> GetCustomerActivityReportAsync(
        int businessId,
        ReportDateRange range,
        int page,
        int pageSize,
        string? status,
        string? sort)
    {
        var activeCustomerIds = _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .Select(t => t.CustomerId)
            .Distinct();

        var stampTotals = _db.StampTransactions
            .Where(t => t.BusinessId == businessId)
            .GroupBy(t => t.CustomerId)
            .Select(g => new
            {
                CustomerId = g.Key,
                TotalStamps = g.Sum(x => x.Quantity),
                LastStampAt = g.Max(x => x.IssuedAt),
                VisitCount = g.Count()
            });

        var redemptionTotals = _db.Redemptions
            .Where(r => r.BusinessId == businessId)
            .GroupBy(r => r.CustomerId)
            .Select(g => new { CustomerId = g.Key, TotalRewards = g.Count() });

        var config = await _db.LoyaltyConfigs.FirstOrDefaultAsync(c => c.BusinessId == businessId);
        var defaultThreshold = config?.VisitThreshold ?? 0;

        var query = from cycle in _db.LoyaltyCycles.Where(c => c.BusinessId == businessId)
                    join customer in _db.Customers on cycle.CustomerId equals customer.Id
                    join stamp in stampTotals on cycle.CustomerId equals stamp.CustomerId into stampJoin
                    from stamp in stampJoin.DefaultIfEmpty()
                    join redemption in redemptionTotals on cycle.CustomerId equals redemption.CustomerId into redemptionJoin
                    from redemption in redemptionJoin.DefaultIfEmpty()
                    select new CustomerActivityItem(
                        cycle.CustomerId,
                        customer.PhoneNumber,
                        customer.DisplayName,
                        cycle.CreatedAt,
                        stamp == null ? null : stamp.LastStampAt,
                        stamp == null ? 0 : stamp.TotalStamps,
                        redemption == null ? 0 : redemption.TotalRewards,
                        cycle.VisitCount,
                        cycle.VisitThresholdSnapshot ?? defaultThreshold,
                        cycle.Status == "REWARD_AVAILABLE",
                        activeCustomerIds.Contains(cycle.CustomerId));

        if (string.Equals(status, "active", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.IsActive);
        }
        else if (string.Equals(status, "inactive", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => !c.IsActive);
        }

        query = sort switch
        {
            "mostStamps" => query.OrderByDescending(c => c.TotalStampsIssued),
            "mostRewards" => query.OrderByDescending(c => c.TotalRewardsRedeemed),
            "newest" => query.OrderByDescending(c => c.MemberSince),
            _ => query.OrderByDescending(c => c.LastStampAt ?? c.MemberSince)
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var activeCount = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId && activeCustomerIds.Contains(c.CustomerId))
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var totalMembers = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var inactiveCount = Math.Max(totalMembers - activeCount, 0);

        return new CustomerActivityReport(
            range,
            activeCount,
            inactiveCount,
            new PagedResponse<CustomerActivityItem>(items, page, pageSize, total));
    }

    public async Task<StampIssuanceReport> GetStampIssuanceReportAsync(
        int businessId,
        ReportDateRange range,
        int page,
        int pageSize)
    {
        var stampScope = _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End);

        var totalStamps = await stampScope.SumAsync(t => (int?)t.Quantity) ?? 0;

        var daily = await stampScope
            .GroupBy(t => t.IssuedAt.Date)
            .Select(g => new TimeSeriesPoint(g.Key, g.Sum(x => x.Quantity)))
            .OrderBy(p => p.PeriodStart)
            .ToListAsync();

        var weekly = GroupByWeek(daily);
        var monthly = GroupByMonth(daily);

        var staffLookup = await _db.Staff
            .Where(s => s.BusinessId == businessId)
            .ToDictionaryAsync(s => s.Id, s => s);

        var byStaff = await stampScope
            .GroupBy(t => t.StaffId)
            .Select(g => new { StaffId = g.Key, Count = g.Sum(x => x.Quantity) })
            .ToListAsync();

        var staffCounts = byStaff
            .Select(item =>
            {
                staffLookup.TryGetValue(item.StaffId ?? -1, out var staff);
                return new StaffCount(item.StaffId, staff?.DisplayName, staff?.PhoneNumber, item.Count);
            })
            .OrderByDescending(s => s.Value)
            .ToList();

        var byReason = await stampScope
            .GroupBy(t => t.Reason)
            .Select(g => new ReasonCount(g.Key, g.Sum(x => x.Quantity)))
            .OrderByDescending(r => r.Value)
            .ToListAsync();

        var recentQuery = from stamp in stampScope
                          join customer in _db.Customers on stamp.CustomerId equals customer.Id
                          join staff in _db.Staff on stamp.StaffId equals staff.Id into staffJoin
                          from staff in staffJoin.DefaultIfEmpty()
                          orderby stamp.IssuedAt descending
                          select new StampTransactionReportItem(
                              stamp.Id,
                              customer.Id,
                              customer.PhoneNumber,
                              customer.DisplayName,
                              stamp.Quantity,
                              stamp.Reason,
                              stamp.IssuedAt,
                              staff == null ? null : staff.Id,
                              staff == null ? null : staff.DisplayName,
                              stamp.IssuedByPhone);

        var total = await recentQuery.CountAsync();
        var items = await recentQuery.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new StampIssuanceReport(
            range,
            totalStamps,
            daily,
            weekly,
            monthly,
            staffCounts,
            byReason,
            new PagedResponse<StampTransactionReportItem>(items, page, pageSize, total));
    }

    public async Task<RewardRedemptionReport> GetRewardRedemptionReportAsync(
        int businessId,
        ReportDateRange range,
        int page,
        int pageSize)
    {
        var redemptionScope = _db.Redemptions
            .Where(r => r.BusinessId == businessId && r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End);

        var totalRedemptions = await redemptionScope.CountAsync();

        var daily = await redemptionScope
            .GroupBy(r => r.RedeemedAt.Date)
            .Select(g => new TimeSeriesPoint(g.Key, g.Count()))
            .OrderBy(p => p.PeriodStart)
            .ToListAsync();

        var weekly = GroupByWeek(daily);
        var monthly = GroupByMonth(daily);

        var staffLookup = await _db.Staff
            .Where(s => s.BusinessId == businessId)
            .ToDictionaryAsync(s => s.Id, s => s);

        var byStaff = await redemptionScope
            .GroupBy(r => r.StaffId)
            .Select(g => new { StaffId = g.Key, Count = g.Count() })
            .ToListAsync();

        var staffCounts = byStaff
            .Select(item =>
            {
                staffLookup.TryGetValue(item.StaffId ?? -1, out var staff);
                return new StaffCount(item.StaffId, staff?.DisplayName, staff?.PhoneNumber, item.Count);
            })
            .OrderByDescending(s => s.Value)
            .ToList();

        var byReward = await redemptionScope
            .GroupBy(r => r.RewardName)
            .Select(g => new ReasonCount(g.Key, g.Count()))
            .OrderByDescending(r => r.Value)
            .ToListAsync();

        var recentQuery = from redemption in redemptionScope
                          join customer in _db.Customers on redemption.CustomerId equals customer.Id
                          join staff in _db.Staff on redemption.StaffId equals staff.Id into staffJoin
                          from staff in staffJoin.DefaultIfEmpty()
                          orderby redemption.RedeemedAt descending
                          select new RedemptionReportItem(
                              redemption.Id,
                              customer.Id,
                              customer.PhoneNumber,
                              customer.DisplayName,
                              redemption.RewardName,
                              redemption.RedeemedAt,
                              staff == null ? null : staff.Id,
                              staff == null ? null : staff.DisplayName,
                              redemption.RedeemedByPhone);

        var total = await recentQuery.CountAsync();
        var items = await recentQuery.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new RewardRedemptionReport(
            range,
            totalRedemptions,
            daily,
            weekly,
            monthly,
            staffCounts,
            byReward,
            new PagedResponse<RedemptionReportItem>(items, page, pageSize, total));
    }

    public async Task<ProgramPerformanceReport> GetProgramPerformanceReportAsync(int businessId, ReportDateRange range)
    {
        var config = await _db.LoyaltyConfigs.FirstOrDefaultAsync(c => c.BusinessId == businessId);
        if (config is null)
        {
            return new ProgramPerformanceReport(range, []);
        }

        var totalMembers = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var newMembers = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId && c.CreatedAt >= range.Start && c.CreatedAt <= range.End)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var activeMembers = await _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .Select(t => t.CustomerId)
            .Distinct()
            .CountAsync();

        var totalStamps = await _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .SumAsync(t => (int?)t.Quantity) ?? 0;

        var totalRedemptions = await _db.Redemptions
            .Where(r => r.BusinessId == businessId && r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End)
            .CountAsync();

        var redemptionRate = totalStamps == 0 ? 0m : (decimal)totalRedemptions / totalStamps;
        var completionRate = totalMembers == 0 ? 0m : (decimal)totalRedemptions / totalMembers;

        var firstRedemptions = await _db.Redemptions
            .Where(r => r.BusinessId == businessId)
            .GroupBy(r => r.CustomerId)
            .Select(g => new { CustomerId = g.Key, FirstRedeemedAt = g.Min(x => x.RedeemedAt) })
            .ToListAsync();

        var cycles = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId)
            .Select(c => new { c.CustomerId, c.CreatedAt })
            .ToListAsync();

        var cycleLookup = cycles.ToDictionary(c => c.CustomerId, c => c.CreatedAt);
        var diffs = firstRedemptions
            .Where(r => cycleLookup.ContainsKey(r.CustomerId))
            .Select(r => (r.FirstRedeemedAt - cycleLookup[r.CustomerId]).TotalDays)
            .ToList();

        var avgDays = diffs.Count == 0 ? (double?)null : diffs.Average();

        var item = new ProgramPerformanceItem(
            config.Id,
            config.ProgramName,
            totalMembers,
            newMembers,
            activeMembers,
            totalStamps,
            totalRedemptions,
            redemptionRate,
            completionRate,
            avgDays);

        return new ProgramPerformanceReport(range, new[] { item });
    }

    public async Task<ProgressFunnelReport> GetProgressFunnelReportAsync(int businessId, ReportDateRange range)
    {
        var config = await _db.LoyaltyConfigs.FirstOrDefaultAsync(c => c.BusinessId == businessId);
        var threshold = config?.VisitThreshold ?? 0;

        var cycles = await _db.LoyaltyCycles
            .Where(c => c.BusinessId == businessId)
            .Select(c => new
            {
                c.VisitCount,
                Threshold = c.VisitThresholdSnapshot ?? threshold,
                c.Status
            })
            .ToListAsync();

        var buckets = new Dictionary<string, int>
        {
            ["0"] = 0,
            ["1-25"] = 0,
            ["26-50"] = 0,
            ["51-75"] = 0,
            ["76-99"] = 0,
            ["reward"] = 0
        };

        foreach (var cycle in cycles)
        {
            var effectiveThreshold = cycle.Threshold <= 0 ? threshold : cycle.Threshold;
            if (cycle.Status == "REWARD_AVAILABLE")
            {
                buckets["reward"]++;
                continue;
            }

            if (effectiveThreshold <= 0)
            {
                buckets["0"]++;
                continue;
            }

            var percent = Math.Min(1d, cycle.VisitCount / (double)effectiveThreshold);
            if (cycle.VisitCount == 0)
            {
                buckets["0"]++;
            }
            else if (percent <= 0.25)
            {
                buckets["1-25"]++;
            }
            else if (percent <= 0.5)
            {
                buckets["26-50"]++;
            }
            else if (percent <= 0.75)
            {
                buckets["51-75"]++;
            }
            else
            {
                buckets["76-99"]++;
            }
        }

        var bucketList = new List<ProgressBucket>
        {
            new("0", buckets["0"]),
            new("1-25", buckets["1-25"]),
            new("26-50", buckets["26-50"]),
            new("51-75", buckets["51-75"]),
            new("76-99", buckets["76-99"]),
            new("reward", buckets["reward"])
        };

        return new ProgressFunnelReport(
            range,
            threshold,
            bucketList,
            buckets["76-99"],
            buckets["reward"]);
    }

    public async Task<TopCustomersReport> GetTopCustomersReportAsync(
        int businessId,
        ReportDateRange range,
        int page,
        int pageSize,
        string? sort)
    {
        var stampTotals = _db.StampTransactions
            .Where(t => t.BusinessId == businessId)
            .GroupBy(t => t.CustomerId)
            .Select(g => new
            {
                CustomerId = g.Key,
                TotalStamps = g.Sum(x => x.Quantity),
                VisitCount = g.Count(),
                LastStampAt = g.Max(x => x.IssuedAt)
            });

        var rewardTotals = _db.Redemptions
            .Where(r => r.BusinessId == businessId)
            .GroupBy(r => r.CustomerId)
            .Select(g => new { CustomerId = g.Key, TotalRewards = g.Count(), LastRedeemedAt = g.Max(x => x.RedeemedAt) });

        var config = await _db.LoyaltyConfigs.FirstOrDefaultAsync(c => c.BusinessId == businessId);
        var defaultThreshold = config?.VisitThreshold ?? 0;

        var query = from cycle in _db.LoyaltyCycles.Where(c => c.BusinessId == businessId)
                    join customer in _db.Customers on cycle.CustomerId equals customer.Id
                    join stamp in stampTotals on cycle.CustomerId equals stamp.CustomerId into stampJoin
                    from stamp in stampJoin.DefaultIfEmpty()
                    join reward in rewardTotals on cycle.CustomerId equals reward.CustomerId into rewardJoin
                    from reward in rewardJoin.DefaultIfEmpty()
                    select new TopCustomerItem(
                        cycle.CustomerId,
                        customer.PhoneNumber,
                        customer.DisplayName,
                        stamp == null ? 0 : stamp.TotalStamps,
                        reward == null ? 0 : reward.TotalRewards,
                        stamp == null ? 0 : stamp.VisitCount,
                        MaxDate(stamp == null ? null : stamp.LastStampAt, reward == null ? null : reward.LastRedeemedAt),
                        cycle.VisitCount,
                        cycle.VisitThresholdSnapshot ?? defaultThreshold);

        query = sort switch
        {
            "mostRewards" => query.OrderByDescending(c => c.TotalRewards),
            "mostStamps" => query.OrderByDescending(c => c.TotalStamps),
            "mostVisits" => query.OrderByDescending(c => c.VisitCount),
            _ => query.OrderByDescending(c => c.LastActivityAt ?? DateTime.MinValue)
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new TopCustomersReport(range, new PagedResponse<TopCustomerItem>(items, page, pageSize, total));
    }

    public async Task<RetentionReport> GetRetentionReportAsync(int businessId, ReportDateRange range)
    {
        var membersQuery = _db.LoyaltyCycles.Where(c => c.BusinessId == businessId);
        var totalMembers = await membersQuery.CountAsync();

        var join7 = await membersQuery.CountAsync(c =>
            _db.StampTransactions.Any(t =>
                t.BusinessId == businessId
                && t.CustomerId == c.CustomerId
                && t.IssuedAt > c.CreatedAt
                && t.IssuedAt <= c.CreatedAt.AddDays(7)));

        var join30 = await membersQuery.CountAsync(c =>
            _db.StampTransactions.Any(t =>
                t.BusinessId == businessId
                && t.CustomerId == c.CustomerId
                && t.IssuedAt > c.CreatedAt
                && t.IssuedAt <= c.CreatedAt.AddDays(30)));

        var windowStart = range.End.AddDays(-30);
        var recentStamps = await _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= windowStart && t.IssuedAt <= range.End)
            .OrderBy(t => t.CustomerId)
            .ThenBy(t => t.IssuedAt)
            .ToListAsync();

        var retention7 = 0;
        var retention30 = 0;
        var grouped = recentStamps.GroupBy(t => t.CustomerId);
        foreach (var group in grouped)
        {
            var stamps = group.Select(t => t.IssuedAt).OrderBy(d => d).ToList();
            if (stamps.Count < 2)
            {
                continue;
            }
            var last = stamps[^1];
            var prev = stamps[^2];
            var diff = last - prev;
            if (diff.TotalDays <= 7)
            {
                retention7++;
            }
            if (diff.TotalDays <= 30)
            {
                retention30++;
            }
        }

        var retention7Rate = totalMembers == 0 ? 0m : (decimal)retention7 / totalMembers;
        var retention30Rate = totalMembers == 0 ? 0m : (decimal)retention30 / totalMembers;
        var join7Rate = totalMembers == 0 ? 0m : (decimal)join7 / totalMembers;
        var join30Rate = totalMembers == 0 ? 0m : (decimal)join30 / totalMembers;

        var topRepeaters = await GetTopCustomersReportAsync(businessId, range, 1, 10, "mostVisits");

        return new RetentionReport(range, join7Rate, join30Rate, retention7Rate, retention30Rate, topRepeaters.Customers.Items);
    }

    public async Task<TimeActivityReport> GetTimeActivityReportAsync(int businessId, ReportDateRange range)
    {
        var stamps = _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End);

        var stampByHour = await stamps
            .GroupBy(t => t.IssuedAt.Hour)
            .Select(g => new ReasonCount(g.Key.ToString("00"), g.Sum(x => x.Quantity)))
            .OrderBy(r => r.Reason)
            .ToListAsync();

        var stampByWeekday = await stamps
            .GroupBy(t => t.IssuedAt.DayOfWeek)
            .Select(g => new ReasonCount(g.Key.ToString(), g.Sum(x => x.Quantity)))
            .OrderBy(r => r.Reason)
            .ToListAsync();

        var redemptions = _db.Redemptions
            .Where(r => r.BusinessId == businessId && r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End);

        var redemptionByHour = await redemptions
            .GroupBy(r => r.RedeemedAt.Hour)
            .Select(g => new ReasonCount(g.Key.ToString("00"), g.Count()))
            .OrderBy(r => r.Reason)
            .ToListAsync();

        var redemptionByWeekday = await redemptions
            .GroupBy(r => r.RedeemedAt.DayOfWeek)
            .Select(g => new ReasonCount(g.Key.ToString(), g.Count()))
            .OrderBy(r => r.Reason)
            .ToListAsync();

        return new TimeActivityReport(range, stampByHour, stampByWeekday, redemptionByHour, redemptionByWeekday);
    }

    public async Task<StaffActivityReport> GetStaffActivityReportAsync(int businessId, ReportDateRange range)
    {
        var staff = await _db.Staff
            .Where(s => s.BusinessId == businessId)
            .ToListAsync();

        var stampByStaff = await _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .GroupBy(t => t.StaffId)
            .Select(g => new { StaffId = g.Key, Count = g.Sum(x => x.Quantity), LastAt = g.Max(x => x.IssuedAt) })
            .ToListAsync();

        var redemptionByStaff = await _db.Redemptions
            .Where(r => r.BusinessId == businessId && r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End)
            .GroupBy(r => r.StaffId)
            .Select(g => new { StaffId = g.Key, Count = g.Count(), LastAt = g.Max(x => x.RedeemedAt) })
            .ToListAsync();

        var staffSummary = staff.Select(member =>
        {
            var stamp = stampByStaff.FirstOrDefault(s => s.StaffId == member.Id);
            var redeem = redemptionByStaff.FirstOrDefault(s => s.StaffId == member.Id);
            return new StaffActivityItem(
                member.Id,
                member.DisplayName,
                member.PhoneNumber,
                stamp?.Count ?? 0,
                redeem?.Count ?? 0,
                MaxDate(stamp?.LastAt, redeem?.LastAt));
        }).OrderByDescending(s => s.LastActionAt ?? DateTime.MinValue).ToList();

        var recentStampEvents = await _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .OrderByDescending(t => t.IssuedAt)
            .Take(50)
            .Select(t => new { t.StaffId, t.CustomerId, t.IssuedAt, t.Quantity })
            .ToListAsync();

        var recentRedemptionEvents = await _db.Redemptions
            .Where(r => r.BusinessId == businessId && r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End)
            .OrderByDescending(r => r.RedeemedAt)
            .Take(50)
            .Select(r => new { r.StaffId, r.CustomerId, r.RedeemedAt })
            .ToListAsync();

        var customerLookup = await _db.Customers.ToDictionaryAsync(c => c.Id, c => c.PhoneNumber);
        var staffLookup = staff.ToDictionary(s => s.Id, s => s);

        var recentEvents = new List<StaffActivityEvent>();

        foreach (var stamp in recentStampEvents)
        {
            staffLookup.TryGetValue(stamp.StaffId ?? -1, out var staffMember);
            customerLookup.TryGetValue(stamp.CustomerId, out var phone);
            recentEvents.Add(new StaffActivityEvent(
                "stamp",
                stamp.StaffId,
                staffMember?.DisplayName,
                stamp.CustomerId,
                phone,
                stamp.IssuedAt,
                stamp.Quantity));
        }

        foreach (var redemption in recentRedemptionEvents)
        {
            staffLookup.TryGetValue(redemption.StaffId ?? -1, out var staffMember);
            customerLookup.TryGetValue(redemption.CustomerId, out var phone);
            recentEvents.Add(new StaffActivityEvent(
                "redemption",
                redemption.StaffId,
                staffMember?.DisplayName,
                redemption.CustomerId,
                phone,
                redemption.RedeemedAt,
                1));
        }

        recentEvents = recentEvents
            .OrderByDescending(e => e.OccurredAt)
            .Take(50)
            .ToList();

        return new StaffActivityReport(range, staffSummary, recentEvents);
    }

    public async Task<SuspiciousActivityReport> GetSuspiciousActivityReportAsync(
        int businessId,
        ReportDateRange range,
        ReportingOptions options)
    {
        var windowStart = range.End.AddMinutes(-options.SuspiciousWindowMinutes);

        var stampWindow = _db.StampTransactions
            .Where(t => t.BusinessId == businessId && t.IssuedAt >= windowStart && t.IssuedAt <= range.End);

        var staffStampCounts = await stampWindow
            .GroupBy(t => t.StaffId)
            .Select(g => new { StaffId = g.Key, Count = g.Sum(x => x.Quantity) })
            .Where(g => g.Count >= options.SuspiciousStaffStampThreshold)
            .ToListAsync();

        var adjustmentCounts = await stampWindow
            .Where(t => t.Reason != "purchase")
            .GroupBy(t => t.StaffId)
            .Select(g => new { StaffId = g.Key, Count = g.Sum(x => x.Quantity) })
            .Where(g => g.Count >= options.SuspiciousAdjustmentThreshold)
            .ToListAsync();

        var redemptionWindow = _db.Redemptions
            .Where(r => r.BusinessId == businessId && r.RedeemedAt >= windowStart && r.RedeemedAt <= range.End);

        var customerRedemptionCounts = await redemptionWindow
            .GroupBy(r => r.CustomerId)
            .Select(g => new { CustomerId = g.Key, Count = g.Count() })
            .Where(g => g.Count >= options.SuspiciousCustomerRedemptionThreshold)
            .ToListAsync();

        var staffLookup = await _db.Staff
            .Where(s => s.BusinessId == businessId)
            .ToDictionaryAsync(s => s.Id, s => s.DisplayName);

        var customerLookup = await _db.Customers.ToDictionaryAsync(c => c.Id, c => c.PhoneNumber);

        var items = new List<SuspiciousActivityItem>();

        foreach (var staff in staffStampCounts)
        {
            staffLookup.TryGetValue(staff.StaffId ?? -1, out var staffName);
            items.Add(new SuspiciousActivityItem(
                "stamps",
                "High stamp issuance in short window",
                staff.StaffId,
                staffName,
                null,
                null,
                windowStart,
                range.End,
                staff.Count));
        }

        foreach (var staff in adjustmentCounts)
        {
            staffLookup.TryGetValue(staff.StaffId ?? -1, out var staffName);
            items.Add(new SuspiciousActivityItem(
                "adjustments",
                "High manual adjustments in short window",
                staff.StaffId,
                staffName,
                null,
                null,
                windowStart,
                range.End,
                staff.Count));
        }

        foreach (var customer in customerRedemptionCounts)
        {
            customerLookup.TryGetValue(customer.CustomerId, out var phone);
            items.Add(new SuspiciousActivityItem(
                "redemptions",
                "High redemptions by customer in short window",
                null,
                null,
                customer.CustomerId,
                phone,
                windowStart,
                range.End,
                customer.Count));
        }

        return new SuspiciousActivityReport(range, items);
    }

    public async Task<PlatformOverviewReport> GetPlatformOverviewReportAsync(ReportDateRange range)
    {
        var totalVendors = await _db.Businesses.CountAsync();
        var totalMemberships = await _db.LoyaltyCycles.Select(c => c.CustomerId).Distinct().CountAsync();
        var newMemberships = await _db.LoyaltyCycles
            .Where(c => c.CreatedAt >= range.Start && c.CreatedAt <= range.End)
            .Select(c => c.CustomerId)
            .Distinct()
            .CountAsync();

        var totalStamps = await _db.StampTransactions
            .Where(t => t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .SumAsync(t => (int?)t.Quantity) ?? 0;

        var totalRedemptions = await _db.Redemptions
            .Where(r => r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End)
            .CountAsync();

        var topByMembers = await _db.LoyaltyCycles
            .GroupBy(c => c.BusinessId)
            .Select(g => new { BusinessId = g.Key, Count = g.Select(x => x.CustomerId).Distinct().Count() })
            .OrderByDescending(g => g.Count)
            .Take(5)
            .Join(_db.Businesses, g => g.BusinessId, b => b.Id, (g, b) => new ReasonCount(b.Name, g.Count))
            .ToListAsync();

        var topByStamps = await _db.StampTransactions
            .Where(t => t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .GroupBy(t => t.BusinessId)
            .Select(g => new { BusinessId = g.Key, Count = g.Sum(x => x.Quantity) })
            .OrderByDescending(g => g.Count)
            .Take(5)
            .Join(_db.Businesses, g => g.BusinessId, b => b.Id, (g, b) => new ReasonCount(b.Name, g.Count))
            .ToListAsync();

        var topByRewards = await _db.Redemptions
            .Where(r => r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End)
            .GroupBy(r => r.BusinessId)
            .Select(g => new { BusinessId = g.Key, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .Take(5)
            .Join(_db.Businesses, g => g.BusinessId, b => b.Id, (g, b) => new ReasonCount(b.Name, g.Count))
            .ToListAsync();

        return new PlatformOverviewReport(
            range,
            totalVendors,
            totalVendors,
            0,
            totalMemberships,
            newMemberships,
            totalStamps,
            totalRedemptions,
            topByMembers,
            topByStamps,
            topByRewards);
    }

    public async Task<VendorComparisonReport> GetVendorComparisonReportAsync(
        ReportDateRange range,
        int page,
        int pageSize,
        string? sort)
    {
        var members = _db.LoyaltyCycles
            .GroupBy(c => c.BusinessId)
            .Select(g => new { BusinessId = g.Key, TotalMembers = g.Select(x => x.CustomerId).Distinct().Count() });

        var newMembers = _db.LoyaltyCycles
            .Where(c => c.CreatedAt >= range.Start && c.CreatedAt <= range.End)
            .GroupBy(c => c.BusinessId)
            .Select(g => new { BusinessId = g.Key, NewMembers = g.Select(x => x.CustomerId).Distinct().Count() });

        var activeCustomers = _db.StampTransactions
            .Where(t => t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .GroupBy(t => t.BusinessId)
            .Select(g => new { BusinessId = g.Key, ActiveCustomers = g.Select(x => x.CustomerId).Distinct().Count() });

        var stamps = _db.StampTransactions
            .Where(t => t.IssuedAt >= range.Start && t.IssuedAt <= range.End)
            .GroupBy(t => t.BusinessId)
            .Select(g => new { BusinessId = g.Key, StampsIssued = g.Sum(x => x.Quantity) });

        var rewards = _db.Redemptions
            .Where(r => r.RedeemedAt >= range.Start && r.RedeemedAt <= range.End)
            .GroupBy(r => r.BusinessId)
            .Select(g => new { BusinessId = g.Key, RewardsRedeemed = g.Count() });

        var activePrograms = _db.LoyaltyConfigs
            .Where(c => c.Active)
            .GroupBy(c => c.BusinessId)
            .Select(g => new { BusinessId = g.Key, ActivePrograms = g.Count() });

        var query = from business in _db.Businesses
                    join member in members on business.Id equals member.BusinessId into memberJoin
                    from member in memberJoin.DefaultIfEmpty()
                    join newMember in newMembers on business.Id equals newMember.BusinessId into newMemberJoin
                    from newMember in newMemberJoin.DefaultIfEmpty()
                    join active in activeCustomers on business.Id equals active.BusinessId into activeJoin
                    from active in activeJoin.DefaultIfEmpty()
                    join stamp in stamps on business.Id equals stamp.BusinessId into stampJoin
                    from stamp in stampJoin.DefaultIfEmpty()
                    join reward in rewards on business.Id equals reward.BusinessId into rewardJoin
                    from reward in rewardJoin.DefaultIfEmpty()
                    join programs in activePrograms on business.Id equals programs.BusinessId into programJoin
                    from programs in programJoin.DefaultIfEmpty()
                    select new VendorComparisonItem(
                        business.Id,
                        business.Name,
                        member == null ? 0 : member.TotalMembers,
                        newMember == null ? 0 : newMember.NewMembers,
                        active == null ? 0 : active.ActiveCustomers,
                        stamp == null ? 0 : stamp.StampsIssued,
                        reward == null ? 0 : reward.RewardsRedeemed,
                        (stamp == null || stamp.StampsIssued == 0)
                            ? 0m
                            : (decimal)(reward == null ? 0 : reward.RewardsRedeemed) / stamp.StampsIssued,
                        programs == null ? 0 : programs.ActivePrograms);

        query = sort switch
        {
            "stamps" => query.OrderByDescending(v => v.StampsIssued),
            "rewards" => query.OrderByDescending(v => v.RewardsRedeemed),
            "members" => query.OrderByDescending(v => v.TotalMembers),
            _ => query.OrderByDescending(v => v.ActiveCustomers)
        };

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new VendorComparisonReport(range, new PagedResponse<VendorComparisonItem>(items, page, pageSize, total));
    }

    private static IReadOnlyList<TimeSeriesPoint> BuildCumulative(IEnumerable<TimeSeriesPoint> daily, int baseCount)
    {
        var running = baseCount;
        var list = new List<TimeSeriesPoint>();
        foreach (var item in daily.OrderBy(d => d.PeriodStart))
        {
            running += item.Value;
            list.Add(new TimeSeriesPoint(item.PeriodStart, running));
        }
        return list;
    }

    private static IReadOnlyList<TimeSeriesPoint> GroupByWeek(IEnumerable<TimeSeriesPoint> daily)
    {
        return daily
            .GroupBy(d => StartOfWeek(d.PeriodStart))
            .Select(g => new TimeSeriesPoint(g.Key, g.Sum(x => x.Value)))
            .OrderBy(p => p.PeriodStart)
            .ToList();
    }

    private static IReadOnlyList<TimeSeriesPoint> GroupByMonth(IEnumerable<TimeSeriesPoint> daily)
    {
        return daily
            .GroupBy(d => new DateTime(d.PeriodStart.Year, d.PeriodStart.Month, 1))
            .Select(g => new TimeSeriesPoint(g.Key, g.Sum(x => x.Value)))
            .OrderBy(p => p.PeriodStart)
            .ToList();
    }

    private static DateTime StartOfWeek(DateTime date)
    {
        var diff = (7 + (int)date.DayOfWeek - (int)DayOfWeek.Monday) % 7;
        return date.Date.AddDays(-diff);
    }

    private static DateTime? MaxDate(DateTime? first, DateTime? second)
    {
        if (first is null)
        {
            return second;
        }
        if (second is null)
        {
            return first;
        }
        return first > second ? first : second;
    }
}
