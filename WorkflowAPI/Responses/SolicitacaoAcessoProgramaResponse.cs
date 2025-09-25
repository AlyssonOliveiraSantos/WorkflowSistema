using Workflow.Shared.Modelos.Enums;

namespace WorkflowAPI.Responses
{
    public record SolicitacaoAcessoProgramaResponse(int id,int solicitanteId, string? observacaoSolicitante, int usuarioWorkflowId, int programaId, DateTime dataSolicitacao, bool? aprovadoGerente, string? observacaoGerente,DateTime? dataAprovacaoGerente, bool? aprovadoResponsavelPrograma, string? observacaoResponsavelPrograma, DateTime? dataAprovacaoResponsavelPrograma, bool? aprovadoTI, string? observacaoTI, DateTime? dataAprovacaoTI, Permissao permissao, bool finalizado);
}
