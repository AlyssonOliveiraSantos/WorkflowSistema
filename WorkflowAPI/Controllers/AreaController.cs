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
            var areasAtivas = areas.Where(a => a.Ativo);

            var response = areasAtivas.Select(a => new AreaResponse(a.Id, a.NomeArea, a.Descricao, a.ResponsavelArea?.Id));

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
            var areaResponse = area.Select(a => new AreaResponse(a.Id, a.NomeArea, a.Descricao, a.ResponsavelArea?.Id));
            return Ok(areaResponse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] AreaUpdateRequest areaRequest)
        {
            var areaExistente = await _dal.RecuperarPor(a => a.Id == id);
            if (areaExistente == null)
                return NotFound($"Área com ID {id} não encontrada.");


            areaExistente.NomeArea = areaRequest.nome ?? areaExistente.NomeArea;
            areaExistente.Descricao = areaRequest.descricao ?? areaExistente.Descricao;
            areaExistente.ResponsavelAreaId = areaRequest.responsavelAreaId;
            areaExistente.Ativo = areaRequest.ativo ?? areaExistente.Ativo;

            await _dal.Atualizar(areaExistente);

            return NoContent();
        }


        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] AreaRequest areaRequest)
        {
            var novaArea = new Area
            {
                NomeArea = areaRequest.nome,
                Descricao = areaRequest.descricao,
                ResponsavelAreaId = areaRequest?.responsavelAreaId
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
                area.Ativo = false;
                await _dal.Atualizar(area);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao deletar a área: {ex.Message}");
            }

            return NoContent();
        }


    }
}
