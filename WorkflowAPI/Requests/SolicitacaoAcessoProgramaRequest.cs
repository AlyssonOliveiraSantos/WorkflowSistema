using Microsoft.AspNetCore.Mvc;
using Workflow.Shared.Modelos.Enums;

namespace WorkflowAPI.Requests
{
    public record SolicitacaoAcessoProgramaRequest(int UsuarioWorkflowId, string? observacao, int ProgramaId, Permissao permissoes);
}
