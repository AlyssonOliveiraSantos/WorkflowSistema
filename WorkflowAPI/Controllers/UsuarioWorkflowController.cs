using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Requests;
using WorkflowAPI.Responses;
using WorkflowAPI.Services;

[Route("api/[controller]")]
[ApiController]
public class UsuarioWorkflowController : ControllerBase
{
    private readonly DAL<UsuarioWorkflow> _dal;

    public UsuarioWorkflowController(DAL<UsuarioWorkflow> dal)
    {
        _dal = dal;
    }

    [HttpGet]
    public async Task<IActionResult> ListaTodos()
    {
        var usuarios = await _dal.ListarTodos();
        var response = usuarios.Select(u => new UsuarioWorkflowResponse(u.Id, u.Nome, u.AreaId, u.Perfil));

        return Ok(response);
    }

    [HttpGet("id")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var usuario = await _dal.ListarPor(u => u.Id == id);

        var usuarioResponse = usuario.Select(u => new UsuarioWorkflowResponse(u.Id, u.Nome, u.AreaId, u.Perfil));
        return Ok(usuarioResponse);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] UsuarioWorkflowRequest request)
    {
        var usuario = new UsuarioWorkflow
        {
            Nome = request.nome,
            AreaId = request.AreaId,
            Perfil = request.Perfil
        };

        await _dal.Adicionar(usuario);

        return CreatedAtAction(nameof(ListaTodos), new { id = usuario.Id }, usuario);

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] UsuarioWorkflowRequest request)
    {
        var usuarioExistente = await _dal.RecuperarPor(u => u.Id == id);
        if (usuarioExistente == null)
        {
            return NotFound($"Usuário com ID {id} não encontrado.");
        }
        usuarioExistente.Nome = request.nome;
        usuarioExistente.AreaId = request.AreaId;
        usuarioExistente.Perfil = request.Perfil;
        await _dal.Atualizar(usuarioExistente);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var usuario = await _dal.RecuperarPor(u => u.Id == id);
        if (usuario == null)
        {
            return NotFound($"Usuário com ID {id} não encontrado.");
        }
        await _dal.Deletar(usuario);
        return NoContent();
    }
}