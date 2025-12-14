using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageEmbedding_Messages_MessageGuid",
                table: "MessageEmbedding");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MessageEmbedding",
                table: "MessageEmbedding");

            migrationBuilder.RenameTable(
                name: "MessageEmbedding",
                newName: "MessageEmbeddings");

            migrationBuilder.RenameIndex(
                name: "IX_MessageEmbedding_MessageGuid",
                table: "MessageEmbeddings",
                newName: "IX_MessageEmbeddings_MessageGuid");

            migrationBuilder.RenameIndex(
                name: "IX_MessageEmbedding_Embedding",
                table: "MessageEmbeddings",
                newName: "IX_MessageEmbeddings_Embedding");

            migrationBuilder.AlterColumn<Vector>(
                name: "Embedding",
                table: "MessageEmbeddings",
                type: "vector(384)",
                nullable: false,
                oldClrType: typeof(Vector),
                oldType: "vector(512)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MessageEmbeddings",
                table: "MessageEmbeddings",
                column: "EmbeddingGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageEmbeddings_Messages_MessageGuid",
                table: "MessageEmbeddings",
                column: "MessageGuid",
                principalTable: "Messages",
                principalColumn: "MessageGuid",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageEmbeddings_Messages_MessageGuid",
                table: "MessageEmbeddings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MessageEmbeddings",
                table: "MessageEmbeddings");

            migrationBuilder.RenameTable(
                name: "MessageEmbeddings",
                newName: "MessageEmbedding");

            migrationBuilder.RenameIndex(
                name: "IX_MessageEmbeddings_MessageGuid",
                table: "MessageEmbedding",
                newName: "IX_MessageEmbedding_MessageGuid");

            migrationBuilder.RenameIndex(
                name: "IX_MessageEmbeddings_Embedding",
                table: "MessageEmbedding",
                newName: "IX_MessageEmbedding_Embedding");

            migrationBuilder.AlterColumn<Vector>(
                name: "Embedding",
                table: "MessageEmbedding",
                type: "vector(512)",
                nullable: false,
                oldClrType: typeof(Vector),
                oldType: "vector(384)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MessageEmbedding",
                table: "MessageEmbedding",
                column: "EmbeddingGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageEmbedding_Messages_MessageGuid",
                table: "MessageEmbedding",
                column: "MessageGuid",
                principalTable: "Messages",
                principalColumn: "MessageGuid",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
