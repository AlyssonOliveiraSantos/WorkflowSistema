using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workflow.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoColunaPermissoesEFinalizadoNaTabelaSolicitacaoAcessoPrograma : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Finalizado",
                table: "SolicitacoesAcessoProgramas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Permissoes",
                table: "SolicitacoesAcessoProgramas",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Finalizado",
                table: "SolicitacoesAcessoProgramas");

            migrationBuilder.DropColumn(
                name: "Permissoes",
                table: "SolicitacoesAcessoProgramas");
        }
    }
}
