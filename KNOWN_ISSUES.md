# Known issues

- Active React/backend integration passes local API and browser acceptance; remote CI and production remain unverified.
- Local fake-data flows are verified; they do not establish legal accuracy or production readiness.
- Local development uses labelled fake model/template/legal data; approved production content is absent.
- Production deployment, payments, legal approvals, corpus/evals and external telemetry remain unverified.
- Uploads stay disabled; exactly-15-page quota policy remains unresolved before uploads are enabled.
- Existing provider dependencies emit non-failing datetime/Redis-close deprecation warnings.

## Historical verification
- M1 CI 42384631605 passed all 18 checks; do not rebuild foundations.
- M2 backend auth/ownership/quota/refund/proxy tests passed. A random-password fixture policy error was corrected.
- Previous Next.js signup/reset browser failures belong to the replaced frontend; React native-fetch needs verification.
- Redis AOF repair completed; backup /tmp/civis-redis-aof-backup-20261107. Do not repeat without a new failure.
- Old Next.js build/advisory reports and port parity harness do not verify the current integration.

## Resolved integration blockers
- Document generation 422: strict UUID fields rejected JSON strings. Field-specific UUID parsing fixed rendering and feedback without relaxing other validation.
- Word generation: removed a misplaced argument separator/unary plus so OOXML is written as one string.
- Split the three long XML literals; backend lint and strict typecheck now pass.
- API smoke now completes generation/download, ownership, feedback, theme, legal, schema and logout assertions.
- The twenty-way race still yields exactly five spends at balance five.

## Verified locally
- Browser signup, streaming chat/server quota, reload, template search/category/paging/form/escaped preview/generate/download and document reload pass.
- Dark mode survives reload; collapse, logout and login pass; no JavaScript errors or browser auth storage.
- One-command startup, readiness, API/web Docker builds, Vite build and migration round trip pass.
- CSS and frontend dependency files remain unchanged against port input 18b6928.
- Anonymous session probes return expected HTTP 401 before login; the browser check excludes those expected network messages.
- Live Anthropic, microphone hardware, remote integration CI and production/external telemetry were not verified.

## Core testing update — 2026-11-09
- Live Groq streaming and per-conversation recall now pass; credentials/models are environment-only.
- The owner approved 62 original templates for testing; original wording is imported unchanged.
- Preview/Word equivalence passes for all 62; approved-version selection no longer hides an approved version behind a draft.
- Unfinished form edits still do not persist; generated document snapshots and chat messages do.
- Temporary browser QA files were absent, so this turn verified real HTTP flows rather than claiming a new browser pass.
- Legal RAG/citations and natural-language template prefill remain missing; no source-verified legal-answer claim is made.
