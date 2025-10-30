using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Migrations;
using Workflow.Shared.Data.Modelos;

#nullable disable

namespace Workflow.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class AjustandoPermissoesParaoIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Perfil",
                table: "UsuariosWorkflow");

            migrationBuilder.AddColumn<int>(
                name: "Perfil",
                table: "PerfisDeAcesso",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Perfil",
                table: "PerfisDeAcesso");

            migrationBuilder.AddColumn<int>(
                name: "Perfil",
                table: "UsuariosWorkflow",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
