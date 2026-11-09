import os
from collections.abc import Mapping
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, SecretStr


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
    fake_model: bool = False
    require_email_verification: bool = True
    s3_public_endpoint: str | None = None
    document_encryption_key: SecretStr | None = None
    feature_uploads: bool = False
    free_prompts: int = 20
    llm_provider: Literal["disabled", "fake", "anthropic", "groq"] = "disabled"
    llm_model: str | None = None
    groq_api_key: SecretStr | None = None
    groq_base_url: str = "https://api.groq.com/openai/v1"
    owner_templates_file: str | None = None
    drafting_confidence_threshold: float = Field(default=0.6, ge=0, le=1)
    llm_history_max_chars: int = Field(default=24000, ge=8000, le=200000)
    anthropic_api_key: SecretStr | None = None
    anthropic_base_url: str = "https://api.anthropic.com"
    llm_max_output_tokens: int = Field(default=2048, ge=1, le=8192)
    legal_content_file: str | None = None

    @classmethod
    def from_env(cls, source: Mapping[str, str] | None = None) -> "Settings":
        env = os.environ if source is None else source
        production = env.get("APP_ENV") == "production"
        flags = ["ALLOW_UNAPPROVED_TEMPLATES", "LOAD_FAKE_SEED", "FAKE_LEGAL_TEXT", "FAKE_MODEL"]
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
        data["require_email_verification"] = env.get("REQUIRE_EMAIL_VERIFICATION", "true")
        data["s3_public_endpoint"] = env.get("S3_PUBLIC_ENDPOINT")
        data["document_encryption_key"] = env.get("DOCUMENT_ENCRYPTION_KEY")
        data["free_prompts"] = env.get("FREE_PROMPTS", "20")
        data["smtp_username"] = env.get("SMTP_USERNAME")
        data["smtp_password"] = env.get("SMTP_PASSWORD")
        data["llm_provider"] = env.get("LLM_PROVIDER", "disabled")
        data["legal_content_file"] = env.get("LEGAL_CONTENT_FILE")
        data["llm_model"] = env.get("LLM_MODEL")
        data["groq_api_key"] = env.get("GROQ_API_KEY")
        data["groq_base_url"] = env.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        data["owner_templates_file"] = env.get("OWNER_TEMPLATES_FILE")
        data["drafting_confidence_threshold"] = env.get("DRAFTING_CONFIDENCE_THRESHOLD", "0.6")
        data["llm_history_max_chars"] = env.get("LLM_HISTORY_MAX_CHARS", "24000")
        data["anthropic_api_key"] = env.get("ANTHROPIC_API_KEY")
        data["anthropic_base_url"] = env.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
        data["llm_max_output_tokens"] = env.get("LLM_MAX_OUTPUT_TOKENS", "2048")
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
        if production and settings.llm_provider == "fake":
            raise ValueError("Fake provider prohibited in production")
        if production and not settings.require_email_verification:
            raise ValueError("Production requires verified email")
        if (
            production
            and settings.llm_provider == "anthropic"
            and (not settings.llm_model or not settings.anthropic_api_key)
        ):
            raise ValueError("Missing model provider configuration")
        if settings.llm_provider == "groq" and (
            not settings.groq_api_key or not settings.llm_model
        ):
            raise ValueError("Missing Groq provider configuration")
        return settings
