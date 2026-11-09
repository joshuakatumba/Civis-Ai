# Civis status

## Owner screenshot fix — 2026-11-09

- Reproduced dismissal question: Laws.Africa retrieval 200 and valid Groq generation, followed by verification 429 with Retry-After: 2.
- Groq rate-limit responses now carry a sanitized typed delay. Research retries once only for delays <=15 seconds before any model output; repeated/long limits emit rate_limited with retry_after and refund before a delta.
- Preserved message status in React; empty streaming placeholders are hidden and incomplete empty responses render the existing availability text. No CSS/dependency changes.
- PASS: 16 API tests (12 Research plus four chat checks), strict typecheck, lint, Vite/container builds and browser FAKE-history failure/reload/streaming-placeholder regression. No schema change.
- Readiness wait now tolerates a connection reset during container startup. QA auth bucket expired normally; no limits weakened or Redis cleared.
- Live browser still returned an error. Subsequent sanitized diagnosis: retrieval and both model calls returned 200; generator returned three paragraphs; verifier accepted only index 1. Existing all-or-nothing policy therefore withheld the answer.
- Asked owner whether testing should show only supported paragraphs or keep withholding the whole answer. No partial-answer behavior implemented without that choice.
- Continue from that policy answer; do not redo template/chat integration or weaken individual source checks. Research release/advocate accuracy acceptance and CI remain unverified.

## Hosted Research implementation — 2026-11-09 (acceptance incomplete)

- Owner approved Laws.Africa hosted Uganda Knowledge Bases, replacing local index/embedding selection; D9/D10 and relevant docs updated.
- Implemented Research retrieval with Uganda/link/date/lifecycle filtering, bounded source context and follow-up user context.
- Implemented schema-validated segments, retrieved-ID/literal-quote checks and a separate model support check before any answer delta.
- Added migration 0006 for owned message citation metadata; React renders source links/dates and restores citations from history. CSS/dependencies unchanged.
- PASS: 13 chat/ownership/refund/disconnect/limit tests; subsequently seven focused research checks including fake-source integration, ownership, quote rejection and retrieval filters.
- PASS: lint, strict API typecheck, Vite build, API/web/worker container builds and migration 0006 up/down/up on disposable Postgres. Local readiness ok.
- Live Laws.Africa retrieval returned six Uganda passages. Groq returned 429 during real grounding tests (account header: 8000 tokens/minute).
- One context-budget fix: default source context reduced to 12000 chars, local output capped at 1024 tokens, verifier supplied only cited sources. Live generation still failed closed after this fix; no further model-fix loop performed.
- Live browser acceptance remains incomplete: initial readiness race fixed, then streaming-body QA issue fixed; final source-link/reload check has not passed. scripts/smoke_research.mjs preserves the failing acceptance harness.
- Do not claim research ready, legal accuracy or remote CI passed. No unsupported answer was accepted as a success. Existing template/chat milestones are not redone.
- Local RETRIEVAL_PROVIDER=laws_africa is enabled for testing and fails closed on research errors; other machines are unchanged. Default sample flag is disabled until explicitly configured.
- Next: diagnose the recorded live generation/check failure in a newly authorised fix cycle, verify a real answer/citation reload, and obtain advocate relevance/accuracy labels, production entitlements and approved safety/abstention wording.


## Laws.Africa access verified — 2026-11-09

- Owner proposed Laws.Africa and supplied a key, stored only in ignored private .env (LAWS_AFRICA_API_KEY).
- Live collection list and both Uganda metadata/retrieve calls returned HTTP 200: legislation-ug and judgments-ug.
- Both collections are labelled preview; sample results include source URLs/dates; judgment sample consists of summaries.
- Proposed hosted Knowledge Bases -> Groq -> citation/claim verification path documented in docs/LAWS_AFRICA.md.
- Owner subsequently approved hosted retrieval; the implementation/acceptance result is recorded above.
- Hosted Research is now enabled locally for testing; complete coverage, accuracy and production entitlement are not claimed.
- Remaining: live grounding acceptance and advocate relevance/answer evaluation.


## Research continuation — 2026-11-09

- Added retrieval evaluation runner in evals/retrieval.py: Recall@K, MRR@K, MAP@K, nDCG@K and query coverage.
- Separates retrieval from generation; missing runs score zero, FAKE fixtures never contribute to legal-quality reports.
- PASS: five arithmetic/input/aggregation checks, lint and strict typecheck; included in default pytest discovery.
- No app, UI, dependencies, database schema or prompt changes in this slice.
- Required input remains D9 approved corpus/access and D10 advocate query/source labels. content/corpus is empty.
- Asked owner for these inputs; no embedding choice, scraper, ingestion or source-backed answer claim was substituted.
- ULII terms fetch returned 403; no bulk/API permission assumed. See evals/README.md for runner contract and inputs.
- Continue with approved source ingestion/retrieval after those inputs; existing completed drafting/chat work stays intact.

## Immediate core testing — 2026-11-09

