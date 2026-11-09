"""FAKE sources/claims only; real auth/Postgres/Redis for chat persistence and quota."""

import json

import pytest
from civis.providers import ModelEvent


class FakeRetriever:
    async def retrieve(self, query):
        from civis.research import Source

        return [
            Source(
                id="FAKE-source",
                text="FAKE blue marker.",
                title="FAKE source",
                url="https://ulii.org/akn/ug/FAKE",
                date="2026-01-01",
                knowledge_base="legislation-ug",
            )
        ]


class FakeStructuredModel:
    is_fake = True

    def __init__(self, bad_id=False, supported=True, bad_quote=False):
        self.calls = 0
        self.bad_id = bad_id
        self.supported = supported
        self.bad_quote = bad_quote

    async def stream(self, system, messages):
        self.calls += 1
        if self.calls == 1:
            value = {
                "segments": [
                    {
                        "text": 'FAKE "invented quotation"'
                        if self.bad_quote
                        else "FAKE blue marker.",
                        "source_ids": ["FAKE-missing" if self.bad_id else "FAKE-source"],
                    }
                ],
                "abstain": False,
            }
        else:
            value = {"supported": [0] if self.supported else []}
        yield ModelEvent(kind="text", text=json.dumps(value))
        yield ModelEvent(kind="usage", input_tokens=2, output_tokens=3)


async def test_grounded_answer_citations_reload_and_isolation(chat_clients):
    app, client, other = chat_clients
    app.state.retriever = FakeRetriever()
    app.state.model_provider = FakeStructuredModel()
    cid = (await client.post("/v1/conversations", json={"mode": "research"})).json()["id"]
    path = f"/v1/conversations/{cid}"
    result = await client.post(
        path + "/messages", json={"content": "FAKE marker?", "mode": "research"}
    )
    assert "event: done" in result.text and "FAKE blue marker." in result.text
    assert "https://ulii.org/akn/ug/FAKE" in result.text
    stored = (await client.get(path)).json()["messages"][-1]
    assert stored["status"] == "complete" and stored["citations"][0]["id"] == "FAKE-source"
    assert (await other.get(path)).status_code == 404
    assert (await client.get("/v1/me")).json()["prompts_left"] == 19
    assert app.state.model_provider.calls == 2


@pytest.mark.parametrize("failure", ["unknown_id", "unsupported", "bad_quote", "empty", "upstream"])
async def test_grounding_fails_closed_and_refunds(chat_clients, failure):
    app, client, _ = chat_clients
    app.state.retriever = FakeRetriever()
    app.state.model_provider = FakeStructuredModel(
        bad_id=failure == "unknown_id",
        supported=failure != "unsupported",
        bad_quote=failure == "bad_quote",
    )
    if failure in ["empty", "upstream"]:

        class EmptyRetriever:
            async def retrieve(self, query):
                if failure == "upstream":
                    raise RuntimeError("FAKE upstream")
                return []

        app.state.retriever = EmptyRetriever()
    cid = (await client.post("/v1/conversations", json={"mode": "research"})).json()["id"]
    result = await client.post(
        f"/v1/conversations/{cid}/messages", json={"content": "FAKE question", "mode": "research"}
    )
    assert "event: error" in result.text and "event: delta" not in result.text
    assert "FAKE blue marker." not in result.text
    assert (await client.get("/v1/me")).json()["prompts_left"] == 20
    stored = (await client.get(f"/v1/conversations/{cid}")).json()["messages"][-1]
    assert stored["status"] == "incomplete" and stored["citations"] == []


async def test_retrieval_filters_jurisdiction_links_and_lifecycle(chat_clients, monkeypatch):
    import httpx
    from civis.research import LawsAfricaRetriever
    from pydantic import SecretStr

    app, _, _ = chat_clients
    settings = app.state.settings.model_copy(
        update={"laws_africa_api_key": SecretStr("FAKE-token")}
    )
    seen = []

    def hit(**changes):
        metadata = {
            "work_frbr_uri": "/akn/ug/FAKE",
            "expression_frbr_uri": "/akn/ug/FAKE/eng@2026-01-01",
            "expression_date": "2026-01-01",
            "frbr_country": "ug",
            "title": "FAKE source",
            "public_url": "https://ulii.org/akn/ug/FAKE",
            "principal": True,
            "repealed": False,
            "commenced": True,
            "portion_id": "FAKE-1",
        }
        metadata.update(changes)
        return {"content": {"text": "FAKE blue marker."}, "metadata": metadata}

    def handler(request):
        payload = json.loads(request.content)
        seen.append((request.url.path, payload))
        assert request.headers["authorization"] == "Bearer FAKE-token"
        return httpx.Response(
            200,
            json={
                "results": [
                    hit(),
                    hit(),
                    hit(frbr_country="za"),
                    hit(repealed=True),
                    hit(public_url="https://ulii.org.evil.invalid/akn/ug/FAKE"),
                    hit(public_url="javascript:FAKE"),
                    hit(expression_date="2999-01-01"),
                    hit(commenced=False),
                ]
            },
        )

    client_type = httpx.AsyncClient
    monkeypatch.setattr(
        httpx,
        "AsyncClient",
        lambda **kwargs: client_type(**kwargs, transport=httpx.MockTransport(handler)),
    )
    sources = await LawsAfricaRetriever(settings).retrieve("FAKE query")
    # Judgment lifecycle flags are not legislation validity signals, so those remain eligible.
    assert sources and all(source.url == "https://ulii.org/akn/ug/FAKE" for source in sources)
    assert len([source for source in sources if source.knowledge_base == "legislation-ug"]) == 1
    legislation_request = next(payload for path, payload in seen if "legislation-ug" in path)
    assert legislation_request["filters"] == {
        "principal": True,
        "repealed": False,
        "frbr_place": "ug",
    }
