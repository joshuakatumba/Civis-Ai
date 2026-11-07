# Known issues

- M1 backend foundations exist; M2–M6 have not started and the complete application is not available.
- Owner selected joshuakatumba/Civis-Ai for CI. Feature-branch push and CI execution pending.
- Official prebuilt MinIO images failed to pull; pinned upstream source build is in progress.
- API/worker image build and live storage readiness are not yet verified.
- External OpenTelemetry/Sentry delivery, Next.js auth flows and all model integrations are unverified.
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
- Full local run: 16 passed, one logout failure; corrected logout and ownership groups then passed (2 tests).
  No known remaining assertion failure; full remote CI on the final commit remains required.

## Resolved specification conflicts
- 2026-11-07 owner approved ledger uniqueness on (request_id, kind), refunds linked to spend.
- 2026-11-07 owner approved M1 backend before the M2 frontend despite FEATURE_MAP ordering.
