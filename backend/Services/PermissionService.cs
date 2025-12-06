using backend.Helper;
using backend.Interfaces;

namespace backend.Services
{
    public class PermissionService(IPermissionEvualuator evaluator) : IPermissionService
    {
        public readonly IPermissionEvualuator _evaluator = evaluator;


        public Task<bool> HasAsync(Guid serverGuid, Guid userGuid, string permission)
            => _evaluator.HasPermissionAsync(serverGuid,userGuid, permission);

        public Task RequireAsync(Guid serverGuid, Guid userGuid, string permission)
            => _evaluator.RequirePermissionAsync(serverGuid, userGuid, permission);

        public Task RequireMembership(Guid serverGuid,Guid userGuid)
            => _evaluator.RequireServerMembership(serverGuid,userGuid);
    }
}
