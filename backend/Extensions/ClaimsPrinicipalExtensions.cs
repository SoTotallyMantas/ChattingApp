using System.Net.NetworkInformation;
using System.Security.Claims;

namespace backend.Extensions
{
    public static class ClaimsPrinicipalExtensions
    {
        public static Guid GetUserGuid(this ClaimsPrincipal user)
        {
            try
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user));

                }
                var guid = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (guid == null)
                {
                    throw new Exception("User GUID claim not found.");
                }
                if (Guid.TryParse(guid, out Guid userGuid))
                {
                    return userGuid;
                }
                else
                {
                    throw new Exception("Invalid GUID format in user claims.");
                    
                }
            }
            catch (Exception)
            {
                // Log output 
                return Guid.Empty;
            }
        }
    }
}
