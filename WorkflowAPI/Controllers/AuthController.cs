namespace WorkflowAPI.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using Workflow.Shared.Data.Modelos;
    using Workflow.Shared.Modelos.Modelos;
    using WorkflowAPI.Helper;
    using WorkflowAPI.Requests;
    using WorkflowAPI.Services;

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        UsuarioService _usuarioService;

        public AuthController(UsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }


        [HttpPost("cadastro")]

        public async Task<IActionResult> CadastraUsuario([FromBody] LoginCadastraRequest request)
        {
            await _usuarioService.CadastraUsuario(request);
            return Ok("Usuário cadastrado!");
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(User.Claims.Select(c => new { c.Type, c.Value }));
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var (token, refreshToken) = await _usuarioService.Login(request);
            return Ok(new {token, refreshToken});
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshAsync(TokenRefreshRequest request)
        {
            try
            {
                var tokens = await _usuarioService.RefreshTokenAsync(request.RefreshToken);
                return Ok(new { token = tokens.accessToken, refreshToken = tokens.refreshToken });
            }
            catch (SecurityTokenException)
            {
                return Unauthorized(new { message = "Token inválido para refresh" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Erro interno" });
            }

        }

    }

}
