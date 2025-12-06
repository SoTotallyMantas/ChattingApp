namespace backend.Interfaces
{
    public interface IPermissionEvualuator
    {
        Task<bool> HasPermissionAsync(Guid serverGuid, Guid userGuid, string permission);
        Task RequirePermissionAsync(Guid serverGuid, Guid userGuid, string permission);
        Task RequireServerMembership(Guid serverGuid,Guid userGuid);
    }
}
