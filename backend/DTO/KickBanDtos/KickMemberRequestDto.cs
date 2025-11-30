namespace backend.DTO.KickBanDtos
{
    public class KickMemberRequestDto
    {
        public Guid ServerGuid { get; set; }
        public Guid UserGuid { get; set; }
        public string? Reason { get; set; }

    }
}
