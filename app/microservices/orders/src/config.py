from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://lavilla:lavilla@postgres:5432/lavilla"
    REDIS_URL: str = "redis://redis:6379/3"
    CATALOG_SERVICE_URL: str = "http://catalog:9002"
    NOTIFICATIONS_URL: str = "http://notifications:9006"
    CART_TTL_HOURS: int = 72

    class Config:
        env_file = ".env"

settings = Settings()
