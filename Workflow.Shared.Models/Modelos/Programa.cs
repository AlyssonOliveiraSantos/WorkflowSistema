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
        [Required]
        public string NomePrograma { get; set; } = null!;
        [Required]
        public int AreaId { get; set; }

        public virtual Area Area { get; set; }
    }
}
