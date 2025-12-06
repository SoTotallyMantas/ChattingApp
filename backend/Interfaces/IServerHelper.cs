using backend.Models;

namespace backend.Interfaces
{
    public interface IServerHelper
    {
        Task<Servers> GetServerOrThrowAsync(Guid serverGuid);
        Task<Channels> GetChannelOrThrowAsync(Guid channelGuid);
        Task<ServerRoles> GetRoleOrThrowAsync(Guid roleGuid);
        Task<Users> GetUserOrThrowAsync(Guid userGuid);
    }
}
