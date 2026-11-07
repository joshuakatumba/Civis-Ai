import os
from collections.abc import Mapping
from typing import Literal

from pydantic import BaseModel, ConfigDict, SecretStr


class Settings(BaseModel):
    model_config = ConfigDict(frozen=True)
    environment: Literal["development", "test", "production"] = "development"
    database_url: SecretStr
    redis_url: SecretStr
    supertokens_uri: str
    supertokens_api_key: SecretStr
    api_domain: str
    web_domain: str
    s3_endpoint: str
    s3_access_key: SecretStr
    s3_secret_key: SecretStr
    s3_bucket: str
    log_hmac_key: SecretStr
    smtp_host: str
    smtp_port: int
    smtp_from: str
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    allow_unapproved_templates: bool = False
    load_fake_seed: bool = False
    fake_legal_text: bool = False
    feature_uploads: bool = False
    free_prompts: int = 20

    @classmethod
    def from_env(cls, source: Mapping[str, str] | None = None) -> "Settings":
        env = os.environ if source is None else source
        production = env.get("APP_ENV") == "production"
        flags = ["ALLOW_UNAPPROVED_TEMPLATES", "LOAD_FAKE_SEED", "FAKE_LEGAL_TEXT"]
        if production and any(env.get(key, "").lower() not in ("", "false", "0") for key in flags):
            raise ValueError("Unsafe production content configuration")
        required = [
            "DATABASE_URL",
            "REDIS_URL",
            "SUPERTOKENS_URI",
            "SUPERTOKENS_API_KEY",
            "API_DOMAIN",
            "WEB_DOMAIN",
            "S3_ENDPOINT",
            "S3_ACCESS_KEY",
            "S3_SECRET_KEY",
            "S3_BUCKET",
            "LOG_HMAC_KEY",
            "SMTP_HOST",
            "SMTP_PORT",
            "SMTP_FROM",
        ]
        if any(not env.get(key) for key in required):
            raise ValueError(
                "Missing production configuration"
                if production
                else "Missing application configuration"
            )
        data: dict[str, object] = {key.lower(): env[key] for key in required}
        data["environment"] = env.get("APP_ENV", "development")
        for key in flags + ["FEATURE_UPLOADS"]:
            data[key.lower()] = env.get(key, "false")
        data["free_prompts"] = env.get("FREE_PROMPTS", "20")
        data["smtp_username"] = env.get("SMTP_USERNAME")
        data["smtp_password"] = env.get("SMTP_PASSWORD")
        settings = cls.model_validate(data)
        if settings.free_prompts < 0:
            raise ValueError("Invalid prompt allowance")
        if production and (
            not settings.api_domain.startswith("https://")
            or not settings.web_domain.startswith("https://")
            or not settings.s3_endpoint.startswith("https://")
        ):
            raise ValueError("Unsafe production transport configuration")
        if settings.feature_uploads:
            raise ValueError("Uploads disabled: scanning and M4b acceptance not verified")
        return settings
