namespace backend.Models
{
    public class ServerMembers
    {
       public Guid ServerGuid {  get; set; }
       public Guid UserGuid {  get; set; }
       public DateTime JoinedAt {  get; set; }

       public Servers server { get; set; } = default!;
       public Users User { get; set; } = default!;
    }
}
