using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Requests;
using WorkflowAPI.Responses;

namespace WorkflowAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProgramaController : ControllerBase
    {
        private readonly DAL<Programa> _dal;

        public ProgramaController(DAL<Programa> dal)
        {
            _dal = dal;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var programas = await _dal.ListarTodos();
            var programasResponse = programas.Select(p => new ProgramaResponse(p.Id, p.NomePrograma, p.AreaId ));
            return Ok(programasResponse);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var programas = await _dal.ListarPor(p => p.Id == id);
            var programasAtivos = programas.Where(p => p.Ativo);
            if (!programasAtivos.Any())
            {
                return NotFound($"Programa com ID {id} não encontrado.");
            }
            var programaResponse = programasAtivos.Select(p => new ProgramaResponse(p.Id, p.NomePrograma, p.AreaId ));
            return Ok(programaResponse);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ProgramaRequest programaRequest)
        {
            var programa = new Programa
            {
                NomePrograma = programaRequest.nome,
                AreaId = programaRequest.AreaId
            };
            await _dal.Adicionar(programa);
            return CreatedAtAction(nameof(GetById), new { id = programa.Id }, programa);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ProgramaUpdateRequest programaResponse)
        {
            var programaExistente = await _dal.RecuperarPor(p => p.Id == id);
            if (programaExistente == null)
            {
                return NotFound($"Programa com ID {id} não encontrado.");
            }

            programaExistente.NomePrograma  = programaResponse.nome ?? programaExistente.NomePrograma;
            programaExistente.AreaId = programaResponse.AreaId ?? programaExistente.AreaId;
            programaExistente.Ativo = programaResponse.ativo ?? programaExistente.Ativo;
            await _dal.Atualizar(programaExistente);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var programa = await _dal.RecuperarPor(p => p.Id == id);
            if (programa == null)
            {
                return NotFound($"Programa com ID {id} não encontrado.");
            }
            programa.Ativo = false;
            await _dal.Atualizar(programa);
            return NoContent();
        }

    }
}
