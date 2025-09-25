namespace WorkflowAPI.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using Workflow.Shared.Data.Banco;
    using Workflow.Shared.Data.Modelos;
    using Workflow.Shared.Modelos.Modelos;
    using WorkflowAPI.Helper;
    using WorkflowAPI.Requests;
    using WorkflowAPI.Services;

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UsuarioService _usuarioService;
        private readonly DAL<UsuarioWorkflow> _dalUsuario;

        public AuthController(UsuarioService usuarioService, DAL<UsuarioWorkflow> dalUsuario)
        {
            _usuarioService = usuarioService;
            _dalUsuario = dalUsuario;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> ListaUsuarios()
        {
            var usuarios = await _usuarioService.ListarUsuarios();
            return Ok(usuarios);
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(User.Claims.Select(c => new { c.Type, c.Value }));
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("cadastro")]

        public async Task<IActionResult> CadastraUsuario([FromBody] LoginRequest request)
        {

            await _usuarioService.CadastraUsuario(request);
            return Ok("Usuário cadastrado!");
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var (token, refreshToken) = await _usuarioService.Login(request);
            return Ok(new { token, refreshToken });
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



        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizaUsuario(int id, [FromBody] LoginUpdateRequest request)
        {
            var usuarioAtualizado = await _usuarioService.AtualizaUsuario(id, request);
            var usuarioResponse = new UsuarioResponse(usuarioAtualizado.Id, usuarioAtualizado.UserName, usuarioAtualizado.UsuarioWorkflowId);
            return Ok(usuarioResponse);
        }


        [HttpPatch("{id}")]
        public async Task<IActionResult> AtualizaSenhaUsuario(int id, [FromBody] SenhaUpdateRequest request)
        {
            var usuario = await _dalUsuario.RecuperarPor(u => u.Id == id);
            if (usuario == null)
            {
                return NotFound($"Usuário com ID {id} não encontrado.");
            }
            await _usuarioService.atualizaSenhaUsuario(User, request.senhaAtual, request.senhaNova);
            return Ok("Senha atualizada com sucesso!");
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletaUsuario(int id)
        {
            var usuario = await _dalUsuario.RecuperarPor(u => u.Id == id);
            
            if (usuario == null)
            {
                return NotFound($"Usuário com ID {id} não encontrado.");
            }
            usuario.Ativo = false;
            await _dalUsuario.Atualizar(usuario);
            await _usuarioService.DeletaUsuario(id);

            return NoContent();
        }

    }

}
