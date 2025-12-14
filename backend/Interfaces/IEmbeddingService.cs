namespace backend.Interfaces
{
    public interface IEmbeddingService
    {
        float[] Embed(string text);
    }
}
