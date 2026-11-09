# Core product testing

Owner scope, 2026-11-09: real Groq chat, existing counsel-approved testing templates, and existing per-conversation memory. No new frontend dependencies or redesign.

## Configure

Edit the existing private .env; do not replace database/storage credentials. Never commit it.

```dotenv
LLM_PROVIDER=groq
FAKE_MODEL=false
GROQ_API_KEY=YOUR_KEY
LLM_MODEL=openai/gpt-oss-20b
OWNER_TEMPLATES_FILE=content/owner-supplied/templates.json
ALLOW_UNAPPROVED_TEMPLATES=false
LLM_HISTORY_MAX_CHARS=24000
```

Key, model and provider are server environment settings; no key is in frontend code or repository content.
The owner-pasted key was configured privately for local testing; rotate it because it was shared in chat.
Groq model availability is account-dependent; this model was returned by the account's model-list API.

Start/update the app with `sudo ./scripts/dev.sh`. It builds API/web/worker and imports the 62 original templates unchanged.
For only a key change, edit .env and run `sudo docker compose up -d --force-recreate api worker`.

## Memory

All chat messages are saved in Postgres under their conversation/owner. Reloading restores them.
Each model request receives up to the newest 60 completed, non-file messages, bounded by LLM_HISTORY_MAX_CHARS.
Old messages remain stored even when outside that request budget. No automatic summarization, cross-chat profile memory or training is implemented.
Incomplete/blocked messages and file-card titles are not supplied as normal answer history.
Generated documents and their encrypted values reopen from the server. Unsubmitted form edits/template selection are still browser state until generation.

## Templates

The template catalog is mechanically extracted from the owner-supplied Civis.jsx. Its wording, fields and category mapping are preserved.
Source hash and the owner's testing approval are recorded in content/owner-supplied/templates.json and content provenance.
The importer is idempotent. New drafts no longer hide the most recent approved version.
Owner approval is not applied to the separate FAKE seed corpus/legal records.

## Limits

This gives real model chat and original template form/preview/Word flows for testing.
Verified legal RAG, citations, natural-language template prefill and unfinished-form persistence remain separate work.
The app does not yet have cross-chat memory or document-upload analysis.
