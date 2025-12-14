using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Encryption_models_and_more : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "Messages");

            migrationBuilder.AddColumn<byte[]>(
                name: "EncryptedContent",
                table: "Messages",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.CreateTable(
                name: "ChannelEncryptionKeys",
                columns: table => new
                {
                    ChannelEncryptionKeyGUID = table.Column<Guid>(type: "uuid", nullable: false),
                    ChannelGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    EncryptedKey = table.Column<byte[]>(type: "bytea", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChannelEncryptionKeys", x => x.ChannelEncryptionKeyGUID);
                    table.ForeignKey(
                        name: "FK_ChannelEncryptionKeys_Channels_ChannelGuid",
                        column: x => x.ChannelGuid,
                        principalTable: "Channels",
                        principalColumn: "ChannelGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Friendships",
                columns: table => new
                {
                    FriendshipGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    RequesterGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    AddresseeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friendships", x => x.FriendshipGuid);
                    table.ForeignKey(
                        name: "FK_Friendships_Users_AddresseeGuid",
                        column: x => x.AddresseeGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Friendships_Users_RequesterGuid",
                        column: x => x.RequesterGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChannelEncryptionKeys_ChannelGuid",
                table: "ChannelEncryptionKeys",
                column: "ChannelGuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_AddresseeGuid",
                table: "Friendships",
                column: "AddresseeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_RequesterGuid_AddresseeGuid",
                table: "Friendships",
                columns: new[] { "RequesterGuid", "AddresseeGuid" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChannelEncryptionKeys");

            migrationBuilder.DropTable(
                name: "Friendships");

            migrationBuilder.DropColumn(
                name: "EncryptedContent",
                table: "Messages");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "Messages",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
