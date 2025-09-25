using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Workflow.Shared.Modelos.Modelos
{
    public class Programa
    {
        public int Id { get; set; }
        public string NomePrograma { get; set; } = null!;
        public int AreaId { get; set; }
        public bool Ativo { get; set; } = true;

        public virtual Area Area { get; set; }
    }
}
