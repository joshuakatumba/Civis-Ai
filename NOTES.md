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
Added migration 0004 for templates, template_versions, encrypted private documents and feedback tickets.
Added authenticated catalog, server preview/Word/download, feedback, legal and OpenAPI routes; generation acceptance is blocked.
Added native cookie auth, fetch SSE, server quota, persisted chat loading and server template seams without frontend dependencies or CSS changes.
TEMP_AUTH is not used: SuperTokens remains the credential and session authority.
Local development permits unverified signup via REQUIRE_EMAIL_VERIFICATION=false; production explicitly refuses it.
Added a one-command startup script, Vite/nginx proxies, .env.example and README; full startup/browser flow remains unverified.
Out of scope: stop button, thumbs, citations UI, email verification/reset screens, delete chat, delete account and export.
Quota test passed: twenty parallel requests with balance five produced exactly five successful spends.
API smoke failed at document generation (422); its single attempted fix did not clear strict UUID validation; no further retry performed.
Backend typecheck still fails at render_word unary string plus; three long XML lines still fail lint after the same static-check fix cycle.
Vite production build and Python compile passed; migration 0004 up/down/up passed on the disposable real database.
CSS and frontend package/lock files are byte unchanged against input commit 18b6928.
Full browser acceptance, complete startup, final CI and downstream smoke assertions have not run to completion.

Container verification: docker compose build api web passed for both API and web images.
Owner follow-up reopened the recorded blockers: field-specific UUID parsing, correct single OOXML payload, and wrapped XML literals now pass lint/typecheck/API smoke.
API smoke completed all assertions against real auth/Postgres/Redis/S3 with the fake model: 2 tests passed, two existing botocore deprecation warnings.
Browser smoke passed signup, streamed chat/server count, reload, template category/search/Show all/form/escaped preview/generate/download, document reload, dark persistence, collapse, logout/login.
The browser smoke found no JavaScript/unexpected console errors or account/password/session localStorage; expected anonymous HTTP 401 session probes are excluded.
./scripts/dev.sh completed successfully; API readiness returned ok and both containers built with the fixes.
No live Anthropic, microphone hardware, remote integration CI, production deployment or external telemetry check was run.
Historical failure lines above are retained as history; current status is in STATUS.md and KNOWN_ISSUES.md.
