"""Hosted Uganda retrieval and buffered, source-checked generation. No legal wording."""

import asyncio
import hashlib
import json
import re
from collections.abc import AsyncGenerator
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Protocol
from urllib.parse import urlsplit

import httpx
from pydantic import BaseModel, ConfigDict, Field

from civis.config import Settings
from civis.providers import (
    ModelEvent,
    ModelProvider,
    ProviderRateLimited,
    ProviderUnavailable,
    Turn,
)


class Source(BaseModel):
    id: str
    text: str
    title: str
    url: str
    date: str
    knowledge_base: str

    def citation(self) -> dict[str, str]:
        return self.model_dump(exclude={"text"})


class Retriever(Protocol):
    async def retrieve(self, query: str) -> list[Source]: ...


class Content(BaseModel):
    text: str = Field(max_length=500000)


class Metadata(BaseModel):
    work_frbr_uri: str
    expression_frbr_uri: str
    expression_date: date
    frbr_country: str
    title: str
    public_url: str
    portion_public_url: str | None = None
    portion_id: str | None = None
    portion_title: str | None = None
    portion_type: str | None = None
    repealed: bool | None = None
    principal: bool | None = None
    commenced: bool | None = None


class Hit(BaseModel):
    content: Content
    metadata: Metadata


class Results(BaseModel):
    results: list[Hit] = Field(max_length=100)


