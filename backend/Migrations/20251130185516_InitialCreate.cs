using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.PermissionId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: true),
                    AvatarURL = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserGuid);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    TokenGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.TokenGuid);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserGuid",
                        column: x => x.UserGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RegistrationWhitelist",
                columns: table => new
                {
                    WhitelistGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AddedBy = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrationWhitelist", x => x.WhitelistGuid);
                    table.ForeignKey(
                        name: "FK_RegistrationWhitelist_Users_AddedBy",
                        column: x => x.AddedBy,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Servers",
                columns: table => new
                {
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerName = table.Column<string>(type: "text", nullable: false),
                    OwnerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    IconURL = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Servers", x => x.ServerGuid);
                    table.ForeignKey(
                        name: "FK_Servers_Users_OwnerGuid",
                        column: x => x.OwnerGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserSettings",
                columns: table => new
                {
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    Theme = table.Column<string>(type: "text", nullable: false),
                    MuteNotifications = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSettings", x => x.UserGuid);
                    table.ForeignKey(
                        name: "FK_UserSettings_Users_UserGuid",
                        column: x => x.UserGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditLog",
                columns: table => new
                {
                    AuditGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    PerformedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLog", x => x.AuditGuid);
                    table.ForeignKey(
                        name: "FK_AuditLog_Servers_ServerGuid",
                        column: x => x.ServerGuid,
                        principalTable: "Servers",
                        principalColumn: "ServerGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AuditLog_Users_PerformedBy",
                        column: x => x.PerformedBy,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Channels",
                columns: table => new
                {
                    ChannelGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ChannelName = table.Column<string>(type: "text", nullable: false),
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Channels", x => x.ChannelGuid);
                    table.ForeignKey(
                        name: "FK_Channels_Channels_ParentGuid",
                        column: x => x.ParentGuid,
                        principalTable: "Channels",
                        principalColumn: "ChannelGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Channels_Servers_ServerGuid",
                        column: x => x.ServerGuid,
                        principalTable: "Servers",
                        principalColumn: "ServerGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServerBans",
                columns: table => new
                {
                    BanGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    BannedByGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServerBans", x => x.BanGuid);
                    table.ForeignKey(
                        name: "FK_ServerBans_Servers_ServerGuid",
                        column: x => x.ServerGuid,
                        principalTable: "Servers",
                        principalColumn: "ServerGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServerBans_Users_BannedByGuid",
                        column: x => x.BannedByGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServerBans_Users_UserGuid",
                        column: x => x.UserGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServerInvites",
                columns: table => new
                {
                    InviteGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MaxUses = table.Column<int>(type: "integer", nullable: false),
                    Uses = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServerInvites", x => x.InviteGuid);
                    table.ForeignKey(
                        name: "FK_ServerInvites_Servers_ServerGuid",
                        column: x => x.ServerGuid,
                        principalTable: "Servers",
                        principalColumn: "ServerGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServerInvites_Users_CreatedByGuid",
                        column: x => x.CreatedByGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServerMembers",
                columns: table => new
                {
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServerMembers", x => new { x.ServerGuid, x.UserGuid });
                    table.ForeignKey(
                        name: "FK_ServerMembers_Servers_ServerGuid",
                        column: x => x.ServerGuid,
                        principalTable: "Servers",
                        principalColumn: "ServerGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServerMembers_Users_UserGuid",
                        column: x => x.UserGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServerRoles",
                columns: table => new
                {
                    RoleGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleName = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: true),
                    IsAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServerRoles", x => x.RoleGuid);
                    table.ForeignKey(
                        name: "FK_ServerRoles_Servers_ServerGuid",
                        column: x => x.ServerGuid,
                        principalTable: "Servers",
                        principalColumn: "ServerGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    MessageGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ChannelGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReplyToGuid = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.MessageGuid);
                    table.ForeignKey(
                        name: "FK_Messages_Channels_ChannelGuid",
                        column: x => x.ChannelGuid,
                        principalTable: "Channels",
                        principalColumn: "ChannelGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Messages_Messages_ReplyToGuid",
                        column: x => x.ReplyToGuid,
                        principalTable: "Messages",
                        principalColumn: "MessageGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Messages_Users_UserGuid",
                        column: x => x.UserGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VoiceChannels",
                columns: table => new
                {
                    ChannelGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentJanusRoomId = table.Column<int>(type: "integer", nullable: false),
                    LastActiveAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoiceChannels", x => x.ChannelGuid);
                    table.ForeignKey(
                        name: "FK_VoiceChannels_Channels_ChannelGuid",
                        column: x => x.ChannelGuid,
                        principalTable: "Channels",
                        principalColumn: "ChannelGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VoiceStates",
                columns: table => new
                {
                    VoiceStateGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ChannelGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsMuted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeafened = table.Column<bool>(type: "boolean", nullable: false),
                    IsVideo = table.Column<bool>(type: "boolean", nullable: false),
                    IsStreaming = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoiceStates", x => x.VoiceStateGuid);
                    table.ForeignKey(
                        name: "FK_VoiceStates_Channels_ChannelGuid",
                        column: x => x.ChannelGuid,
                        principalTable: "Channels",
                        principalColumn: "ChannelGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VoiceStates_Users_UserGuid",
                        column: x => x.UserGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServerRolePermissions",
                columns: table => new
                {
                    RoleGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionsGuid = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServerRolePermissions", x => new { x.RoleGuid, x.PermissionsGuid });
                    table.ForeignKey(
                        name: "FK_ServerRolePermissions_Permissions_PermissionsGuid",
                        column: x => x.PermissionsGuid,
                        principalTable: "Permissions",
                        principalColumn: "PermissionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServerRolePermissions_ServerRoles_RoleGuid",
                        column: x => x.RoleGuid,
                        principalTable: "ServerRoles",
                        principalColumn: "RoleGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServerUserRoles",
                columns: table => new
                {
                    ServerGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServerUserRoles", x => new { x.ServerGuid, x.UserGuid, x.RoleGuid });
                    table.ForeignKey(
                        name: "FK_ServerUserRoles_ServerRoles_RoleGuid",
                        column: x => x.RoleGuid,
                        principalTable: "ServerRoles",
                        principalColumn: "RoleGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServerUserRoles_Servers_ServerGuid",
                        column: x => x.ServerGuid,
                        principalTable: "Servers",
                        principalColumn: "ServerGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServerUserRoles_Users_UserGuid",
                        column: x => x.UserGuid,
                        principalTable: "Users",
                        principalColumn: "UserGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    AttachementGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    MessageGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    AttachementUrl = table.Column<string>(type: "text", nullable: false),
                    Filename = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.AttachementGuid);
                    table.ForeignKey(
                        name: "FK_Attachments_Messages_MessageGuid",
                        column: x => x.MessageGuid,
                        principalTable: "Messages",
                        principalColumn: "MessageGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_MessageGuid",
                table: "Attachments",
                column: "MessageGuid");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_PerformedBy",
                table: "AuditLog",
                column: "PerformedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_ServerGuid",
                table: "AuditLog",
                column: "ServerGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Channels_ParentGuid",
                table: "Channels",
                column: "ParentGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Channels_ServerGuid",
                table: "Channels",
                column: "ServerGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ChannelGuid",
                table: "Messages",
                column: "ChannelGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ReplyToGuid",
                table: "Messages",
                column: "ReplyToGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_UserGuid",
                table: "Messages",
                column: "UserGuid");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserGuid",
                table: "RefreshTokens",
                column: "UserGuid");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrationWhitelist_AddedBy",
                table: "RegistrationWhitelist",
                column: "AddedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ServerBans_BannedByGuid",
                table: "ServerBans",
                column: "BannedByGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerBans_ServerGuid",
                table: "ServerBans",
                column: "ServerGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerBans_UserGuid",
                table: "ServerBans",
                column: "UserGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerInvites_CreatedByGuid",
                table: "ServerInvites",
                column: "CreatedByGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerInvites_ServerGuid",
                table: "ServerInvites",
                column: "ServerGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerMembers_UserGuid",
                table: "ServerMembers",
                column: "UserGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerRolePermissions_PermissionsGuid",
                table: "ServerRolePermissions",
                column: "PermissionsGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerRoles_ServerGuid",
                table: "ServerRoles",
                column: "ServerGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Servers_OwnerGuid",
                table: "Servers",
                column: "OwnerGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerUserRoles_RoleGuid",
                table: "ServerUserRoles",
                column: "RoleGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ServerUserRoles_UserGuid",
                table: "ServerUserRoles",
                column: "UserGuid");

            migrationBuilder.CreateIndex(
                name: "IX_VoiceStates_ChannelGuid",
                table: "VoiceStates",
                column: "ChannelGuid");

            migrationBuilder.CreateIndex(
                name: "IX_VoiceStates_UserGuid",
                table: "VoiceStates",
                column: "UserGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "AuditLog");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RegistrationWhitelist");

            migrationBuilder.DropTable(
                name: "ServerBans");

            migrationBuilder.DropTable(
                name: "ServerInvites");

            migrationBuilder.DropTable(
                name: "ServerMembers");

            migrationBuilder.DropTable(
                name: "ServerRolePermissions");

            migrationBuilder.DropTable(
                name: "ServerUserRoles");

            migrationBuilder.DropTable(
                name: "UserSettings");

            migrationBuilder.DropTable(
                name: "VoiceChannels");

            migrationBuilder.DropTable(
                name: "VoiceStates");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "ServerRoles");

            migrationBuilder.DropTable(
                name: "Channels");

            migrationBuilder.DropTable(
                name: "Servers");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
