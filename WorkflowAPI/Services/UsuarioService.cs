using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Data.Enums;
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

        public async Task CadastraUsuario(CadastraUsuarioRequest cadastraUsuarioRequest)
        {
            if (cadastraUsuarioRequest.password != cadastraUsuarioRequest.confirmpassword)
            {
                throw new ApplicationException("As senhas não coincidem.");
            }
            if (cadastraUsuarioRequest.usuarioWorkflowId <= 0)
            {
                throw new ApplicationException("Usuário Workflow inválido.");
            }
            var usuario = new PessoaComAcesso
            {
                UserName = cadastraUsuarioRequest.username,
                NormalizedUserName = cadastraUsuarioRequest.username.ToUpper(),
                Email = cadastraUsuarioRequest.email,
                NormalizedEmail = cadastraUsuarioRequest.email.ToUpper(),
                UsuarioWorkflowId = cadastraUsuarioRequest.usuarioWorkflowId
            };
            if (!usuario.UsuarioWorkflowId.HasValue)
            {
                usuario.UsuarioWorkflowId = null;
            }

            IdentityResult resultado = await _userManager.CreateAsync(usuario, cadastraUsuarioRequest.password);
            await _userManager.AddToRoleAsync(usuario, PerfilEnum.Padrao.ToString());

            if (!resultado.Succeeded)
{
            var erros = string.Join("; ", resultado.Errors.Select(e => e.Description));
            throw new ApplicationException($"Falha ao cadastrar o usuário: {erros}");
}

        }

        public async Task atualizaSenhaUsuario(ClaimsPrincipal user, SenhaUpdateRequest request)
        {
            var usuario =  user.FindFirst("idsub");
            if (usuario == null)
                throw new ApplicationException("Usuário não encontrado.");
            if (!int.TryParse(usuario.Value, out var pessoaId))
                throw new ApplicationException("Usuário não encontrado.");
            if (request.senhaNova != request.confimaNovaSenha)
                throw new ApplicationException("A nova senha e a confirmação da nova senha não coincidem.");

            var pessoa = await _dal.RecuperarPor(p => p.Id == pessoaId);
            if (pessoa == null)
                throw new ApplicationException("Usuário não encontrado.");
            var resultado = await _userManager.ChangePasswordAsync(pessoa, request.senhaAtual, request.senhaNova);
            if (!resultado.Succeeded)
            {
                var erros = string.Join("; ", resultado.Errors.Select(e => e.Description));
                throw new ApplicationException($"Falha ao atualizar a senha: {erros}");
            }

        }

        public async Task<IEnumerable<UsuarioResponse>> ListarUsuarios()
        {
            var usuarios = await _dal.ListarPor(a => a.Ativo == true);
            return usuarios.Select(u => new UsuarioResponse(u.Id, u.UserName,u.Email, u.UsuarioWorkflowId));
        }

        public async Task<UsuarioResponse> ListarPorId(int id)
        {
            var usuario = await _dal.ListarPor(u => u.Id == id);
            return usuario.Select(u => new UsuarioResponse(u.Id, u.UserName, u.Email, u.UsuarioWorkflowId)).FirstOrDefault();
        }

        public async Task<PessoaComAcesso> AtualizaUsuario(int id, CadastraUsuarioRequest request)
        {
            var usuario = await _dal.RecuperarPor(u => u.Id == id);
            if (usuario == null)
                throw new ApplicationException("Usuário não encontrado.");

            if (request.usuarioWorkflowId.HasValue)
            {
                var usuarioVinculado = await _dal.RecuperarPor(u => u.UsuarioWorkflowId == request.usuarioWorkflowId.Value);
                if (usuarioVinculado != null && usuarioVinculado.Id != id)
                    throw new ApplicationException("Outro usuário já está vinculado a esse Usuário Workflow.");

                usuario.UsuarioWorkflowId = request.usuarioWorkflowId.Value;
            }
            if(request.password != null && request.password == request.confirmpassword)
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(usuario);
                var resultado = await _userManager.ResetPasswordAsync(usuario, token, request.password);
                if (!resultado.Succeeded)
                {
                    var erros = string.Join("; ", resultado.Errors.Select(e => e.Description));
                    throw new ApplicationException($"Falha ao atualizar a senha: {erros}");
                }
            }
            if (!usuario.UsuarioWorkflowId.HasValue)
            {
                usuario.UsuarioWorkflowId = null;
            }
            usuario.Email = request.email ?? usuario.Email;
            await _dal.Atualizar(usuario);
            return usuario;
        }

        public async Task<(string token, string refreshToken)> Login(LoginRequest loginRequest)
        {
            var resultado = await _signInManager.PasswordSignInAsync(loginRequest.Username, loginRequest.Password, false, false);
            if (!resultado.Succeeded) { throw new ApplicationException("Usuário não autenticado!"); }

            var usuario = await _userManager.FindByNameAsync(loginRequest.Username);
            var roles = await _userManager.GetRolesAsync(usuario);

            var token = _tokenService.GenerateToken(usuario, roles);
            var refreshToken = _tokenService.GenerateRefreshToken(usuario);
            return (token, refreshToken);
        }

        public async Task<(string accessToken, string refreshToken)> RefreshTokenAsync(string refreshToken)
        {
            var principal = _tokenService.ValidateRefreshToken(refreshToken);
            var username = principal.FindFirstValue("username");
            var usuario = await _userManager.FindByNameAsync(username);

            var roles = await _userManager.GetRolesAsync(usuario);


                var newAccessToken = _tokenService.GenerateToken(usuario, roles);
            var newRefreshToken = _tokenService.GenerateRefreshToken(usuario);

            return (newAccessToken, newRefreshToken);
        }


        public async Task<UsuarioWorkflow?> ObterUsuarioWorkflowLogadoAsync(ClaimsPrincipal user)
        {
            var subClaim = user.FindFirst("idsub")?.Value;
            if (subClaim == null)
                return null;

            if (!int.TryParse(subClaim, out var pessoaId))
                return null;

            var pessoa = await _dal.RecuperarPor(p => p.Id == pessoaId);
            if (pessoa == null || pessoa.UsuarioWorkflowId == null)
                return null;

            var usuario = await _dalUsuarioWorkflow.RecuperarPor(u => u.Id == pessoa.UsuarioWorkflowId.Value);
            return usuario;
        }

        public async Task DeletaUsuario(int id)
        {
            var usuario = await _dal.RecuperarPor(u => u.Id == id);
            if (usuario == null)
            {
                throw new ApplicationException($"Usuário com ID {id} não encontrado.");
            }
            usuario.LockoutEnabled = true;
            usuario.Ativo = false;
            await _dal.Atualizar(usuario);
        }

        internal async Task resetaSenhaUsuario(int id, SenhaResetRequest request)
        {
            var usuario = await _dal.RecuperarPor(u => u.Id == id);
            if (usuario == null)
            {
                throw new ApplicationException($"Usuário com ID {id} não encontrado.");
            }
            if (request.novaSenha != request.confirmaNovaSenha)
                throw new ApplicationException("A nova senha e a confirmação da nova senha não coincidem.");
            var token = await _userManager.ResetPasswordAsync(usuario, await _userManager.GeneratePasswordResetTokenAsync(usuario), request.novaSenha);
            if (!token.Succeeded)
            {
                var erros = string.Join("; ", token.Errors.Select(e => e.Description));
                throw new ApplicationException($"Falha ao resetar a senha: {erros}");
            }
        }


    }
}
