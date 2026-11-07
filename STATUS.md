# Civis status

## Active task — exact JSX port (latest owner request)
- Goal replaced the full-stack build: port root Civis.jsx literally; stop after component split, browser checks and build.
- Branch: port/civis-jsx, based on M2 commit 2705de7; no port commit yet. Remote civis-ci points to joshuakatumba/Civis-Ai.
- Do not redesign, change logic/text/classes/DOM, wire APIs, or touch backend. React 18/plain JSX; Vite bundler only.
- Only direct dependencies: react/react-dom 18.3.1, vite 8.3.6, @vitejs/plugin-react 6.2.1. Installed; npm reported zero vulnerabilities.
- Split complete in apps/web/src: main.jsx, App.jsx, styles/civis.css, data/{templates,kinds}.js,
  lib/{doc,storage,api}.js, hooks/useMic.js, components/{Icon,Auth,Shell,Sidebar,ChatView,Message,Composer,Templates,DocPanel,Filled,Modal}.jsx.
- Components/data/helpers were extracted directly from Civis.jsx. Shell retains state/handlers; extracted Message receives m/openDoc/chat.
- CSS exact-match assertion passed: only doubled checkmark escape changed to a single backslash. All three SEAM comments preserved.
- Original apps/web backed up at /tmp/civis-web-before-port-43p8kfw5/web; backend files unchanged on this branch.
- Root AGENTS.md has an existing OWNER edit changing frontend to React 18/Vite; do not overwrite it. Root Civis.jsx is owner input, unchanged/untracked.
- Named DESIGN FREEZE / WORK LIMITS documents were not found; NOTES.md records this; follow explicit no-change constraints.
- Vite dev server was started at http://127.0.0.1:5173 (log /tmp/civis-port-vite.log; exec session 47330 may survive interruption).
- Temporary QA-only files currently INSIDE apps/web: baseline.html, src/Original.jsx, src/baseline-main.jsx. REMOVE before build/commit.
- QA harness: /tmp/civis-port-qa/parity.mjs. Playwright tooling is outside the app at /tmp/civis-port-qa/node_modules (not a project dependency).
- Harness runs original and split apps in separate contexts; compares DOM at 17 flow stages, console errors, and downloaded bytes.
- FIRST QA RUN stopped on the ORIGINAL app: search "Lease" returned 2 results, not the harness's assumed 1 (also matches Photo Release Form).
  Fix ONLY that harness expectation to 2; no application fix needed. Then run the one corrected QA cycle.
- Remaining: complete browser parity; remove QA-only files; npm run build; verify source/CSS/dependency/backend diffs; one commit, final <=8 lines.
- Do not resume M3/full-stack milestones. Do not retry the old M2 auth-debug permission question; it is superseded by this task.


## Binding rules
- Fixed stack and layout in AGENTS.md; dependencies pinned and official docs checked before API use.
- Never author legal content or modify content/templates; owner provides reviewed content.
- All development seed records visibly labelled FAKE – development only.
- Production must reject unsafe flags, fake loaded content, and missing secrets.
- Auth belongs to SuperTokens; no application password/reset/verification implementation.
- Auth, schema validation, rate limits and ownership queries on every protected endpoint.
- Quota mutations use an atomic ledger operation; real Postgres/Redis integration tests.
- Personal information, credentials, message/document text excluded from logs and traces.
- M0 replaced by inline checks by explicit request; M1–M6 remain gated by CI acceptance.
- No M2 implementation until M1 acceptance passes in CI; one commit per milestone, no push to main.
- One fix-and-rerun per failed test group; persistent failures recorded in KNOWN_ISSUES.md.

## Approved specification resolutions (2026-11-07)
- Owner approved UNIQUE(request_id, kind), with refunds linked to the original spend.
- Owner approved M1 foundations before the M2 Next.js rebuild.

## Decisions used
- D1 SuperTokens self-hosted: default, unconfirmed.
- D2 Render/container deployment: default, unconfirmed.
- D3 20 lifetime free prompts: default, unconfirmed.
- D4 chat and prefill consume quota; render/download free: default, unconfirmed.
- D5 consume on first token; refund before first token: default, unconfirmed.
- D8 static referral link, no reward: default, unconfirmed.
- D11 English only: default, unconfirmed; owner supplies notice.
- D14 10 MB/30 pages, 5 daily uploads, 50 MB storage: default, unconfirmed.
- D15 1 prompt below 15 pages, 2 above: default, unconfirmed; exactly 15 ambiguous.
- D16 uploads 30 days; D17 warn on sensitive types: default, unconfirmed, counsel pending.
- D6/D7/D9/D10/D12/D13 unresolved; fake/provider interfaces only where authorized.

## Milestones
| Milestone | State |
|---|---|
| M1 | Local tests exercised; container verification and remote CI pending |
| M2 | BLOCKED: M1 CI acceptance |
| M3 | BLOCKED: M2, real corpus/benchmark, owner retrieval threshold |
| M4 | BLOCKED: M3 CI acceptance |
| M4b | FLAGGED OFF: FEATURE_UPLOADS defaults off; M3 and advocate sign-off pending |
| M5 | BLOCKED: prior milestone CI acceptance; real payment provider unresolved |
| M6 | BLOCKED: prior milestone CI acceptance; owner operational validations |

