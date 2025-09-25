namespace WorkflowAPI.Requests
{
    public record ProgramaUpdateRequest(string? nome, int? AreaId, bool? ativo);
}
