using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using Microsoft.VisualStudio.TestPlatform.Utilities;
using System.ComponentModel.DataAnnotations;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Helper;

namespace Workflow.Test.API
{
    public class WorkflowWebApplicationFactory : WebApplicationFactory<Program>
    {
        public WorkflowDbContext Context;

        private IServiceScope _scope;

        public WorkflowWebApplicationFactory()
        {
            _scope = Services.CreateScope();
            Context = _scope.ServiceProvider.GetRequiredService<WorkflowDbContext>();
            Context.Database.EnsureCreated();
        }

        protected override IHost CreateHost(IHostBuilder builder)
        {
            builder.ConfigureServices(service =>
            {
                service.RemoveAll(typeof(DbContextOptions<WorkflowDbContext>));

                service.AddDbContext<WorkflowDbContext>(options => 
                options
                .UseLazyLoadingProxies()
                .UseSqlServer("Server=localhost,1433;Database=WorkflowDb;User Id=sa;Password=MinhaSenha123.;TrustServerCertificate=True"));
            });

            return base.CreateHost(builder);
        }


        public async Task<HttpClient> GetClientWithAccessTokenAsync()
        {
            var client = this.CreateClient();
            var user = new WorkflowAPI.Helper.LoginRequest{ login: "", senha: ""}

    }
}