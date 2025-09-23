using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Workflow.Shared.Data.Migrations
{
    /// <inheritdoc />
    public partial class VinculandoUsuarioIdentityComUsuarioWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UsuarioWorkflowId",
                table: "PessoasComAcesso",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PessoasComAcesso_UsuarioWorkflowId",
                table: "PessoasComAcesso",
                column: "UsuarioWorkflowId",
                unique: true,
                filter: "[UsuarioWorkflowId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_PessoasComAcesso_UsuariosWorkflow_UsuarioWorkflowId",
                table: "PessoasComAcesso",
                column: "UsuarioWorkflowId",
                principalTable: "UsuariosWorkflow",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PessoasComAcesso_UsuariosWorkflow_UsuarioWorkflowId",
                table: "PessoasComAcesso");

            migrationBuilder.DropIndex(
                name: "IX_PessoasComAcesso_UsuarioWorkflowId",
                table: "PessoasComAcesso");

            migrationBuilder.DropColumn(
                name: "UsuarioWorkflowId",
                table: "PessoasComAcesso");
        }
    }
}
