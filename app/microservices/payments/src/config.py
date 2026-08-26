from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "local"
    SERVICE_NAME: str = "payments"
    SERVICE_PORT: int = 9005
    DATABASE_URL: str = "postgresql+asyncpg://lavilla:lavilla@postgres:5432/lavilla"
    REDIS_URL: str = "redis://redis:6379/4"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
