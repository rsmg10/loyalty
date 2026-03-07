namespace Loyalty.Api.Services;

public interface IObjectStorage
{
    Task<string> UploadAsync(
        Stream content,
        string contentType,
        string objectKey,
        CancellationToken cancellationToken = default);
}
