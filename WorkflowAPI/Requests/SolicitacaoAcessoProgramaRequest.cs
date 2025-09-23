using Microsoft.AspNetCore.Mvc;
using Workflow.Shared.Modelos.Enums;

namespace WorkflowAPI.Requests
{
    public record SolicitacaoAcessoProgramaRequest(int UsuarioWorkflowId, int ProgramaId, Permissao permissoes);
}
