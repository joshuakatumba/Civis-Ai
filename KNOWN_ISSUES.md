# Known issues

- Active React/backend integration passes local API and browser acceptance; remote CI and production remain unverified.
- Local fake-data flows are verified; they do not establish legal accuracy or production readiness.
- Groq and the 62 owner-approved testing templates are configured locally; legal source records remain FAKE and verified production legal content is absent.
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
- Unfinished forms now autosave encrypted, version-pinned snapshots; expected revision conflicts protect newer edits. Pending edits need a completed save before closing (browser warning provided).
- Browser live Groq prefill/autosave/reload/generate/download/regenerate now pass without JavaScript errors; external harness is committed in scripts/smoke_drafting.mjs.
- Legal RAG/citations remain missing; natural-language approved-template prefill is implemented. No source-verified legal-answer claim is made.
- Removed a duplicate placeholder key from private local .env after it caused Docker-only Groq 401 responses. Other machines must keep a single valid GROQ_API_KEY entry.

## Research continuation
- content/corpus and advocate retrieval labels are absent; D9/D10 inputs are required for ingestion/model selection.
- Retrieval scorer passes five FAKE arithmetic/input tests; no real retrieval or generation quality score is claimed.
- ULII full terms could not be fetched (403); API/bulk access and permitted use remain unverified.

## Laws.Africa access update
- Platform key successfully retrieves both Uganda legislation and judgments Knowledge Bases (preview).
- Access is verified; hosted retrieval architecture choice, account production terms/limits, completeness and legal accuracy remain unverified.
- Current chat still has no retrieval; live API access does not close citation/answer acceptance.

## Hosted Research acceptance — 2026-11-09
- Owner approved hosted Uganda retrieval; no local embedding/index pipeline is required for this integration.
- Fake-source integration and seven focused checks pass, including ownership, refunds, literal-quote/unknown-ID rejection and retrieval filters.
- Real retrieval works; real grounded generation did not pass after the single context-budget fix. Observed Groq 429 and later fail-closed generation/check failures; exact later failure cause remains unresolved.
- Live browser citation/reload acceptance has not passed; do not treat implemented source links as verified browser acceptance.
- No dedicated owner-approved abstention/urgent/refusal messages or advocate accuracy dataset exists. Generic Drafting chat remains without retrieval.
- Defaults/feature flag isolate the new path; private local testing enables it and returns the existing availability error on failure, without an ungrounded fallback.

## Owner screenshot follow-up
- Confirmed immediate failure: retrieval and generation returned 200, but verification hit Groq 429 with a two-second Retry-After.
- Added one bounded pre-output retry and typed rate-limit SSE errors/refunds, preserving source verification.
- Empty streaming placeholders are hidden; restored incomplete messages display the existing availability error.
- Browser QA signup exhausted its local proxy auth bucket; the counter expires normally, with no production limit relaxed.

- Follow-up live diagnosis after bounded retry: both Groq calls returned 200; verifier accepted one of three generated paragraphs. All-or-nothing policy still returns an error. Owner subsequently chose whole-answer withholding; no partial answers are allowed.
- PASS: 16 API checks, builds/static checks, and separate FAKE browser regression for error display/reload and hidden empty streaming placeholders. Real grounded-browser acceptance remains open.

## Strict verification follow-up
- Owner confirmed whole-answer withholding; generation now requires exact source evidence for every cited source and one concise paragraph.
- Explicit verifier indexes and new literal-evidence gates preserve the all-or-nothing policy; no failed paragraph can leak as a partial answer.
- The live dismissal-question browser check still returns an error with v2 evidence-first generation. No passing live Research acceptance is claimed; the failure-stage diagnosis remains required.

## Presentation/runtime correction
- The deployed screenshot came from the canned provider, not from labels on the approved template definitions. Normal startup defaults and fallback behavior are corrected.
- Real services now require actual credentials; an invalid/missing provider no longer returns a diagnostic reply.
- Existing server .env is private and not changed by git pull; run scripts/configure_live.py before rebuilding. Existing storage/database passwords are retained.
- Fifteen configuration/auth/catalog/history/isolation/document tests pass; real Research verification remains open and is not hidden by this change.
