using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IUserService
    {
        Task<List<Guid>> GetServersForUserAsync(Guid userGuid);
        Task<bool> isServerMemberAsync(Guid userGuid, Guid serverGuid);
        Task<bool> IsChannelMember(Guid userGuid, Guid channelGuid);
        Task<bool> HasChannelPermission(Guid userGuid, Guid channelGuid, string permission);
    }
}
