namespace WorkflowAPI.Helper
{
    public record CadastraUsuarioRequest(string? username, string? password, string? confirmpassword, string email, int? usuarioWorkflowId);
}
