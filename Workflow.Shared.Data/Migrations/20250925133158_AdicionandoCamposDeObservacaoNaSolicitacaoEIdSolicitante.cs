using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workflow.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoCamposDeObservacaoNaSolicitacaoEIdSolicitante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ObservacaoGerente",
                table: "SolicitacoesAcessoProgramas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObservacaoResponsavelPrograma",
                table: "SolicitacoesAcessoProgramas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObservacaoSolicitante",
                table: "SolicitacoesAcessoProgramas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObservacaoTI",
                table: "SolicitacoesAcessoProgramas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SolicitanteWorkflowId",
                table: "SolicitacoesAcessoProgramas",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ObservacaoGerente",
                table: "SolicitacoesAcessoProgramas");

            migrationBuilder.DropColumn(
                name: "ObservacaoResponsavelPrograma",
                table: "SolicitacoesAcessoProgramas");

            migrationBuilder.DropColumn(
                name: "ObservacaoSolicitante",
                table: "SolicitacoesAcessoProgramas");

            migrationBuilder.DropColumn(
                name: "ObservacaoTI",
                table: "SolicitacoesAcessoProgramas");

            migrationBuilder.DropColumn(
                name: "SolicitanteWorkflowId",
                table: "SolicitacoesAcessoProgramas");
        }
    }
}
