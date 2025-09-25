using Microsoft.AspNetCore.Identity;
using Workflow.Shared.Data.Enums;

namespace Workflow.Shared.Data.Modelos
{
    public class PerfilDeAcesso : IdentityRole<int>
    {
        public PerfilEnum Perfil { get; set; }
    }
}
