using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Workflow.Shared.Modelos.Enums;

namespace Workflow.Shared.Modelos.Modelos
{
    public class UsuarioWorkflow
    {
        public int Id { get; set; }
        public string Nome { get; set; } = null!;
        public int AreaId { get; set; }
        public PerfilEnum Perfil { get; set; }
        public virtual Area Area { get; set; } = null!;
    }
}
