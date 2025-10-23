namespace WorkflowAPI.Helper
{
    public record UsuarioResponse(int Id, string UserName, string? email, int? UsuarioWorkflowId = null);
}
