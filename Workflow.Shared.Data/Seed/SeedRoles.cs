using Microsoft.AspNetCore.Identity;
using Workflow.Shared.Data.Enums;
using Workflow.Shared.Data.Modelos;

namespace Workflow.Shared.Data.Seed
{
    public static class RoleSeeder
    {
        public static async Task SeedRoles(RoleManager<PerfilDeAcesso> roleManager)
        {
            foreach (PerfilEnum perfil in Enum.GetValues(typeof(PerfilEnum)))
            {
                var roleName = perfil.ToString();
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new PerfilDeAcesso
                    {
                        Name = roleName,
                        Perfil = perfil
                    });
                }
            }
        }
    }
}
