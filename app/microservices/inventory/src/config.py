from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://lavilla:lavilla@postgres:5432/lavilla"
    CATALOG_URL: str = "http://catalog:9002"

    class Config:
        env_file = ".env"

settings = Settings()
