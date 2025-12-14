namespace backend.Interfaces
{
    public interface IS3StorageService
    {
        Task UploadAsync(string storageKey, Stream data, string contentType, CancellationToken ct);
        Task DeleteAsync(string storageKey, CancellationToken ct);
        Task<(Stream Stream, string ContentType)?> DownloadAsync(string storageKey, CancellationToken ct);
    }
}