Owner prioritised a small testable core, approved the existing Civis.jsx templates for testing,
and authorised Groq with environment-only credentials. See [docs/CORE_TESTING.md](docs/CORE_TESTING.md).
- Groq streaming adapter implemented with existing httpx; provider/model/key remain environment settings.
- The configured model was verified against the account's available models. No key is committed or printed.
- 62 original templates imported unchanged with the owner's testing approval; import is idempotent.
- New drafts no longer hide the latest approved template version. FAKE fixtures remain separate.
- Chat history is persisted per owner/conversation; each request uses up to 60 completed non-file messages,
  limited by LLM_HISTORY_MAX_CHARS (default 24000). Older history remains in Postgres; no cross-chat memory/summarisation.
- Unfinished forms now autosave encrypted values per owner/conversation, pin template versions and reject stale saves.
- Natural-language Drafting selects approved templates and prefills literal stated facts; missing facts stay blank.
- Editing clears the active generated-file reference; earlier documents remain immutable in chat history.
- PASS: ten targeted API tests across drafting, chat memory, quota/refunds, ownership, generation and all-template text equivalence; additional live Groq prefill verification passes.
- PASS: live HTTP flow through the web proxy: signup, Groq stream, recall, history reload, quota, owner template
  preview/generate/reopen/download and logout. Readiness ok; frontend HTTP 200; all nine services running locally.
- PASS: lint, strict backend typecheck and API/web/worker container builds. No CSS/frontend dependency changes.
- PASS: browser live Groq prefill, literal facts/missing fields, edit/reload, generate/download, edit invalidation and regenerate; no browser errors/auth storage. Reproducible external-QA harness: scripts/smoke_drafting.mjs.
- PASS: migration 0005 down to 0004/up on disposable Postgres; encrypted drafts added through Alembic.
- Corrected a duplicate placeholder GROQ_API_KEY in private local .env that had overridden the verified key in Docker.
- Remaining core gap: verified legal RAG/citations and source-backed answer evaluation; uploads remain disabled.
- Run ./scripts/dev.sh on the updated branch to apply migration/import/build on another machine. No remote CI or AWS verification is claimed.
- AWS instance environment is not changed by local code/config updates; it needs the updated branch and its own private Groq settings.

## Product-readiness audit — 2026-11-09

The owner requested the full product task list, excluding deployment. See
[docs/PRODUCT_READINESS.md](docs/PRODUCT_READINESS.md): 188 open acceptance tasks across
research, source management, evaluation, approved drafting, uploads, accounts, customer flows,
quota, payments, privacy, support and product quality. This is a code/spec audit, not a new
implementation or test pass. Earlier fake-data integration results remain valid within their scope.
Current CI still references removed frontend scripts; real legal RAG and approved-content release
acceptance are incomplete. This register does not authorize a UI redesign or decide unresolved D9-D17 inputs.

## Active scope
Integrate the supplied React UI with the existing backend, preserving CSS, markup and copy.
The owner’s latest integration request supersedes the earlier port-only stop and Next.js milestone gates.

## Completed input
- M1 foundations: commit 7f57faf; CI 42384631605 passed 18 tests.
- M2 streaming backend: commit 2705de7; real auth, quota and conversation routes are reused.
- React 18/plain JSX/Vite component port: commit 18b6928. Root Civis.jsx is the owner reference.
- Read-only code inspection and ten-line NOTES.md completed. No new frontend dependencies authorized.

## Implemented and locally verified
Branch: integrate/civis-ui-api; two local integration commits (backend then frontend). Backend catalog, server documents and feedback storage are added.
React cookie auth, SSE, persisted chats, server quota and template flows now call the backend.
Delivery: one backend commit, one frontend commit; one-command startup; README and .env.example.

## Verification
- PASS: backend lint and strict typecheck; full API integration smoke; twenty-way quota race (exactly five spends).
- PASS: browser signup/login/logout; streaming chat/server counter; chat reload persistence.
- PASS: template category/search/Show all/form/escaped preview/generate/Word download; document reload.
- PASS: dark mode persistence and sidebar collapse; no JavaScript errors or browser auth storage.
- PASS: one-command ./scripts/dev.sh startup, API readiness, API/web Docker builds and Vite production build.
- PASS: migration 0004 up/down/up on disposable Postgres; CSS and frontend dependency files unchanged from 18b6928.
- Not run: remote integration CI, live Anthropic, physical microphone, production deployment/external telemetry.
API smoke used real Postgres, Redis, SuperTokens and private S3 with the labelled fake model.

## Fixes completed in the owner-requested follow-up
Strict UUID parsing now accepts JSON UUID strings only on optional conversation_id fields;
all other strict validation remains. Word XML is passed as a single payload to the archive writer.
Long XML strings are split without changing their contents. The previously failing checks now pass.

## Continuation
Local integration acceptance is complete for the active scope; no production readiness is claimed.
Run ./scripts/dev.sh and open http://localhost:53000. Services are currently running.
Keep the two integration commits on integrate/civis-ui-api; no remote push or CI result is claimed.
Do not redo foundations, redesign the UI, change CSS or add frontend dependencies.

## Deferred
Stop button, thumbs, citations UI, email verification/reset screens, chat/account deletion, export,
uploads, payments, real legal content/corpus and production release approval.

## Approved decisions
Ledger uniqueness is per (request_id, kind), refunds linked to spend.
M1 preceded M2 by owner approval; the active frontend is React/Vite rather than Next.js.

Container verification: docker compose build api web passed for both API and web images.
