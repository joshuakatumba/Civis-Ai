# Laws.Africa Uganda access check — 2026-11-09

Owner supplied a platform key and proposed Laws.Africa as the Uganda source.
The key is stored only in the ignored private .env as LAWS_AFRICA_API_KEY.
No key, passage text, case summary or statute text is committed here.

## Verified against the live API

- GET https://api.laws.africa/ai/v1/knowledge-bases: HTTP 200.
- Uganda collections returned: legislation-ug and judgments-ug, both labelled preview.
- GET metadata for each Uganda collection: HTTP 200.
- POST retrieve for each collection with a short topical query and top_k=2: HTTP 200, two results each.
- Legislation request used principal=true, repealed=false, frbr_place=ug filters.
- Results provided text plus source metadata: public URL, expression date, source identifier;
  legislation also supplied portion/section URLs and lifecycle flags. Judgment results in this
  sample were summaries, not proof of complete judgment text or complete case coverage.
- Returned text was used only for the access check and was not saved to the repository.
- These checks prove access, not retrieval accuracy, completeness, legal correctness or production entitlement.

## Proposed integration, pending owner architecture choice

Civis server -> Laws.Africa Uganda Knowledge Bases -> bounded source context -> Groq ->
claim/citation verification -> existing chat and persisted source links.
Use only Uganda collection codes and validate country metadata. Keep credentials on the server.
No local embeddings, scraping or corpus ingestion is needed for this hosted retrieval path.
That replaces the local hybrid/vector/reranker pipeline in RAG_AND_GUARDRAILS.md and the
local embedding benchmark decision D10; approval was requested before changing those requirements.
Grounding still needs follow-up query handling, failure/quota handling, source identifiers,
per-claim support checks, linked citations, no-source behavior and advocate evaluation.
Hosted retrieval does not establish legal accuracy or remove the need for relevance labels.
No retrieval integration is enabled in chat by this access check.

## Official documentation checked

- [Authentication](https://developers.laws.africa/get-started/authentication): Bearer API key; access depends on account services/plan.
- [API choice](https://developers.laws.africa/get-started/choose-an-api): Knowledge Bases maintain retrieval/indexes; Content API supports full local copies.
- [Quick start](https://developers.laws.africa/knowledge-bases/quick-start): v1 collection listing and retrieval contract, filters, results/metadata.
- [Plans](https://developers.laws.africa/get-started/pricing): distinguishes evaluation from production use; actual account plan/production terms not verified.

The proposed path is Knowledge Bases, not full Content API corpus replication.
Review account limits/terms before launch. Rotate the chat-shared key in the platform and replace
its single .env entry; no code change should be needed for replacement.
