using Amazon.S3;
using Amazon.S3.Internal;
using Amazon.S3.Model;
using backend.Interfaces;

namespace backend.Services
{
    public class S3StorageService : IS3StorageService
    {
        private readonly IAmazonS3 _s3;
        private readonly string _bucketName;

        public S3StorageService(IAmazonS3 s3)
        {
            _s3 = s3;
            _bucketName = Environment.GetEnvironmentVariable("S3_BUCKET") ?? throw new InvalidOperationException("S3_BUCKET environment variable is not set.");
        }
        
        public async Task UploadAsync(string storageKey, Stream data, string contentType, CancellationToken ct)
        {
            try
            {
                if (data.CanSeek)
                {
                    data.Position = 0;
                }

                await _s3.PutObjectAsync(new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = storageKey,
                    ContentType = contentType,
                    InputStream = data,
                    AutoCloseStream = false,
                    UseChunkEncoding = false,
                    Headers =
                    {
                        ContentLength = data.CanSeek ? data.Length : 0
                    }
                }, ct);
            }
            catch ( AmazonS3Exception ex)
            {
                throw new Exception("File failed to upload",ex);
            }
        }
        public async Task DeleteAsync(string storageKey, CancellationToken ct)
        {
            try
            {
                await _s3.DeleteObjectAsync(new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = storageKey,
                }, ct);
            }
            catch (AmazonS3Exception ex)
            {
                throw new Exception("Failed to delete",ex);
            }
        }
        public async Task<(Stream Stream, string ContentType)?> DownloadAsync(string storageKey, CancellationToken ct)
        {
            try
            {
                var response = await _s3.GetObjectAsync(_bucketName,storageKey, ct);
                return (response.ResponseStream, response.Headers.ContentType);
            }
            catch ( AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                throw new Exception("File to download not found", ex);
                
            }
        }
        

        
    }
}
