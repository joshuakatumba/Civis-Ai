# Known issues

- M1 is complete; M2 is in progress. The complete application is not available yet.
- M1 commit 7f57faf is on joshuakatumba/Civis-Ai, branch build/civis-m1.
- M1 CI 42384631605 passed all 18 tests, lint, typecheck and reversible migrations.
- Official prebuilt MinIO images were unavailable; the pinned upstream source build succeeded.
- API, worker and MinIO containers started; private bucket and readiness success/failure checks passed.
- External OpenTelemetry/Sentry/Langfuse delivery and optional live Anthropic integration remain unverified.
- Provider dependencies emit datetime/Redis-close deprecation warnings; they did not fail tests.
- D15 leaves the cost for exactly 15 pages undefined; resolve before enabling uploads.
- Owner content, legal approvals, real corpus, advocate datasets and release thresholds absent.
- No production host/CDN, production credentials, payment provider or counsel retention decision supplied.
- No production readiness or end-to-end application behavior has been verified.

## Test history
- Quota, ownership, unverified allowance, production data guards and worker integration tests passed locally.
- Initial auth failure: Core 9.3.0 did not support SDK CDI 5.3. Fixed with Core 10.1.0; rerun passed.
- New reset/logout test found empty POST bodies rejected by rate middleware. Fixed; targeted rerun passed.
- Sentry typing-only imports initially blocked collection. Moved behind TYPE_CHECKING; rerun collected successfully.
- Plans foreign key was moved to Alembic revision 0002 rather than modifying applied revision 0001.
  Revised migrations completed up/down/up on the disposable test database.
- Full local run initially found one logout failure; corrected logout and ownership groups passed.
  Final M1 CI passed all 18 tests. No M1 assertion failure remains.

## Resolved specification conflicts
- 2026-11-07 owner approved ledger uniqueness on (request_id, kind), refunds linked to spend.
- 2026-11-07 owner approved M1 backend before the M2 frontend despite FEATURE_MAP ordering.

## M2 verification and blockers
- Backend conversation ownership, auth, quota errors, failures/refunds and proxy disconnect/heartbeat checks pass.
- Full local backend run: 28 passed, 1 optional live smoke skipped, 1 fixture setup error.
  Generated passwords could omit a digit. Added a fixed FAKE policy prefix plus random suffix; targeted rerun passed.
- Local Redis AOF had a corrupt 151-byte tail after restart. Backup: /tmp/civis-redis-aof-backup-20261107; native Redis repair succeeded.
- Frontend strict typecheck, lint and production build passed; public/mobile/PWA browser test passed.
- Persistent browser failures after one functional fix cycle:
  tests/workspace.spec.ts: signup does not reach verification screen; reset rerun does not show completion notice.
  Hypotheses: cookie/session handling or local shared-IP auth throttling; backend provider flows pass.
  Awaiting owner approval for one additional focused cycle. No failing assertion was removed.
- Data export/deletion jobs are not implemented (M5); their UI controls remain unavailable.
- Eight moderate npm advisories remain for M6; the detected high PostCSS advisory was fixed.
