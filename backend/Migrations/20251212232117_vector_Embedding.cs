using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class vector_Embedding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.CreateTable(
                name: "MessageEmbedding",
                columns: table => new
                {
                    EmbeddingGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    MessageGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ChannelGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Embedding = table.Column<Vector>(type: "vector(384)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageEmbedding", x => x.EmbeddingGuid);
                    table.ForeignKey(
                        name: "FK_MessageEmbedding_Messages_MessageGuid",
                        column: x => x.MessageGuid,
                        principalTable: "Messages",
                        principalColumn: "MessageGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MessageEmbedding_Embedding",
                table: "MessageEmbedding",
                column: "Embedding")
                .Annotation("Npgsql:IndexMethod", "ivfflat")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_MessageEmbedding_MessageGuid",
                table: "MessageEmbedding",
                column: "MessageGuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MessageEmbedding");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");
        }
    }
}
