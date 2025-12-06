using Amazon.S3;
using backend.Context;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace backend.Controllers
{
    [ApiController]
    [Route("test")]
    public class TestController : ControllerBase
    {
        /*
        private readonly IConnectionMultiplexer _redis;
        private readonly IAmazonS3 _s3;
        //private readonly VoxlockDbContext _db;
        public TestController( IAmazonS3 s3, IConnectionMultiplexer redis)
        {
            _redis = redis;
            _s3 = s3;
          //  _db = db;
        }
        [HttpGet("postgres")]
        public async Task<IActionResult> TestPostgres()
        {
            try
            {
                //  var connect = _db.Database.CanConnect();
                // return Ok($"EF Core PostgreSQL: {(connect ? "OK" : "FAILED")}");
                return Ok();

            }
            catch (Exception ex)
            {

                return Problem("EF FAILED: " + ex.Message);
            }
        }
        [HttpGet("redis")]
        public IActionResult TestRedis()
        {
            try
            {
                var db = _redis.GetDatabase();
                db.StringSet("voxlock:test", "ok", TimeSpan.FromSeconds(10));
                var val = db.StringGet("voxlock:test");

                return Ok($"Redis: OK (value= '{val}')");
            }
            catch (Exception ex)
            {
                return Problem("Redis Failed: " + ex.Message);
            }
        }

        [HttpGet("s3")]
        public async Task<IActionResult> TestS3()
        {
            var bucket = Environment.GetEnvironmentVariable("S3_BUCKET");

            if(string.IsNullOrWhiteSpace(bucket))
            {
                return Problem("S3 Failed: S3_Bucket environment variable is empty");
            }

            try
            {
                var list = await _s3.ListObjectsV2Async(
                    
                    new Amazon.S3.Model.ListObjectsV2Request {  BucketName = bucket}
                );

                return Ok($"S3 (Garage): OK - {list.KeyCount} Objects");
            }
            catch (Exception ex)
            {
                return Problem("S3 Failed: " + ex.Message);
            }
        }
        [HttpGet("janus")]
        public async Task<IActionResult> TestJanus()
        {
            try
            {
                using var http = new HttpClient();
                var url = "http://janus:8088/janus";
                var request = new
                {
                    janus = "ping",
                    transaction = Guid.NewGuid().ToString()
                };
                var response = await http.PostAsJsonAsync(url,request);
                var text = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    return Problem($"Janus Failed: {response.StatusCode}: {text}");

                }
                return Ok($"Janus OK: {text}");
            }
            catch(Exception ex)
            {
                return Problem("Janus Failed: " + ex.Message);
            }

        }
        */

    }
}
