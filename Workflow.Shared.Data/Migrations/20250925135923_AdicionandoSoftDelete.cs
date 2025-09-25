using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workflow.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "UsuariosWorkflow",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Programas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "PessoasComAcesso",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Areas",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "UsuariosWorkflow");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Programas");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "PessoasComAcesso");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Areas");
        }
    }
}
