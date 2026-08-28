from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_env: str = "local"
    service_name: str = "notifications"
    service_port: int = 9006
    catalog_service_url: str = "http://catalog:9002"
    whatsapp_api_url: str = "https://graph.facebook.com/v21.0"
    whatsapp_phone_id: str = ""
    whatsapp_token: str = ""
    whatsapp_recipient: str = "+573245710972"
    whatsapp_auto_send_enabled: bool = False
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from: str = "whatsapp:+14155238886"
    twilio_to: str = "+573245710972"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
