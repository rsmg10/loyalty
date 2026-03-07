using Minio;
using Minio.DataModel.Args;

namespace Loyalty.Api.Services;

public sealed class MinioObjectStorage(ObjectStorageOptions options) : IObjectStorage
{
    private readonly ObjectStorageOptions _options = options;
    private readonly Lazy<IMinioClient> _client = new(() =>
        new MinioClient()
            .WithEndpoint(options.Endpoint)
            .WithCredentials(options.AccessKey, options.SecretKey)
            .WithSSL(options.UseSsl)
            .Build());

    public async Task<string> UploadAsync(
        Stream content,
        string contentType,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        await EnsureBucketAsync(cancellationToken);

        var putArgs = new PutObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(objectKey)
            .WithStreamData(content)
            .WithObjectSize(content.Length)
            .WithContentType(contentType);

        await _client.Value.PutObjectAsync(putArgs, cancellationToken);

        var baseUrl = _options.PublicBaseUrl.TrimEnd('/');
        return $"{baseUrl}/{_options.Bucket}/{objectKey}";
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_options.Endpoint)
            || string.IsNullOrWhiteSpace(_options.AccessKey)
            || string.IsNullOrWhiteSpace(_options.SecretKey)
            || string.IsNullOrWhiteSpace(_options.Bucket)
            || string.IsNullOrWhiteSpace(_options.PublicBaseUrl))
        {
            throw new InvalidOperationException("Object storage is not configured.");
        }
    }

    private async Task EnsureBucketAsync(CancellationToken cancellationToken)
    {
        var existsArgs = new BucketExistsArgs().WithBucket(_options.Bucket);
        if (await _client.Value.BucketExistsAsync(existsArgs, cancellationToken))
        {
            return;
        }

        var makeArgs = new MakeBucketArgs().WithBucket(_options.Bucket);
        await _client.Value.MakeBucketAsync(makeArgs, cancellationToken);
    }
}
