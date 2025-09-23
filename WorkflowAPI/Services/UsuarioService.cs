using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Data.Modelos;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Helper;
using WorkflowAPI.Requests;

namespace WorkflowAPI.Services
{
    public class UsuarioService
    {
        private SignInManager<PessoaComAcesso> _signInManager;
        private UserManager<PessoaComAcesso> _userManager;
        private TokenService _tokenService;
        private readonly DAL<PessoaComAcesso> _dal;
        private readonly DAL<UsuarioWorkflow> _dalUsuarioWorkflow;

        public UsuarioService(UserManager<PessoaComAcesso> userManager, SignInManager<PessoaComAcesso> signInManager, TokenService tokenService, WorkflowDbContext context, DAL<PessoaComAcesso> dal, DAL<UsuarioWorkflow> dalUsuarioWorkflow)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _dal = dal;
            _dalUsuarioWorkflow = dalUsuarioWorkflow;
        }

        public async Task CadastraUsuario(LoginCadastraRequest loginRequest)
        {
            var usuario = new PessoaComAcesso
            {
                UserName = loginRequest.Username,
                NormalizedUserName = loginRequest.Username.ToUpper(),
                UsuarioWorkflowId = loginRequest.UsuarioWorkflowId
            };

            IdentityResult resultado = await _userManager.CreateAsync(usuario, loginRequest.Password);

            if (!resultado.Succeeded)
{
    var erros = string.Join("; ", resultado.Errors.Select(e => e.Description));
    throw new ApplicationException($"Falha ao cadastrar o usuário: {erros}");
}

        }

        public async Task<(string token, string refreshToken)> Login(LoginRequest loginRequest)
        {
            var resultado = await _signInManager.PasswordSignInAsync(loginRequest.Username, loginRequest.Password, false, false);
            if (!resultado.Succeeded) { throw new ApplicationException("Usuário não autenticado!"); }

            var usuario = await _userManager.FindByNameAsync(loginRequest.Username);

            var token = _tokenService.GenerateToken(usuario);
            var refreshToken = _tokenService.GenerateRefreshToken(usuario);
            return (token, refreshToken);
        }

        public async Task<(string accessToken, string refreshToken)> RefreshTokenAsync(string refreshToken)
        {
            var principal = _tokenService.ValidateRefreshToken(refreshToken);
            var username = principal.FindFirstValue("username");
            var usuario = await _userManager.FindByNameAsync(username);

            var newAccessToken = _tokenService.GenerateToken(usuario);
            var newRefreshToken = _tokenService.GenerateRefreshToken(usuario);

            return (newAccessToken, newRefreshToken);
        }


        public async Task<UsuarioWorkflow?> ObterUsuarioWorkflowLogadoAsync(ClaimsPrincipal user)
        {
            var subClaim = user.FindFirst("idsub");
            if (subClaim == null)
                return null;

            if (!int.TryParse(subClaim.Value, out var pessoaId))
                return null;

            var pessoa = await _dal.RecuperarPor(p => p.Id == pessoaId);
            if (pessoa == null)
                return null;

            var usuario = await _dalUsuarioWorkflow.RecuperarPor(u => u.Id == pessoa.UsuarioWorkflowId.Value);
            return usuario;
        }

    }
}
