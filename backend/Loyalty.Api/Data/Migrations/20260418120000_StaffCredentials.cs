using Loyalty.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Loyalty.Api.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260418120000_StaffCredentials")]
public class StaffCredentials : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "NormalizedUsername",
            table: "Staff",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "PasswordHash",
            table: "Staff",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "PasswordSalt",
            table: "Staff",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Username",
            table: "Staff",
            type: "text",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Staff_NormalizedUsername",
            table: "Staff",
            column: "NormalizedUsername",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Staff_NormalizedUsername",
            table: "Staff");

        migrationBuilder.DropColumn(
            name: "NormalizedUsername",
            table: "Staff");

        migrationBuilder.DropColumn(
            name: "PasswordHash",
            table: "Staff");

        migrationBuilder.DropColumn(
            name: "PasswordSalt",
            table: "Staff");

        migrationBuilder.DropColumn(
            name: "Username",
            table: "Staff");
    }
}
