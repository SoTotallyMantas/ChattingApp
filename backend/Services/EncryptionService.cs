using backend.Context;
using backend.Interfaces;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace backend.Services
{
    public class EncryptionService : IEncryptionService
    {
        private const int NonceSize = 12;
        private const int TagSize = 16;
        private const int KeySize = 32;
        private const int ChannelKeySize = 32;
        private readonly VoxlockDbContext _db;
        private readonly byte[] _masterKey;
        
        public EncryptionService(VoxlockDbContext db)
        {
            _db = db;

            var base64_key = Environment.GetEnvironmentVariable("ENCRYPTION_MASTER_KEY") ?? throw new InvalidOperationException("NO ENCRYPTION KEY SET");

            _masterKey = Convert.FromBase64String(base64_key);
            if (_masterKey.Length != KeySize)
            {
                throw new InvalidOperationException("Encryption key must be base64 32 bytes");
            }
        }

        public byte[] EncryptMessage(Guid channelGuid ,string? plainText)
        {
            var plainBytes = string.IsNullOrEmpty(plainText)
                ? Array.Empty<byte>()
                : Encoding.UTF8.GetBytes(plainText);

            var channelKey = GetOrCreateChannelKey(channelGuid);
            return EncryptBytes(plainBytes, channelKey);
        }

        public string? DecryptMessage(Guid channelGuid,byte[]? encryptedText)
        {
            if (encryptedText == null || encryptedText.Length == 0)
            {
                return null;
            }
            var channelKey = GetOrCreateChannelKey(channelGuid);
            var plainBytes = DecryptBytes(encryptedText,channelKey);
            if (plainBytes.Length == 0)
            {
                return null;
            }

            return Encoding.UTF8.GetString(plainBytes);
        }
        public async Task EncryptToStreamAsync(Guid channelGuid, Stream plain, Stream cipher, CancellationToken ct = default)
        {
            using var memoryStream = new MemoryStream();
            await plain.CopyToAsync(memoryStream, ct);

            var plainBytes = memoryStream.ToArray();
            var channelKey = GetOrCreateChannelKey(channelGuid);
            var encrypted = EncryptBytes(plainBytes,channelKey);
            await cipher.WriteAsync(encrypted, ct);
            cipher.Position = 0;
        }
        public async Task DecryptFromStreamAsync(Guid channelGuid, Stream cipher, Stream plain, CancellationToken ct = default)
        {
            using var memoryStream = new MemoryStream();
            await cipher.CopyToAsync(memoryStream, ct);
            var encrypted = memoryStream.ToArray();
            var channelKey = GetOrCreateChannelKey(channelGuid);
            var plainBytes = DecryptBytes(encrypted, channelKey);
            await plain.WriteAsync(plainBytes, ct);
            plain.Position = 0;

        }

        private byte[] EncryptBytes(byte[] plainText, byte[] key)
        {
            var nonce = RandomNumberGenerator.GetBytes(NonceSize);
            var tag = new byte[TagSize];
            var ciphertext = new byte[plainText.Length];

            using var aes = new AesGcm(key, TagSize);
            aes.Encrypt(nonce, plainText, ciphertext, tag);

            var result = new byte[NonceSize + TagSize + ciphertext.Length];
            nonce.CopyTo(result.AsSpan(0, NonceSize));
            tag.CopyTo(result.AsSpan(NonceSize, TagSize));
            ciphertext.CopyTo(result.AsSpan(NonceSize + TagSize));

            return result;
       

        }
        private byte[] DecryptBytes(byte[] encrypted, byte[] key)
        {
            if (encrypted.Length < NonceSize + TagSize)
            {
                throw new CryptographicException("Encrypted payload too small");
            }
            var nonce = encrypted[..NonceSize];
            var tag = encrypted[NonceSize..(NonceSize + TagSize)];
            var ciphertext = encrypted[(NonceSize + TagSize)..];

            var plainText = new byte[ciphertext.Length];

            using var aes = new AesGcm(key, TagSize);
            aes.Decrypt(nonce, ciphertext, tag, plainText);

            return plainText;
        }

        private byte[] GetOrCreateChannelKey(Guid channelGuid)
        {
            var record = _db.ChannelEncryptionKeys
                .SingleOrDefault(k => k.ChannelGuid == channelGuid);
            if (record == null)
            {
                var rawKey = RandomNumberGenerator.GetBytes(ChannelKeySize);
                var wrappedKey = EncryptWithMaster(rawKey);

                record = new Models.ChannelEncryptionKey
                {
                    ChannelEncryptionKeyGUID = Guid.NewGuid(),
                    ChannelGuid = channelGuid,
                    EncryptedKey = wrappedKey,
                    CreatedAt = DateTime.UtcNow
                };

                _db.ChannelEncryptionKeys.Add(record);
                _db.SaveChanges();

                return rawKey;

            }
            else
            {
                return DecryptWithMaster(record.EncryptedKey);
            }
        }

        private byte[] EncryptWithMaster(byte[] plaintext)
        {
            return EncryptBytes(plaintext, _masterKey);
        }
        private byte[] DecryptWithMaster(byte[] encrypted)
        {
            return DecryptBytes(encrypted, _masterKey);
        }
    }
}