class LawsAfricaRetriever:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def retrieve(self, query: str) -> list[Source]:
        settings = self.settings
        if not settings.laws_africa_api_key:
            raise ProviderUnavailable()
        token = settings.laws_africa_api_key.get_secret_value()
        async with httpx.AsyncClient(timeout=httpx.Timeout(30, connect=10)) as client:

            async def fetch(code: str) -> list[Source]:
                payload: dict[str, object] = {"text": query, "top_k": settings.retrieval_top_k}
                if code == "legislation-ug":
                    payload["filters"] = {"principal": True, "repealed": False, "frbr_place": "ug"}
                chunks = bytearray()
                async with client.stream(
                    "POST",
                    settings.laws_africa_base_url.rstrip("/") + f"/knowledge-bases/{code}/retrieve",
                    headers={"Authorization": "Bearer " + token},
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        raise ProviderUnavailable()
                    async for chunk in response.aiter_bytes():
                        chunks.extend(chunk)
                        if len(chunks) > 2000000:
                            raise ProviderUnavailable()
                rows = Results.model_validate_json(bytes(chunks))
                sources = []
                for hit in rows.results:
                    m = hit.metadata
                    if m.frbr_country != "ug" or not m.work_frbr_uri.startswith("/akn/ug/"):
                        continue
                    if m.expression_date > datetime.now(UTC).date():
                        continue
                    if code == "legislation-ug" and (
                        m.repealed is not False
                        or m.principal is not True
                        or m.commenced is not True
                    ):
                        continue
                    url = m.portion_public_url or m.public_url
                    parsed = urlsplit(url)
                    if (
                        parsed.scheme != "https"
                        or parsed.hostname not in {"ulii.org", "www.ulii.org"}
                        or parsed.username
                        or parsed.password
                        or parsed.port not in (None, 443)
                        or not parsed.path.startswith("/akn/ug/")
                    ):
                        continue
                    if not hit.content.text.strip():
                        continue
                    identifier = hashlib.sha256(
                        (
                            code
                            + m.expression_frbr_uri
                            + "#"
                            + (m.portion_id or m.portion_type or "")
                        ).encode()
                    ).hexdigest()[:24]
                    sources.append(
                        Source(
                            id=identifier,
                            text=hit.content.text[:6000],
                            title=m.title + (" — " + m.portion_title if m.portion_title else ""),
                            url=url,
                            date=m.expression_date.isoformat(),
                            knowledge_base=code,
                        )
                    )
                return sources

            legislation, judgments = await asyncio.gather(
                fetch("legislation-ug"), fetch("judgments-ug")
            )
        # Provider scores use different scales between collections: interleave, never compare them.
        merged: dict[str, Source] = {}
        chars = 0
        for index in range(max(len(legislation), len(judgments))):
            for group in (legislation, judgments):
                if index >= len(group):
                    continue
                source = group[index]
                if source.id in merged or chars + len(source.text) > settings.retrieval_max_chars:
                    continue
                merged[source.id] = source
                chars += len(source.text)
        return list(merged.values())


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    source_id: str = Field(min_length=1, max_length=200)
    quote: str = Field(min_length=1, max_length=2000)


class Segment(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    text: str = Field(min_length=1, max_length=6000)
    source_ids: list[str] = Field(min_length=1, max_length=6)
    evidence: list[Evidence] = Field(min_length=1, max_length=6)


class Answer(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    segments: list[Segment] = Field(max_length=12)
    abstain: bool


class Verification(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    supported: list[int] = Field(max_length=12)


class GroundedProvider:
    def __init__(self, model: ModelProvider, retriever: Retriever):
        self.model = model
        self.retriever = retriever
        self.citations: list[dict[str, str]] = []
        self.input_tokens = self.output_tokens = 0

    async def collect(self, system: str, messages: list[Turn]) -> str:
        parts = []
        size = 0
        for attempt in range(2):
            try:
                async for event in self.model.stream(system, messages):
                    if event.kind == "text":
                        size += len(event.text)
                        if size > 32000:
                            raise ProviderUnavailable()
                        parts.append(event.text)
                    elif event.kind == "usage":
                        if event.finish_reason not in ("stop", "end_turn"):
                            raise ProviderUnavailable()
                        self.input_tokens += event.input_tokens
                        self.output_tokens += event.output_tokens
                break
            except ProviderRateLimited as error:
                if attempt or parts or error.retry_after > 15:
                    raise
                await asyncio.sleep(error.retry_after + 0.5)
        raw = "".join(parts).strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return raw

    async def stream(self, system: str, history: list[Turn]) -> AsyncGenerator[ModelEvent, None]:
        result = await asyncio.wait_for(self.generate(system, history), timeout=120)
        yield ModelEvent(kind="text", text=result)
        yield ModelEvent(
            kind="usage", input_tokens=self.input_tokens, output_tokens=self.output_tokens
        )

    async def generate(self, system: str, history: list[Turn]) -> str:
        questions = [turn.content for turn in history if turn.role == "user"]
        # Keep follow-up facts in retrieval without trusting prior model prose as authority.
        query = "\n".join(questions[-3:])[-4000:]
        sources = await self.retriever.retrieve(query)
        if not sources:
            raise ProviderUnavailable()
        context = json.dumps(
            [source.model_dump(exclude={"url", "knowledge_base"}) for source in sources],
            ensure_ascii=False,
        )
        prompts = Path(__file__).parent / "prompts"
        instruction = "\n" + (prompts / "research-grounded-v2.txt").read_text() + "\n" + context
        answer = Answer.model_validate_json(await self.collect(system + instruction, history))
        if answer.abstain or not answer.segments:
            raise ProviderUnavailable()
        by_id = {source.id: source for source in sources}
        for segment in answer.segments:
            if any(identifier not in by_id for identifier in segment.source_ids):
                raise ProviderUnavailable()
            if {item.source_id for item in segment.evidence} != set(segment.source_ids):
                raise ProviderUnavailable()
            if any(
                not item.quote.strip() or item.quote not in by_id[item.source_id].text
                for item in segment.evidence
            ):
                raise ProviderUnavailable()
            cited = [by_id[identifier] for identifier in segment.source_ids]
            if re.search(r"https?://|www\.", segment.text, re.I):
                raise ProviderUnavailable()
            for quote in re.findall(r'["“]([^"”]+)["”]', segment.text):
                if not any(quote in source.text for source in cited):
                    raise ProviderUnavailable()
        verification_prompt = (prompts / "research-verify-v2.txt").read_text()
        verification = Verification.model_validate_json(
            await self.collect(
                verification_prompt,
                [
                    Turn(
                        role="user",
                        content=json.dumps(
                            {
                                "segments": [
                                    {"index": index, **segment.model_dump()}
                                    for index, segment in enumerate(answer.segments)
                                ],
                                "user_messages": questions[-3:],
                                "sources": [
                                    source.model_dump(exclude={"url", "knowledge_base"})
                                    for source in sources
                                    if any(
                                        source.id in segment.source_ids
                                        for segment in answer.segments
                                    )
                                ],
                            }
                        ),
                    )
                ],
            )
        )
        if sorted(verification.supported) != list(range(len(answer.segments))):
            raise ProviderUnavailable()
        # Fail closed: no segment is released until the entire answer passes both checks.
        cited_ids = list(
            dict.fromkeys(
                identifier for segment in answer.segments for identifier in segment.source_ids
            )
        )
        self.citations = [by_id[identifier].citation() for identifier in cited_ids]
        numbers = {identifier: index + 1 for index, identifier in enumerate(cited_ids)}
        return "\n\n".join(
            segment.text
            + " "
            + " ".join(
                f"[{numbers[identifier]}]" for identifier in dict.fromkeys(segment.source_ids)
            )
            for segment in answer.segments
        )
