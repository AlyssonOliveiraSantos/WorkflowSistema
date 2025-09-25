using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Modelos.Enums;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Requests;
using WorkflowAPI.Responses;
using WorkflowAPI.Services;

namespace WorkflowAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SolicitacaoAcessoProgramaController : ControllerBase
    {
        private readonly DAL<SolicitacaoAcessoPrograma> _dalSolicitacao;
        private readonly UsuarioService _userService;
        private readonly DAL<UsuarioWorkflow> _dalUsuarioWorkflow;
        private readonly DAL<Programa> _dalPrograma;
        private readonly DAL<Area> _dalArea;

        public SolicitacaoAcessoProgramaController(DAL<SolicitacaoAcessoPrograma> dalSolicitacao, UsuarioService usuarioService, DAL<Area> dalArea, DAL<Programa> dalPrograma, DAL<UsuarioWorkflow> dalUsuarioWorkflow)
        {
            _dalSolicitacao = dalSolicitacao;
            _userService = usuarioService;
            _dalArea = dalArea;
            _dalPrograma = dalPrograma;
            _dalUsuarioWorkflow = dalUsuarioWorkflow;
        }


        [HttpGet]
        public  async Task<IActionResult> Get()
        {
            var solicitacoes = await _dalSolicitacao.ListarTodos();
            var solicitacoesResponse = solicitacoes.Select(
                s => new SolicitacaoAcessoProgramaResponse(
                    s.Id,
                    s.SolicitanteWorkflowId,
                    s.ObservacaoSolicitante,
                    s.UsuarioWorkflowId,
                    s.ProgramaId,
                    s.DataSolicitacao,
                    s.AprovadoGerente,
                    s.ObservacaoGerente,
                    s.DataAprovacaoGerente,
                    s.AprovadoResponsavelPrograma,
                    s.ObservacaoResponsavelPrograma,
                    s.DataAprovacaoResponsavelPrograma,
                    s.AprovadoTI,
                    s.ObservacaoTI,
                    s.DataAprovacaoTI,
                    s.Permissoes,
                    s.Finalizado
                    ));

            return Ok(solicitacoesResponse);
        }

        [HttpGet("minhas-solicitacoes")]
        public async Task<IActionResult> GetMinhasSolicitacoes()
        {
            var usuarioAtual = await _userService.ObterUsuarioWorkflowLogadoAsync(User);
            if (usuarioAtual == null)
                return NotFound("Usuário logado não encontrado.");

            var solicitacoes = await _dalSolicitacao.ListarPor(s => s.UsuarioWorkflowId == usuarioAtual.Id);
            var solicitacoesResponse = solicitacoes.Select(
                s => new SolicitacaoAcessoProgramaResponse(
                    s.Id,
                    s.SolicitanteWorkflowId,
                    s.ObservacaoSolicitante,
                    s.UsuarioWorkflowId,
                    s.ProgramaId,
                    s.DataSolicitacao,
                    s.AprovadoGerente,
                    s.ObservacaoGerente,
                    s.DataAprovacaoGerente,
                    s.AprovadoResponsavelPrograma,
                    s.ObservacaoResponsavelPrograma,
                    s.DataAprovacaoResponsavelPrograma,
                    s.AprovadoTI,
                    s.ObservacaoTI,
                    s.DataAprovacaoTI,
                    s.Permissoes,
                    s.Finalizado
                    ));

            return Ok(solicitacoesResponse);
        }

        [HttpGet("solicitacoes-pendentes-aprovacao")]
        public async Task<IActionResult> GetMinhasSolicitacoesPendentesAprovacao()
        {
            var usuarioAtual = await _userService.ObterUsuarioWorkflowLogadoAsync(User);
            if (usuarioAtual == null)
                return NotFound("Usuário logado não encontrado.");
            if (usuarioAtual?.Area == null)
                return Forbid("Usuário não possui área atribuída.");

            var solicitacoes = await _dalSolicitacao.ListarPor(s => s.Finalizado != true);
            var pendentes = solicitacoes.Where(s =>
                PodeAprovarComoGerente(s, usuarioAtual) ||
                PodeAprovarComoResponsavelPrograma(s, usuarioAtual) ||
                PodeAprovarComoTI(s, usuarioAtual)
            );

            var solicitacaoResponse = pendentes.Select(
                s => new SolicitacaoAcessoProgramaResponse(
                    s.Id,
                    s.SolicitanteWorkflowId,
                    s.ObservacaoSolicitante,
                    s.UsuarioWorkflowId,
                    s.ProgramaId,
                    s.DataSolicitacao,
                    s.AprovadoGerente,
                    s.ObservacaoGerente,
                    s.DataAprovacaoGerente,
                    s.AprovadoResponsavelPrograma,
                    s.ObservacaoResponsavelPrograma,
                    s.DataAprovacaoResponsavelPrograma,
                    s.AprovadoTI,
                    s.ObservacaoTI,
                    s.DataAprovacaoTI,
                    s.Permissoes,
                    s.Finalizado
                    ));
            return Ok(solicitacaoResponse);
        }

            [HttpPost]
        public async Task<IActionResult> Post([FromBody] SolicitacaoAcessoProgramaRequest solicitacaoRequest)
        {
            var usuarioLogado = await _userService.ObterUsuarioWorkflowLogadoAsync(User);
            if (usuarioLogado == null)
                return NotFound("Usuário logado não encontrado.");
            var usuarioWorkflowExistente = await _dalUsuarioWorkflow.RecuperarPor(u => u.Id == solicitacaoRequest.UsuarioWorkflowId);
            if (usuarioWorkflowExistente == null)
                return NotFound("Usuário Workflow para o qual o acesso está sendo solicitado não encontrado.");
            if (usuarioWorkflowExistente.Ativo == false)
                return BadRequest("Usuário Workflow para o qual o acesso está sendo solicitado está inativo.");
            var programaExistente = await _dalPrograma.RecuperarPor(p => p.Id == solicitacaoRequest.ProgramaId);
            if (programaExistente == null)
                return NotFound("Programa para o qual o acesso está sendo solicitado não encontrado.");
            if (programaExistente.Ativo == false)
                return BadRequest("Programa para o qual o acesso está sendo solicitado está inativo.");
            var areaDoPrograma = await _dalArea.RecuperarPor(a => a.Id == programaExistente.AreaId);
            if (areaDoPrograma == null)
                return NotFound("Área associada ao programa não encontrada.");
            if (areaDoPrograma.Ativo == false)
                return BadRequest("Área associada ao programa está inativa.");


            var solicitacao = new SolicitacaoAcessoPrograma
            {
                SolicitanteWorkflowId = usuarioLogado.Id,
                ObservacaoSolicitante = solicitacaoRequest.observacao,
                UsuarioWorkflowId = solicitacaoRequest.UsuarioWorkflowId,
                ProgramaId = solicitacaoRequest.ProgramaId,
                DataSolicitacao = DateTime.Now,
                AprovadoGerente = null,
                DataAprovacaoGerente = null,
                AprovadoResponsavelPrograma = null,
                DataAprovacaoResponsavelPrograma = null,
                AprovadoTI = null,
                DataAprovacaoTI = null,
                Permissoes = solicitacaoRequest.permissoes,
                Finalizado = false
            };
            await _dalSolicitacao.Adicionar(solicitacao);
            return CreatedAtAction(nameof(Get), new { id = solicitacao.Id }, solicitacao);
        }

        [HttpPut("{id}/decisao")]
        public async Task<IActionResult> AtualizarDecisao(int id, [FromBody] DecisaoRequest request)
        {
            var usuarioAtual = await _userService.ObterUsuarioWorkflowLogadoAsync(User);
            if (usuarioAtual == null)
                return NotFound("Usuário logado não encontrado.");


            var solicitacao = await _dalSolicitacao.RecuperarPor(s => s.Id == id);
            if (solicitacao == null)
                return NotFound("Solicitação não encontrada.");
            if (solicitacao.Finalizado == true)
                return BadRequest("Solicitação já foi finalizada.");

            switch (request.Tipo)
            {
                case TipoDecisao.Gerente:
                    if (!PodeAprovarComoGerente(solicitacao, usuarioAtual))
                        return Forbid("Usuário não é o gerente da área.");
                    solicitacao.AprovadoGerente = request.Aprovado;
                    solicitacao.ObservacaoGerente = request.observacao;
                    if (request.Aprovado == false)
                        solicitacao.Finalizado = true;
                    solicitacao.DataAprovacaoGerente = DateTime.Now;
                    break;

                case TipoDecisao.ResponsavelPrograma:
                    var programa = await _dalPrograma.RecuperarPor(p => p.Id == solicitacao.ProgramaId);
                    if (!PodeAprovarComoResponsavelPrograma(solicitacao, usuarioAtual))
                        return Forbid("Você não é responsável pela área do programa.");
                    solicitacao.AprovadoResponsavelPrograma = request.Aprovado;
                    solicitacao.ObservacaoResponsavelPrograma = request.observacao;
                    if (request.Aprovado == false)
                        solicitacao.Finalizado = true;
                    solicitacao.DataAprovacaoResponsavelPrograma = DateTime.Now;
                    break;

                case TipoDecisao.TI:
                    if (!PodeAprovarComoTI(solicitacao, usuarioAtual))
                        return Forbid("Usuário não pertence à área de TI.");
                    solicitacao.AprovadoTI = request.Aprovado;
                    solicitacao.ObservacaoTI = request.observacao;
                    if (request.Aprovado == false)
                        solicitacao.Finalizado = true;
                    else
                        solicitacao.Finalizado = true;
                    solicitacao.DataAprovacaoTI = DateTime.Now;
                    break;

                default:
                    return BadRequest("Tipo de decisão inválido.");
            }

            await _dalSolicitacao.Atualizar(solicitacao);
            return NoContent();
        }






        private bool PodeAprovarComoGerente(SolicitacaoAcessoPrograma s, UsuarioWorkflow usuarioAtual)
        {
            if (usuarioAtual.Area?.ResponsavelAreaId != usuarioAtual.Id)
                return false;

            return s.AprovadoGerente == null &&
                   s.AprovadoResponsavelPrograma == null &&
                   s.AprovadoTI == null;
        }

        private bool PodeAprovarComoResponsavelPrograma(SolicitacaoAcessoPrograma s, UsuarioWorkflow usuarioAtual)
        {
            return s.AprovadoGerente == true &&
                   s.AprovadoResponsavelPrograma == null &&
                   s.AprovadoTI == null &&
                   s.Programa.AreaId == usuarioAtual.AreaId;
        }

        private bool PodeAprovarComoTI(SolicitacaoAcessoPrograma s, UsuarioWorkflow usuarioAtual)
        {
            return s.AprovadoGerente == true &&
                   s.AprovadoResponsavelPrograma == true &&
                   s.AprovadoTI == null &&
                   usuarioAtual.Area?.Id == 1;
        }


    }
}
