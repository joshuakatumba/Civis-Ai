FastAPI async backend, SQLAlchemy/Alembic, Postgres, Redis and private S3 storage already exist.
SuperTokens self-hosted already implements signup, login, cookies and logout; TEMP_AUTH is not needed.
GET/PATCH /v1/me and atomic append-only quota accounting already exist.
Conversation CRUD, persisted messages and SSE meta/delta/citations/done/error already exist.
The Anthropic adapter and a server-side FAKE streaming provider already exist.
The React 18/Vite UI is split into components but still uses browser accounts and canned replies.
Template data, previews and Word downloads currently run only in the browser; backend routes/store are missing.
Feedback-ticket storage is missing; legal placeholders exist but currently allow public access.
OpenAPI HTTP serving is disabled; the existing app.openapi() schemas were inspected directly.
Current scope supersedes the old milestone gates: wire existing screens only, preserve CSS/markup/copy, and defer screens listed out of scope.
