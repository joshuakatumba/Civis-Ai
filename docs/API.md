# API contract

Base path /v1. JSON unless noted. Auth via the auth service's session. All errors use one envelope with a stable machine code and a user-safe message.

## Error codes
unauthenticated (401), email_unverified (403), forbidden (403), not_found (404), validation_failed (422), quota_exhausted (402), rate_limited (429, with retry-after), model_unavailable (503), content_blocked (422), conflict (409), internal (500).
Uploads: unsupported_file (422), file_too_large (413), unreadable_document (422), document_rejected (422), upload_quota_exceeded (429).

## Endpoints
| Method and path | Auth | Request | Response | Rules |
|---|---|---|---|---|
| GET /me | yes | none | id, email, name, plan, prompts_left, preferences, verified | |
| PATCH /me | yes | name, preferences | updated profile | Whitelist fields. |
| DELETE /me | yes | confirmation | 202 | Async purge, audit logged. |
| GET /me/export | yes | none | 202 with job id | Delivered by signed link. |
| POST /me/consents | yes | document, version | 204 | Append only. |
| GET /conversations | yes | cursor, limit | page of conversations | Own only. |
| POST /conversations | yes | mode | conversation | |
| GET /conversations/{id} | yes | none | conversation with messages and citations | Ownership enforced in the query, not after. |
| PATCH /conversations/{id} | yes | title | conversation | |
| DELETE /conversations/{id} | yes | none | 204 | |
| POST /conversations/{id}/messages | yes | content (max 8,000 chars), mode, attachment_ids (optional) | SSE stream | See below. validation_failed if any attachment is not ready or not owned. |
| POST /messages/{id}/feedback | yes | rating, optional comment | 204 | One per user per message. |
| GET /templates/categories | yes | none | categories with counts | |
| GET /templates | yes | category, q, limit, cursor | templates | |
| GET /templates/{slug} | yes | none | field schema, version, review status | |
| POST /templates/{slug}/render | yes | values, format (html or docx) | html string, or document record | Validate every value against its field type and max length. Escape all output. |
| POST /drafting/prefill | yes | description (max 2,000 chars) | template slug or null, values, missing fields, confidence | Counts as a prompt. |
| GET /documents | yes | cursor | documents | |
| GET /documents/{id} | yes | none | html preview | |
| GET /documents/{id}/download | yes | none | redirect to signed URL, 5 minute expiry | |
| DELETE /documents/{id} | yes | none | 204 | |
| POST /uploads | yes | filename, mime, size | upload id and signed upload URL (10 minute expiry, size and type enforced) | Blocked until M4b. |
| POST /uploads/{id}/complete | yes | none | upload with status | Verifies object exists, queues scanning. |
| GET /uploads | yes | cursor | uploads | |
| GET /uploads/{id} | yes | none | upload with status and reason | |
| GET /uploads/{id}/pages/{n} | yes | none | extracted text of page n | |
| DELETE /uploads/{id} | yes | none | 204 | Purges file, text, chunks, embeddings. |
| GET /billing/plans | yes | none | plans | |
| POST /billing/checkout | yes | plan id | redirect URL | |
| GET /billing/status | yes | none | plan, renews or expires on | |
| POST /webhooks/{provider} | public | provider payload | 200 | Verify signature, reject replays, idempotent by provider event id. |
| POST /feedback | yes | category, message, optional conversation id | 204 | Rate limited. |
| GET /legal/{doc} | public | none | versioned text | |
| GET /health, /ready | public | none | status | /ready checks Postgres, Redis, storage. |

## Streaming message contract
Request creates the user message, consumes one prompt through the ledger, then streams. Event order:
1. meta: user message id, assistant message id, prompts_left.
2. delta: text chunks. Repeat.
3. citations: verified citations only, sent once after the text completes. The text is not final until verification passes (RAG_AND_GUARDRAILS.md section 5).
4. done: finish reason and token counts.
5. error: code and message, then close. A refund occurs if no delta was sent.
Server requirements: heartbeat comment every 15 seconds, cancel the upstream model call when the client disconnects, persist the assistant message in a final state even on partial failure (marked incomplete), disable proxy buffering.

## Rate limits (starting values, tune with load tests)
Per user: 30 messages per hour, 2 concurrent streams. Per IP: 120 requests per minute. Auth endpoints: 10 attempts per 15 minutes per IP and per account. Feedback: 10 per hour. Uploads: per D14.
