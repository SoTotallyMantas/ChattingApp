using backend.DTO.ChannelDtos;
using backend.DTO.PermissionsResponseDtos;
using backend.DTO.UserDtos;

namespace backend.DTO.ServerDtos
{
    public class CreateServerRequestDto
    {
        public required string ServerName { get; set; }
        public string? IconKey { get; set; }
    }

    public class EditServerRequestDto
    {
        public required string ServerName { get; set; }
        public string? IconKey { get; set; }
    }

    public class ServerMemberResponseDto
    {
        public required UserResponseDto User { get; set; }
        public List<ServerRoleResponseDto> Roles { get; set; } = new();
    }

    public class ServerResponseDto
    {
        public Guid ServerGuid { get; set; }
        public required string ServerName { get; set; }
        public Guid OwnerGuid { get; set; }
        public string? IconKey { get; set; }
        public List<ChannelResponseDto> Channels { get; set; } = new();
        public List<ServerRoleResponseDto> Roles { get; set; } = new();
        public List<ServerMemberResponseDto> Members { get; set; } = new();
    }

    public class ServerRoleResponseDto
    {
        public Guid RoleGuid { get; set; }
        public required string RoleName { get; set; }
        public string? Color { get; set; }
        public bool IsAdmin { get; set; }
        public int Position { get; set; }
        public bool IsDefault { get; set; }
        public List<PermissionResponseDto> Permissions { get; set; } = new();
    }
}

namespace backend.DTO.InviteDtos
{
    public class CreateInviteRequestDto
    {
        public int MaxUses { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class InviteResponseDto
    {
        public Guid InviteGuid { get; set; }
        public Guid ServerGuid { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int MaxUses { get; set; }
        public int Uses { get; set; }
    }
}

namespace backend.DTO.KickBanDtos
{
    public class BanMemberRequestDto
    {
        public Guid UserGuid { get; set; }
        public string? Reason { get; set; }
    }

    public class BanResponseDto
    {
        public Guid BanGuid { get; set; }
        public required UserResponseDto User { get; set; }
        public required UserResponseDto BannedBy { get; set; }
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class KickMemberRequestDto
    {
        public Guid UserGuid { get; set; }
        public string? Reason { get; set; }
    }

    public class UnbanMemberRequestDto
    {
        public Guid UserGuid { get; set; }
    }
}
