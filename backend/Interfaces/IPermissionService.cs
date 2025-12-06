namespace backend.Interfaces
{
    public interface IPermissionService
    {
        Task<bool> HasAsync(Guid serverGuid, Guid userGuid, string permission);
        Task RequireAsync(Guid serverGuid, Guid userGuid, string permission);
        Task RequireMembership(Guid serverGuid,Guid userGuid);
    }
}
