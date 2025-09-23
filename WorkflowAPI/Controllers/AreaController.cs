using Microsoft.AspNetCore.Mvc;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Requests;
using WorkflowAPI.Responses;

namespace WorkflowAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AreaController : ControllerBase
    {
        private readonly DAL<Area> _dal;
        public AreaController(DAL<Area> dal)
        {
            _dal = dal;
        }

        [HttpGet]
        public async Task<IActionResult> ListaTodos()
        {
            var areas = await _dal.ListarTodos();

            var response = areas.Select(a => new AreaResponse(a.Id, a.NomeArea, a.Descricao, a.ResponsavelArea.Nome));

            return Ok(response);
        }

        [HttpGet("id")]
        public async Task<IActionResult> ObterPorId(int id)
        {

            var area = await _dal.ListarPor(a => a.Id == id);
            if (!area.Any())
            {
                return NotFound($"Área com ID {id} não encontrada.");
            }
            var areaResponse = area.Select(a => new AreaResponse(a.Id, a.NomeArea, a.Descricao, a.ResponsavelArea.Nome));
            return Ok(areaResponse);
        }


        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] AreaRequest areaRequest)
        {
            var novaArea = new Area
            {
                NomeArea = areaRequest.nome,
                Descricao = areaRequest.descricao,
                ResponsavelAreaId = areaRequest.responsavelAreaId 
            };

            await _dal.Adicionar(novaArea);

            return CreatedAtAction(nameof(Atualizar), new { id = novaArea.Id }, novaArea);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarArea(int id)
        {
            var area = await _dal.RecuperarPor(a => a.Id == id);
            if (area == null)
            {
                return NotFound($"Área com ID {id} não encontrada.");
            }

            try
            {
                await _dal.Deletar(area);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao deletar a área: {ex.Message}");
            }

            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] AreaRequest areaRequest)
        {
            var areaExistente = await _dal.RecuperarPor(a => a.Id == id);
            if (areaExistente == null)
                return NotFound($"Área com ID {id} não encontrada.");


            areaExistente.NomeArea = areaRequest.nome ?? areaExistente.NomeArea;
            areaExistente.Descricao = areaRequest.descricao ?? areaExistente.Descricao;
            areaExistente.ResponsavelAreaId = areaRequest.responsavelAreaId; 

            await _dal.Atualizar(areaExistente);

            return NoContent();
        }

    }
}
