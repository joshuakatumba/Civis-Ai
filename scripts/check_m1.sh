#!/bin/sh
set -eu
# Use only a dedicated disposable test database. No database mocks.
export CIVIS_TEST_DATABASE=1
python3 scripts/run.py .venv/bin/alembic -c apps/api/alembic.ini upgrade head
python3 scripts/run.py .venv/bin/alembic -c apps/api/alembic.ini downgrade base
python3 scripts/run.py .venv/bin/alembic -c apps/api/alembic.ini upgrade head
.venv/bin/ruff check apps/api scripts
.venv/bin/mypy apps/api/civis apps/worker
python3 scripts/run.py .venv/bin/pytest -q
python3 scripts/feature_coverage.py
