# Civis

Uganda legal-information application under construction. The repository currently implements
M1 foundations and an M2 workspace in progress. M2 browser auth and CI acceptance are pending;
this is not yet the complete application. See [STATUS.md](STATUS.md) and [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## Local foundations

Requirements: Docker with Compose v2 and Python 3.12. Ports are bound to localhost.
Use the repository root for these commands.

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.lock
python3 scripts/dev_env.py
docker compose up -d postgres auth-db auth redis storage mail
python3 scripts/run.py .venv/bin/alembic -c apps/api/alembic.ini upgrade head
python3 scripts/run.py .venv/bin/python scripts/bootstrap_storage.py
docker compose up -d --build api worker web
```

The environment command generates private local credentials into ignored `.env`, with mode 0600.
It never overwrites an existing file. `scripts/run.py` loads this file without printing credentials.
MinIO is built from a pinned upstream source release because its published images are unavailable.
The first storage build downloads the Go toolchain and dependencies and can take several minutes.

- API: `http://localhost:58000/v1/health`; readiness: `/v1/ready`.
- Provider-owned auth routes: `http://localhost:58000/auth/`.
- Mail catcher: `http://localhost:58025`.
- Frontend: `http://localhost:53000`. Browser auth acceptance is currently blocked; see KNOWN_ISSUES.md.
- ClamAV is defined under the `uploads` Compose profile. Uploads remain disabled until M4b passes.

Local containers are scoped to the `civis-dev` Compose project. Other existing services are not used.
Production Postgres must be managed; this Compose file is development-only.

## Development seed

```sh
LOAD_FAKE_SEED=true python3 scripts/run.py .venv/bin/python scripts/seed.py
```

M1 seeds only the `FAKE – development only` provenance marker from `content/dev-fake/`.
It does not supply legal text, corpus or templates. Imports and feature seed mechanisms belong
to later milestones. Production rejects fake flags and loaded fake provenance even after flags are cleared.

## Tests

Use a dedicated disposable database for migration reversal; the check script selects `civis_test`.
Create it once after starting the local services:

```sh
docker compose exec -T postgres createdb -U civis civis_test
python3 scripts/run.py sh scripts/check_m1.sh
```

The script runs Alembic up/down/up, lint, strict backend typechecking and tests against real
Postgres, Redis, SuperTokens and SMTP. It never substitutes database or auth mocks.
To run a targeted test without reversing migrations:

```sh
CIVIS_TEST_DATABASE=1 python3 scripts/run.py .venv/bin/pytest apps/api/tests/test_quota.py -q
```

`python3 scripts/feature_coverage.py` regenerates the feature status table. A row is not DONE
until its API, frontend path and tests are all verified. The GitHub Actions M1 workflow uses the
same dependencies and real services. A local pass does not by itself open the next milestone.

## Configuration and deployment

The API and worker are containerized and configured by environment. `APP_ENV=production`
rejects unsafe flags, missing required settings, insecure public transport and unsafe loaded content.
Development uses the labelled FAKE model provider and legal-content records. Real Anthropic model names and credentials come from the environment. Billing, template imports and deployment blueprints are not implemented yet.
The production deployment runbook is M6 work; deployment is not currently supported.

`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` enables explicit, payload-free request spans.
`SENTRY_DSN` enables sanitized error reports. Raw request data, arbitrary exceptions, headers,
personal information and document text are excluded. External exporter delivery has not been verified.

Owner decisions and release requirements are listed in [OWNER_TASKS.md](OWNER_TASKS.md).
Pinned dependencies, justifications and official API references are in [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md).
# Civis-for-Nathan
