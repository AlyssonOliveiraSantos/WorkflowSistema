namespace WorkflowAPI.Requests
{
    public record AreaUpdateRequest(string? nome, string? descricao, int? responsavelAreaId, bool? ativo);
}
