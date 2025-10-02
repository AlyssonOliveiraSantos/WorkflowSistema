using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Workflow.Shared.Data.Modelos;

namespace WorkflowAPI.Services
{
    public class TokenService
    {
        private IConfiguration _configuration;
        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public string GenerateToken(PessoaComAcesso usuario, IList<string> roles)
        {
            Claim[] claims = new Claim[]
            {
                new Claim("idsub", usuario.Id.ToString()),
                new Claim("username", usuario.UserName),
                new Claim("loginTimestamp", DateTime.UtcNow.ToString()),
                new Claim("token_type", "access"),
                new Claim("perfil", roles.First())
            };

            var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["SymmetricSecurityKey"]));

            var signingCredentials =
                new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken
                (
                expires: DateTime.Now.AddMinutes(10),
                claims: claims,
                signingCredentials: signingCredentials
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken(PessoaComAcesso usuario)
        {
            var claims = new Claim[]
            {
              new Claim("idsub", usuario.Id.ToString()),
              new Claim("username", usuario.UserName),
              new Claim("loginTimestamp", DateTime.UtcNow.ToString()),
              new Claim("token_type", "refresh"),
            };

            var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["SymmetricSecurityKey"]));

            var signingCredentials =
                new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken
                (
                expires: DateTime.Now.AddDays(7),
                claims: claims,
                signingCredentials: signingCredentials
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        public ClaimsPrincipal ValidateRefreshToken(string refreshToken)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["SymmetricSecurityKey"]);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = tokenHandler.ValidateToken(refreshToken, validationParameters, out var validatedToken);

                if (validatedToken is JwtSecurityToken jwt &&
                    jwt.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    var tokenType = principal.Claims.FirstOrDefault(c => c.Type == "token_type")?.Value;
                    if (tokenType != "refresh")
                        throw new SecurityTokenException("Token inválido para refresh");

                    return principal;
                }

                throw new SecurityTokenException("Token inválido");
            }
            catch
            {
                throw new SecurityTokenException("Token inválido");
            }
        }

    }
}
