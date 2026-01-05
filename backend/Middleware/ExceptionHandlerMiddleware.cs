using Amazon.S3;

namespace backend.Middleware
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlerMiddleware> _logger;

        public ExceptionHandlerMiddleware(RequestDelegate next, ILogger<ExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, $"Unauthorized: {context.Request.Path}");
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "forbidden",
                    message = "No Access"
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Bad request at {context.Request.Path}");
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "bad_request",
                    message = ex.Message
                });
            }
            catch(AmazonS3Exception ex)
            {
                _logger.LogError(ex, $"S3 error at {context.Request.Path}");
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "storage_unavailable",
                    message = "File storage is temporarily unavailable. Please try again later."
                });


            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Unhandled error at {context.Request.Path}");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "internal_error",
                    message = "Something went wrong. Please try again."
                });
            }
        }
    }
}
