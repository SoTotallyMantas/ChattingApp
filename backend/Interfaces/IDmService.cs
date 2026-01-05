using backend.DTO.DmDtos;

namespace backend.Interfaces
{
    public interface IDmService
    {
        Task<DmThreadResponseDto> GetOrCreateDmAsync(Guid userGuid, Guid friendGuid);
    }
}
