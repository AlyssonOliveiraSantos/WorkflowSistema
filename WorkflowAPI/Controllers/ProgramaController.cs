using Microsoft.AspNetCore.Mvc;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Responses;

namespace WorkflowAPI.Controllers
{
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
            var programa = await _dal.ListarPor(p => p.Id == id);
            if (!programa.Any())
            {
                return NotFound($"Programa com ID {id} não encontrado.");
            }
            var programaResponse = programa.Select(p => new ProgramaResponse(p.Id, p.NomePrograma, p.AreaId ));
            return Ok(programaResponse);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ProgramaResponse programaResponse)
        {
            var programa = new Programa
            {
                NomePrograma = programaResponse.nome,
                AreaId = programaResponse.AreaId
            };
            await _dal.Adicionar(programa);
            return CreatedAtAction(nameof(GetById), new { id = programa.Id }, programa);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ProgramaResponse programaResponse)
        {
            var programaExistente = await _dal.RecuperarPor(p => p.Id == id);
            if (programaExistente == null)
            {
                return NotFound($"Programa com ID {id} não encontrado.");
            }

            programaExistente.NomePrograma  = programaResponse.nome;
            programaExistente.AreaId = programaResponse.AreaId;
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
            await _dal.Deletar(programa);
            return NoContent();
        }

    }
}
