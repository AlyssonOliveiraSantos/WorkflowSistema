using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using Workflow.Shared.Data.Modelos;
using Workflow.Shared.Modelos.Modelos;

namespace Workflow.Shared.Data.Banco
{
    public class WorkflowDbContext : IdentityDbContext<PessoaComAcesso, PerfilDeAcesso, int>
    {
        public WorkflowDbContext(DbContextOptions<WorkflowDbContext> options)
            : base(options)
        {
        }

        DbSet<Area> Areas => Set<Area>();
        DbSet<Programa> Programas => Set<Programa>();
        DbSet<UsuarioWorkflow> UsuariosWorkflow => Set<UsuarioWorkflow>();
        DbSet<SolicitacaoAcessoPrograma> SolicitacoesAcessoProgramas => Set<SolicitacaoAcessoPrograma>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<SolicitacaoAcessoPrograma>().
                HasOne(s => s.UsuarioWorkflow).
                WithMany().
                HasForeignKey(s => s.UsuarioWorkflowId).
                OnDelete(DeleteBehavior.Restrict);

            builder.Entity<SolicitacaoAcessoPrograma>().
                HasOne(s => s.Programa).
                WithMany().
                HasForeignKey(s => s.ProgramaId).
                OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Area>()
             .HasOne(a => a.ResponsavelArea)
             .WithMany()
             .IsRequired(false)
             .HasForeignKey(a => a.ResponsavelAreaId)
             .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PessoaComAcesso>().
                HasOne( p => p.UsuarioWorkflow).
                WithOne()
                .HasForeignKey<PessoaComAcesso>(u => u.UsuarioWorkflowId).
                OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PessoaComAcesso>(entity =>
            {
                entity.ToTable("PessoasComAcesso");
            });

            builder.Entity<PerfilDeAcesso>(entity =>
            {
                entity.ToTable("PerfisDeAcesso");
            });
        }

    }
}
