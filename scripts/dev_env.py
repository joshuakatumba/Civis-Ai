"""Create local-only credentials without printing or committing them."""

import os
import secrets
from pathlib import Path

path = Path(".env")
if path.exists():
    raise SystemExit(".env already exists; left unchanged")
password = secrets.token_hex(24)
auth_password = secrets.token_hex(24)
storage_password = secrets.token_hex(24)
values = {
    "APP_ENV": "development",
    "POSTGRES_PASSWORD": password,
    "AUTH_DB_PASSWORD": auth_password,
    "DATABASE_URL": f"postgresql+asyncpg://civis:{password}@localhost:55432/civis",
    "AUTH_DATABASE_URL": f"postgresql://auth:{auth_password}@auth-db:5432/auth",
    "REDIS_URL": "redis://localhost:56379/0",
    "SUPERTOKENS_URI": "http://localhost:53567",
    "SUPERTOKENS_API_KEY": secrets.token_hex(24),
    "API_DOMAIN": "http://localhost:58000",
    "WEB_DOMAIN": "http://localhost:53000",
    "S3_ENDPOINT": "http://localhost:59000",
    "S3_ACCESS_KEY": secrets.token_hex(12),
    "S3_SECRET_KEY": storage_password,
    "S3_BUCKET": "civis-private",
    "LOG_HMAC_KEY": secrets.token_hex(32),
    "SMTP_HOST": "localhost",
    "SMTP_PORT": "51025",
    "SMTP_FROM": "civis@localhost",
    "ALLOW_UNAPPROVED_TEMPLATES": "false",
    "LOAD_FAKE_SEED": "false",
    "FEATURE_UPLOADS": "false",
}
fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
with os.fdopen(fd, "w") as file:
    file.write("".join(f"{key}={value}\n" for key, value in values.items()))
print("Created private .env for local development")
