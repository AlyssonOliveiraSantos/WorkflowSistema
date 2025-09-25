using Workflow.Shared.Modelos.Enums;

namespace WorkflowAPI.Requests
{
    public record UsuarioWorkflowUpdateRequest(string? nome, int? AreaId, bool? ativo);
}
