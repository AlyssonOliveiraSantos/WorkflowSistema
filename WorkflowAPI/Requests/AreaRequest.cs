namespace WorkflowAPI.Requests
{
    public record AreaRequest(string nome, string descricao, int? responsavelAreaId = null);
}
