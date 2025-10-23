namespace WorkflowAPI.Helper
{
    public record SenhaUpdateRequest(string senhaAtual, string senhaNova, string confimaNovaSenha);
}