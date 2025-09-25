using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Workflow.Shared.Modelos.Enums;

namespace Workflow.Shared.Modelos.Modelos
{
    public class SolicitacaoAcessoPrograma
    {
        public int Id { get; set; }
        public int SolicitanteWorkflowId { get; set; }
        public int UsuarioWorkflowId { get; set; }
        public string? ObservacaoSolicitante { get; set; } = string.Empty;



        public int ProgramaId { get; set; }
        public DateTime DataSolicitacao { get; set; }

        public bool? AprovadoGerente { get; set; }
        public DateTime? DataAprovacaoGerente { get; set; }
        public string? ObservacaoGerente { get; set; } = string.Empty;

        public bool? AprovadoResponsavelPrograma { get; set; }
        public DateTime? DataAprovacaoResponsavelPrograma { get; set; }
        public string? ObservacaoResponsavelPrograma { get; set; } = string.Empty;

        public bool? AprovadoTI { get; set; }
        public DateTime? DataAprovacaoTI { get; set; }
        public string? ObservacaoTI { get; set; } = string.Empty;

        public Permissao Permissoes { get; set; }

        public bool Finalizado { get; set; } = false;



        public virtual UsuarioWorkflow UsuarioWorkflow { get; set; } = null!;
        public virtual Programa Programa { get; set; } = null!;
    }
}
