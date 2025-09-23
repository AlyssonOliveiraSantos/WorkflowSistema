using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Workflow.Shared.Modelos.Modelos
{
    public class Area
    {
        public int Id { get; set; }
        public string NomeArea { get; set; }
        public string Descricao { get; set; }
        public int? ResponsavelAreaId { get; set; }

        public virtual UsuarioWorkflow ResponsavelArea { get; set; }
        public virtual ICollection<Programa> Programas { get; set; } = new List<Programa>();
        public virtual ICollection<UsuarioWorkflow> Usuarios { get; set; } = new List<UsuarioWorkflow>();
    }
}
