using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using QrHookahMenu.Server.Dtos;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QrHookahMenu.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly string _secretKey = "YourSuperSecretKeyForJWTGeneration"; // Gizli anahtar
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if(loginDto.username == "g8iyRM52ty" && loginDto.password == "jxWjkLV8sS")
            {
                // Token oluştur
                var token = GenerateJwtToken();
                return Ok(new { token });
            }
            else
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı!");
            }
        }
        private string GenerateJwtToken()
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, "AdminUser"),
                new Claim(ClaimTypes.Role, "Admin"),
            };

            var token = new JwtSecurityToken(
                issuer: "QrHookahMenu",
                audience: "QrHookahMenuClient",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1), // 1 saatlik token süresi
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
