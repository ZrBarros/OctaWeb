from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore")

    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 3333
    database_url: str
    frontend_origin: str
    public_api_url: str
    jwt_access_secret: str = Field(min_length=32)
    jwt_refresh_secret: str = Field(min_length=32)
    jwt_reset_secret: str = Field(min_length=32)
    access_token_ttl: str = "15m"
    refresh_token_ttl: str = "30d"
    reset_token_ttl: str = "15m"
    cookie_secure: bool = False
    upload_dir: str = "uploads"
    max_upload_bytes: int = Field(default=2 * 1024 * 1024, gt=0)
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_secure: bool = False
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "Octacore <nao-responda@octacore.local>"
    password_reset_url: str

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, value: str) -> str:
        if value not in {"development", "test", "production"}:
            raise ValueError("deve ser development, test ou production")
        return value

    @property
    def sqlalchemy_database_url(self) -> str:
        parsed = urlsplit(self.database_url)
        query = [(key, value) for key, value in parse_qsl(parsed.query) if key != "schema"]
        scheme = "postgresql+psycopg" if parsed.scheme in {"postgres", "postgresql"} else parsed.scheme
        return urlunsplit((scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))

    @property
    def database_schema(self) -> str:
        parsed = urlsplit(self.database_url)
        return dict(parse_qsl(parsed.query)).get("schema", "octacore")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]