## Inline checks
- Docker daemon 29.1.3 available; access is now unrestricted.
- SSE through nginx: heartbeat and disconnect cancel upstream; incomplete state/refund checks pass.
- pgvector 0.8.0 confirmed; filtered recall comparison pending retrieval tables.
- Backend signup/verify/login/reset/session and logout tested with real SuperTokens 10.1.0.
- Next.js auth checks: signup/reset fail; public/mobile/PWA pass. Licence quote/source/date: docs/DEPENDENCIES.md; owner/counsel to confirm.
- Local checks: quota 100-way race/replays, ownership, production guards, worker and redaction pass.
- Alembic 0001/0002 up/down/up, lint and strict Python typecheck pass; container builds ongoing.
- Scanner/EICAR and signed upload limits: not run; uploads disabled.

## Feature coverage
Generated by `python scripts/feature_coverage.py`; DONE requires an API, frontend path and tests.

| Feature | Status | Reason |
|---|---|---|
| Landing page, Sign up | BLOCKED | M2 browser acceptance pending |
| Landing page, Log in | BLOCKED | M2 browser acceptance pending |
| Email verification | BLOCKED | M2 browser acceptance pending |
| Password reset | BLOCKED | M2 browser acceptance pending |
| Logout (menu, confirm) | BLOCKED | M2 browser acceptance pending |
| Account row (email, initial) | BLOCKED | M2 browser acceptance pending |
| "X of 20 free prompts left" | BLOCKED | M2 browser acceptance pending |
| Theme toggle (Dark mode) | BLOCKED | M2 browser acceptance pending |
| Delete account (new, required) | BLOCKED | M2 browser acceptance pending |
| Export my data (new, required) | BLOCKED | M2 browser acceptance pending |
| Chat list in sidebar | BLOCKED | M2 browser acceptance pending |
| New chat | BLOCKED | M2 browser acceptance pending |
| Open a chat | BLOCKED | M2 browser acceptance pending |
| Chat title | BLOCKED | M2 browser acceptance pending |
| Delete chat (new) | BLOCKED | M2 browser acceptance pending |
| Mode switch (Research / Drafting) | BLOCKED | M2 browser acceptance pending |
| Send message and streaming reply | BLOCKED | M2 browser acceptance pending |
| Stop generating (new) | BLOCKED | M2 browser acceptance pending |
| Citations under answers (new) | BLOCKED | M2 browser acceptance pending |
| Thumbs up/down (new) | BLOCKED | M2 browser acceptance pending |
| Hero suggestions | BLOCKED | M2 browser acceptance pending |
| Disclaimer footer | BLOCKED | M2 browser acceptance pending |
| Error and limit states (new) | BLOCKED | M2 browser acceptance pending |
| Template search | BLOCKED | M2 browser acceptance pending |
| Category chips with counts | BLOCKED | M2 browser acceptance pending |
| Template grid, Show all | BLOCKED | M2 browser acceptance pending |
| Click template, form panel | BLOCKED | M2 browser acceptance pending |
| Prefilled example values | BLOCKED | M2 browser acceptance pending |
| Preview tab | BLOCKED | M2 browser acceptance pending |
| Generate | BLOCKED | M2 browser acceptance pending |
| File card, Open | BLOCKED | M2 browser acceptance pending |
| File card, Download | BLOCKED | M2 browser acceptance pending |
| "Describe the document you need" | BLOCKED | M2 browser acceptance pending |
| Fields never invented | BLOCKED | M2 browser acceptance pending |
| Attach (paperclip) in composer | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Upload progress and status chip | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Attachment shown on a message | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Page and excerpt citations | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Source viewer for the uploaded file | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| My uploads list | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Delete upload | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Unsupported or unreadable messages | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Key-terms summary card | FLAGGED OFF | M4b, scanner and advocate acceptance pending |
| Subscribe (menu and composer) | BLOCKED | M2 browser acceptance pending |
| Subscription status | BLOCKED | M2 browser acceptance pending |
| Payment confirmation | BLOCKED | M2 browser acceptance pending |
| Invite friends | BLOCKED | M2 browser acceptance pending |
| Feedback and support | BLOCKED | M2 browser acceptance pending |
| Privacy Policy, Terms | BLOCKED | M2 browser acceptance pending |
| Share about Civis on X | BLOCKED | M2 browser acceptance pending |
| Install app | BLOCKED | M2 browser acceptance pending |
| Sidebar collapse | BLOCKED | M2 browser acceptance pending |
| Microphone and waveform | BLOCKED | M2 browser acceptance pending |

## Next action
Fix QA harness Lease count to 2, run original/split browser parity, remove the three temporary QA files, run Vite production build.
Commit the exact port once on port/civis-jsx. Keep backend untouched; stop after task 4. Final message at most 8 lines.
