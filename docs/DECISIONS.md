# Decisions the owner must confirm before Codex starts

Codex must not choose any of these. Defaults are proposals, not approvals.

| ID | Decision | Proposed default | Why it matters |
|----|----------|------------------|----------------|
| D1 | Auth system | SuperTokens self-hosted (core as a container with its own database): email and password, email verification, reset. Google sign-in optional. | Verify in Milestone 0: current licence, Python and Next.js SDK support, session handling. If it fails, fall back to Ory Kratos. |
| D2 | Host | Render first; all services containerised | Check the nearest region. Latency to Uganda may be high. |
| D3 | Free allowance | 20 prompts per account, lifetime, no reset | Frontend shows "X of 20 free prompts left". A monthly reset changes the ledger design. |
| D4 | What counts as a prompt | One user request that calls the model: a chat message or a drafting prefill. Rendering a template and downloading are free. | Defines the ledger. |
| D5 | Aborted generations | Prompt is consumed once the first token is sent. Refunded on any server error before the first token. | Prevents abuse by cancelling. |
| D6 | Plans and prices | Not defined. Needs names, price in UGX, prompt allowance, duration. | Billing cannot be built without it. |
| D7 | Payment provider | One of Flutterwave, Pesapal, DPO | Must support MTN MoMo and Airtel Money. Verify sandbox access and webhook signing. |
| D8 | Referral reward | None in v1: share link only, no backend | A reward invites fraud. If wanted: +5 prompts to both after the invitee verifies email, capped at 5 rewards per user. |
| D9 | Corpus sources | Not defined | See RISKS.md R3. Blocks Milestone 3. |
| D10 | Embedding model | Chosen by benchmark in Milestone 0, not by preference | Needs 200+ real query to correct-section pairs from advocates. |
| D11 | Languages | English only in v1. Luganda and Swahili input is detected and answered with a polite English-only notice. | Quality in other languages is untested. |
| D12 | Data residency and retention | Counsel decides: where data may live, whether prompts may go to a US-based model provider, how long conversations are kept. | Data Protection and Privacy Act 2019 questions. Not an engineering call. |
| D13 | Support channel | One support email | Feedback form delivers there. |
| D14 | Upload limits | 10 MB, 30 pages, PDF and DOCX only, 5 uploads per day, 50 MB storage per user | Cost and abuse control. |
| D15 | Quota cost of a document question | 1 prompt under 15 pages, 2 above. Owner decides whether free users may upload at all. | Defines the ledger for uploads. |
| D16 | Upload retention | 30 days, or earlier on deletion | Privacy. Pending D12. |
| D17 | Sensitive document types | Warn on ID documents and bank statements, do not block | Pending counsel. |
