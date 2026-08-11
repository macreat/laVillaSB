from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://lavilla:lavilla@postgres:5432/lavilla"
    s3_endpoint_url: str = "http://minio:9000"
    s3_access_key_id: str = "lavilla"
    s3_secret_access_key: str = "lavilla123"
    s3_bucket: str = "catalog-media"
    s3_region: str = "us-east-1"
    cdn_base_url: str | None = None
    media_presign_expires_seconds: int = 900

    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")


settings = Settings()
