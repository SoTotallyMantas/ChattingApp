namespace backend.Interfaces
{
    public interface IEncryptionService
    {
        // Message encryption/decryption
        byte[] EncryptMessage(Guid channelGuid ,string? plainText);
        string? DecryptMessage(Guid channelGuid, byte[]? encryptedText);

        // File encryption/decryption 
        Task EncryptToStreamAsync(Guid channelGuid, Stream plain,Stream cipher, CancellationToken ct = default);
        Task DecryptFromStreamAsync(Guid channelGuid, Stream cipher, Stream plain, CancellationToken ct = default);
    }
}
