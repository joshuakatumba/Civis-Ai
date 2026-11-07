"""M1 worker runtime. Feature jobs are added only in their gated milestones."""

import json
from typing import Any

from arq.connections import RedisSettings
from civis.config import Settings
from civis.logs import configure_logging


def serialize(value: dict[str, Any]) -> bytes:
    return json.dumps(value).encode()


def deserialize(value: bytes) -> dict[str, Any]:
    result: dict[str, Any] = json.loads(value)
    return result


async def health_job(context: dict[str, Any]) -> bool:
    return bool(await context["redis"].ping())


async def startup(context: dict[str, Any]) -> None:
    configure_logging()


class WorkerSettings:
    functions = [health_job]
    redis_settings = RedisSettings.from_dsn(Settings.from_env().redis_url.get_secret_value())
    on_startup = startup
    job_serializer = staticmethod(serialize)
    job_deserializer = staticmethod(deserialize)
    log_results = False
    keep_result = 0
    max_jobs = 10
