using Workflow.Shared.Modelos.Enums;

namespace WorkflowAPI.Responses
{
    public record SolicitacaoAcessoProgramaResponse(int id, int usuarioWorkflowId, int programaId, DateTime dataSolicitacao, bool? aprovadoGerente, DateTime? dataAprovacaoGerente, bool? aprovadoResponsavelPrograma, DateTime? dataAprovacaoResponsavelPrograma, bool? aprovadoTI, DateTime? dataAprovacaoTI, Permissao permissao, bool finalizado);
}
