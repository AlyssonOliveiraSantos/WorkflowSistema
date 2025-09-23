using Microsoft.AspNetCore.Identity;
using Workflow.Shared.Modelos.Modelos;

namespace Workflow.Shared.Data.Modelos
{
    public class PessoaComAcesso : IdentityUser<int>
    {

        public int? UsuarioWorkflowId { get; set; }

        public virtual UsuarioWorkflow? UsuarioWorkflow { get; set; } = null;
    }
}
