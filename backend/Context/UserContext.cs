using backend.Extensions;
using backend.Interfaces;

namespace backend.Context
{
    public class UserContext : IUserContext
    {
        public Guid UserGuid { get;}

        public UserContext(IHttpContextAccessor accessor)
        {
            try
            {
                var user = accessor.HttpContext?.User ?? throw new Exception("No HttpContext available");
                UserGuid = user.GetUserGuid();
            }
            catch (Exception)
            {
               
                UserGuid = Guid.Empty;
            }
        }
    }
}
