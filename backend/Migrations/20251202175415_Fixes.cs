using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Fixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistrationWhitelist_Users_AddedBy",
                table: "RegistrationWhitelist");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserSettings",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "UserSettings");

            migrationBuilder.RenameColumn(
                name: "PermissionId",
                table: "Permissions",
                newName: "PermissionGuid");

            migrationBuilder.AddColumn<Guid>(
                name: "UserSettingsGuid",
                table: "UserSettings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "Channels",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "AuditLog",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserSettings",
                table: "UserSettings",
                column: "UserSettingsGuid");

            migrationBuilder.CreateIndex(
                name: "IX_UserSettings_UserGuid",
                table: "UserSettings",
                column: "UserGuid",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrationWhitelist_Users_AddedBy",
                table: "RegistrationWhitelist",
                column: "AddedBy",
                principalTable: "Users",
                principalColumn: "UserGuid",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistrationWhitelist_Users_AddedBy",
                table: "RegistrationWhitelist");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserSettings",
                table: "UserSettings");

            migrationBuilder.DropIndex(
                name: "IX_UserSettings_UserGuid",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "UserSettingsGuid",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Channels");

            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "AuditLog");

            migrationBuilder.RenameColumn(
                name: "PermissionGuid",
                table: "Permissions",
                newName: "PermissionId");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "UserSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserSettings",
                table: "UserSettings",
                column: "UserGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrationWhitelist_Users_AddedBy",
                table: "RegistrationWhitelist",
                column: "AddedBy",
                principalTable: "Users",
                principalColumn: "UserGuid",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
