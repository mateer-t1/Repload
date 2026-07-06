using Repload.API.Models;

namespace Repload.API.Services
{
    public interface IJwtService
    {
        string CreateToken(User user);
    }
}