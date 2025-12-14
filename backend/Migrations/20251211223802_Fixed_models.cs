using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Fixed_models : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AvatarURL",
                table: "Users",
                newName: "AvatarKey");

            migrationBuilder.RenameColumn(
                name: "IconURL",
                table: "Servers",
                newName: "IconKey");

            migrationBuilder.RenameColumn(
                name: "AttachementUrl",
                table: "Attachments",
                newName: "AttachementKey");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AvatarKey",
                table: "Users",
                newName: "AvatarURL");

            migrationBuilder.RenameColumn(
                name: "IconKey",
                table: "Servers",
                newName: "IconURL");

            migrationBuilder.RenameColumn(
                name: "AttachementKey",
                table: "Attachments",
                newName: "AttachementUrl");
        }
    }
}
