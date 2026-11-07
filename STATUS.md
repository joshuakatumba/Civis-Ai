# Civis status

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
