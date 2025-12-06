namespace backend.Models
{
    public class RegistrationWhitelist
    {
       public Guid WhitelistGuid { get; set; }
       public string Email { get; set; } = default!;
       public DateTime AddedAt { get; set; }
       public Guid AddedBy { get; set; }
       public Users AddedByUser { get; set; } = default!;
    }
}
