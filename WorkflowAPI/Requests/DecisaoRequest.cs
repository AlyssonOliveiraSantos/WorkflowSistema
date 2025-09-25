using Workflow.Shared.Modelos.Enums;

namespace WorkflowAPI.Requests
{
    public record DecisaoRequest(TipoDecisao Tipo, string? observacao, bool Aprovado);
}
