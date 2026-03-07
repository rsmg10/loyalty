namespace Loyalty.Api.Services;

public sealed class ObjectStorageOptions
{
    public string Provider { get; set; } = "minio";
    public string Endpoint { get; set; } = "";
    public string AccessKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string Bucket { get; set; } = "";
    public string PublicBaseUrl { get; set; } = "";
    public bool UseSsl { get; set; }
}
