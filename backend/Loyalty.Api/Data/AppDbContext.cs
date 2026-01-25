using Loyalty.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Loyalty.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<LoyaltyConfig> LoyaltyConfigs => Set<LoyaltyConfig>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<LoyaltyCycle> LoyaltyCycles => Set<LoyaltyCycle>();
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<Redemption> Redemptions => Set<Redemption>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<AuthOtp> AuthOtps => Set<AuthOtp>();
    public DbSet<AuthSession> AuthSessions => Set<AuthSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Business>()
            .HasOne(b => b.LoyaltyConfig)
            .WithOne(c => c.Business)
            .HasForeignKey<LoyaltyConfig>(c => c.BusinessId);

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.PhoneNumber)
            .IsUnique();

        modelBuilder.Entity<Business>()
            .Property(b => b.BusinessType)
            .HasMaxLength(60);

        modelBuilder.Entity<Staff>()
            .HasIndex(s => new { s.BusinessId, s.PhoneNumber })
            .IsUnique();
    }
}
