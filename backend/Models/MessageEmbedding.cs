using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;
using Pgvector.EntityFrameworkCore;
namespace backend.Models
{
    public class MessageEmbedding
    {
        public Guid EmbeddingGuid { get; set; }
        public Guid MessageGuid { get; set; }
        public Guid ChannelGuid { get; set; }

        [Column(TypeName = "vector(384)")]
        public Pgvector.Vector Embedding { get; set; } = default!;
    }
}
