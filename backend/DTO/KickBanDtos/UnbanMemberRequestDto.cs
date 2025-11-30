namespace backend.DTO.KickBanDtos
{
    public class UnbanMemberRequestDto
    {
        public Guid ServerGuid { get; set; }
        public Guid UserGuid { get; set; }
    }
}
