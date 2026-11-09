> Current owner scope (2026-11-07): integrate the supplied React 18/plain JSX/Vite UI with existing FastAPI/SuperTokens services. Preserve markup, copy and CSS. The earlier Next.js rebuild and milestone ordering below are historical; current scope and evidence are tracked in STATUS.md.

# AGENTS.md — Civis

Civis is an AI legal information assistant for Uganda. Users sign in, chat in Research or Drafting mode, fill document templates, download Word files, and (later) upload documents for analysis. Target scale: 5,000 registered users, about 100 concurrent streams at peak.

## Read first
docs/DECISIONS.md, docs/FEATURE_MAP.md, docs/API.md, docs/DATA_MODEL.md, docs/RAG_AND_GUARDRAILS.md, docs/DOCUMENT_UPLOADS.md, docs/EVALS.md, docs/BUILD_PLAN.md, docs/RISKS.md.
If documents contradict each other, stop and ask. Do not pick one silently.
frontend-reference/index.html is a visual reference only. Do not copy its code.

## Stack (fixed; changing it needs written approval)
- - Web: React 18 single-page app in plain JavaScript (.jsx), split into components. Vite is used only as the dev server and bundler. No Next.js, no TypeScript for existing UI code, no other framework.
- API: Python, FastAPI, async. SQLAlchemy 2 async, Alembic, asyncpg. Pydantic v2 for all request, response and LLM structured outputs.
- Workers: Arq on Redis.
- Database: managed Postgres with pgvector. Never run Postgres in a container for production.
- Cache, rate limits, queues: Redis.
- Files: S3-compatible object storage, private bucket, signed URLs only.
- Auth: see DECISIONS.md D1. Never implement password hashing, reset or verification yourself.
- LLM: Groq or Anthropic API behind an internal provider interface (owner approved Groq for testing on 2026-11-09). Model names come from environment config. Never hard-code.
- Observability: OpenTelemetry, Sentry, structured JSON logs, Langfuse for LLM traces.
- Everything runs as containers configured only by environment variables.

## Repository layout
- apps/web: frontend
- apps/api: FastAPI service
- apps/worker: Arq jobs
- content/templates: template definitions loaded by an import command. Never edited by Codex.
- content/corpus: source manifests only, no copyrighted text committed.
- evals: golden sets and eval runners
- infra: Dockerfiles, Terraform or Render blueprint
- docs: specification files

## Hard rules
1. Pin every dependency. Before using any library API, read its official documentation for the pinned version. Do not rely on memory. If docs and memory disagree, docs win.
2. Do not add a dependency without a one-line justification in the PR description.
3. Never write legal content: no template wording, no statute text, no sample legal advice, no citations, no caution or disclaimer wording. Legal content comes from files in content/ supplied by the owner.
4. Never invent or paraphrase a law in test fixtures presented as real. Mark every fixture FAKE.
5. No secrets in code, logs, tests or error messages. Redact personal data (emails, phone numbers, message text, uploaded document text) from logs and traces by default.
6. Every endpoint: authenticated unless listed public in API.md, input validated by schema, rate limited, covered by tests.
7. Database changes only through Alembic migrations. Never edit the auth provider's tables.
8. Quota changes only through the atomic ledger operation defined in DATA_MODEL.md. No read-then-write.
9. Small pull requests, one milestone task each. Tests first for quota, auth checks, ownership, citation verification, uploads isolation and payments.
10. If a requirement cannot be met as written, write the problem in the PR and stop. Do not substitute a workaround.
11. A milestone is done only when every acceptance criterion in BUILD_PLAN.md passes in CI. Do not start the next milestone otherwise.

## Definition of done for any change
Typecheck, lint, unit tests, integration tests against a real Postgres and Redis (not mocks), migration up and down, and updated docs.
