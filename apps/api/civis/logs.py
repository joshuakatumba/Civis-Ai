import json
import logging


class SafeFormatter(logging.Formatter):
    """Allowlisted telemetry: arbitrary messages, extras and exceptions never leave process."""

    def format(self, record: logging.LogRecord) -> str:
        return json.dumps({"level": record.levelname, "event": "service_log"})


def configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(SafeFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.INFO)
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "supertokens", "httpx"):
        logger = logging.getLogger(name)
        logger.handlers = []
        logger.propagate = True
