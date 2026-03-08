namespace Loyalty.Api.Contracts;

public sealed record ReportDateRange(DateTime Start, DateTime End);

public sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int Total);

public sealed record TimeSeriesPoint(DateTime PeriodStart, int Value);

public sealed record StaffCount(int? StaffId, string? StaffName, string? StaffPhone, int Value);

public sealed record ReasonCount(string Reason, int Value);

public sealed record VendorOverviewReport(
    ReportDateRange Range,
    int TotalMembers,
    int NewMembers,
    int ActiveCustomers,
    int InactiveCustomers,
    int TotalStampsIssued,
    int TotalRewardsRedeemed,
    decimal RedemptionRate,
    int RedeemableRewards,
    decimal AvgStampsPerActiveCustomer,
    decimal AvgRewardsPerActiveCustomer
);

public sealed record CustomerGrowthReport(
    ReportDateRange Range,
    IReadOnlyList<TimeSeriesPoint> NewMembersByDay,
    IReadOnlyList<TimeSeriesPoint> NewMembersByWeek,
    IReadOnlyList<TimeSeriesPoint> NewMembersByMonth,
    IReadOnlyList<TimeSeriesPoint> CumulativeMembersByDay,
    int TotalMembers
);

public sealed record CustomerActivityItem(
    int CustomerId,
    string PhoneNumber,
    string? DisplayName,
    DateTime MemberSince,
    DateTime? LastStampAt,
    int TotalStampsIssued,
    int TotalRewardsRedeemed,
    int CurrentStampCount,
    int StampThreshold,
    bool RewardAvailable,
    bool IsActive
);

public sealed record CustomerActivityReport(
    ReportDateRange Range,
    int ActiveCustomers,
    int InactiveCustomers,
    PagedResponse<CustomerActivityItem> Customers
);

public sealed record StampTransactionReportItem(
    int Id,
    int CustomerId,
    string CustomerPhone,
    string? CustomerName,
    int Quantity,
    string Reason,
    DateTime IssuedAt,
    int? StaffId,
    string? StaffName,
    string? IssuedByPhone
);

public sealed record StampIssuanceReport(
    ReportDateRange Range,
    int TotalStampsIssued,
    IReadOnlyList<TimeSeriesPoint> StampsByDay,
    IReadOnlyList<TimeSeriesPoint> StampsByWeek,
    IReadOnlyList<TimeSeriesPoint> StampsByMonth,
    IReadOnlyList<StaffCount> StampsByStaff,
    IReadOnlyList<ReasonCount> StampsByReason,
    PagedResponse<StampTransactionReportItem> RecentTransactions
);

public sealed record RedemptionReportItem(
    int Id,
    int CustomerId,
    string CustomerPhone,
    string? CustomerName,
    string RewardName,
    DateTime RedeemedAt,
    int? StaffId,
    string? StaffName,
    string? RedeemedByPhone
);

public sealed record RewardRedemptionReport(
    ReportDateRange Range,
    int TotalRewardsRedeemed,
    IReadOnlyList<TimeSeriesPoint> RedemptionsByDay,
    IReadOnlyList<TimeSeriesPoint> RedemptionsByWeek,
    IReadOnlyList<TimeSeriesPoint> RedemptionsByMonth,
    IReadOnlyList<StaffCount> RedemptionsByStaff,
    IReadOnlyList<ReasonCount> RedemptionsByReward,
    PagedResponse<RedemptionReportItem> RecentRedemptions
);

public sealed record ProgramPerformanceItem(
    int ProgramId,
    string ProgramName,
    int TotalMembers,
    int NewMembers,
    int ActiveMembers,
    int TotalStampsIssued,
    int TotalRewardsRedeemed,
    decimal RedemptionRate,
    decimal RewardCompletionRate,
    double? AverageDaysToFirstReward
);

public sealed record ProgramPerformanceReport(
    ReportDateRange Range,
    IReadOnlyList<ProgramPerformanceItem> Programs
);

public sealed record ProgressBucket(string Label, int Count);

public sealed record ProgressFunnelReport(
    ReportDateRange Range,
    int StampThreshold,
    IReadOnlyList<ProgressBucket> Buckets,
    int NearCompletionCount,
    int RewardAvailableCount
);

public sealed record TopCustomerItem(
    int CustomerId,
    string CustomerPhone,
    string? CustomerName,
    int TotalStamps,
    int TotalRewards,
    int VisitCount,
    DateTime? LastActivityAt,
    int CurrentStampCount,
    int StampThreshold
);

public sealed record TopCustomersReport(
    ReportDateRange Range,
    PagedResponse<TopCustomerItem> Customers
);

public sealed record RetentionReport(
    ReportDateRange Range,
    decimal ReturnedWithin7DaysOfJoin,
    decimal ReturnedWithin30DaysOfJoin,
    decimal ReturnedWithin7DaysOfLastActivity,
    decimal ReturnedWithin30DaysOfLastActivity,
    IReadOnlyList<TopCustomerItem> RepeatActivityDistribution
);

public sealed record TimeActivityReport(
    ReportDateRange Range,
    IReadOnlyList<ReasonCount> StampsByHour,
    IReadOnlyList<ReasonCount> StampsByWeekday,
    IReadOnlyList<ReasonCount> RedemptionsByHour,
    IReadOnlyList<ReasonCount> RedemptionsByWeekday
);

public sealed record StaffActivityItem(
    int? StaffId,
    string? StaffName,
    string? StaffPhone,
    int StampsIssued,
    int RewardsRedeemed,
    DateTime? LastActionAt
);

public sealed record StaffActivityEvent(
    string EventType,
    int? StaffId,
    string? StaffName,
    int? CustomerId,
    string? CustomerPhone,
    DateTime OccurredAt,
    int Quantity
);

public sealed record StaffActivityReport(
    ReportDateRange Range,
    IReadOnlyList<StaffActivityItem> StaffSummary,
    IReadOnlyList<StaffActivityEvent> RecentActivity
);

public sealed record SuspiciousActivityItem(
    string EventType,
    string Reason,
    int? StaffId,
    string? StaffName,
    int? CustomerId,
    string? CustomerPhone,
    DateTime WindowStart,
    DateTime WindowEnd,
    int Count
);

public sealed record SuspiciousActivityReport(
    ReportDateRange Range,
    IReadOnlyList<SuspiciousActivityItem> Items
);

public sealed record PlatformOverviewReport(
    ReportDateRange Range,
    int TotalVendors,
    int ActiveVendors,
    int DisabledVendors,
    int TotalMemberships,
    int NewMemberships,
    int TotalStampsIssued,
    int TotalRewardsRedeemed,
    IReadOnlyList<ReasonCount> TopVendorsByMembers,
    IReadOnlyList<ReasonCount> TopVendorsByStamps,
    IReadOnlyList<ReasonCount> TopVendorsByRewards
);

public sealed record VendorComparisonItem(
    int BusinessId,
    string BusinessName,
    int TotalMembers,
    int NewMembers,
    int ActiveCustomers,
    int StampsIssued,
    int RewardsRedeemed,
    decimal RedemptionRate,
    int ActivePrograms
);

public sealed record VendorComparisonReport(
    ReportDateRange Range,
    PagedResponse<VendorComparisonItem> Vendors
);
