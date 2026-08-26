from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "local"
    SERVICE_NAME: str = "users"
    SERVICE_PORT: int = 9007
    DATABASE_URL: str = "postgresql+asyncpg://lavilla:lavilla@postgres:5432/lavilla"
    SECRET_KEY: str = "lavilla-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
