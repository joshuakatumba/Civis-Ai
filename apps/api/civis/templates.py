"""Small authenticated catalog and owner-scoped server document rendering."""

import asyncio
import base64
import html
import io
import json
import re
import zipfile
from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import Annotated, Any, Literal
from uuid import NAMESPACE_URL, UUID, uuid4, uuid5

import boto3
from botocore.config import Config
from Crypto.Cipher import AES
from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from civis.config import Settings
from civis.main import Profile, StrictModel


class TemplateField(StrictModel):
    key: str = Field(pattern=r"^[a-z][a-z0-9_]*$", max_length=50)
    label: str = Field(min_length=1, max_length=200)
    example: str = Field(max_length=4000)
    max_length: int = Field(ge=1, le=4000)


class SeedTemplate(StrictModel):
    slug: str = Field(pattern=r"^[a-z0-9-]+$", max_length=200)
    title: str = Field(min_length=1, max_length=200)
    category: str = Field(min_length=1, max_length=100)
    label: Literal["FAKE – development only"]
    fields: list[TemplateField] = Field(min_length=1, max_length=50)
    body: list[list[str]] = Field(max_length=100)


class RenderRequest(StrictModel):
    values: dict[str, str] = Field(max_length=50)
    format: Literal["html", "docx"]
    conversation_id: Annotated[UUID, Field(strict=False)] | None = None


class Ticket(StrictModel):
    category: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: Annotated[UUID, Field(strict=False)] | None = None


class TemplateSummary(BaseModel):
    slug: str
    title: str
    category: str
    is_fake: bool


class TemplateDetail(TemplateSummary):
    version: int
    status: str
    fields: list[TemplateField]


class TemplatePage(BaseModel):
    items: list[TemplateSummary]
    total: int
    next_cursor: int | None


class DocumentResult(BaseModel):
    id: UUID
    name: str
    slug: str
    fields: list[TemplateField]
    values: dict[str, str]
    filename: str
    html: str


async def seed_templates(engine: AsyncEngine, settings: Settings) -> None:
    if settings.environment == "production" or not settings.load_fake_seed:
        raise ValueError("Development seed prohibited")
    records = json.loads(
        (Path(__file__).resolve().parents[3] / "content/dev-fake/templates.json").read_text()
    )
    async with engine.begin() as connection:
        for record in records:
            item = SeedTemplate.model_validate(record)
            tid = uuid5(NAMESPACE_URL, "civis:fake-template:" + item.slug)
            vid = uuid5(tid, "1")
            await connection.execute(
                text("""INSERT INTO templates(id,slug,title,category)
                VALUES (:id,:slug,:title,:category) ON CONFLICT (slug) DO NOTHING"""),
                {"id": tid, "slug": item.slug, "title": item.title, "category": item.category},
            )
            await connection.execute(
                text("""INSERT INTO template_versions
                (id,template_id,version,fields,body,is_fake,status)
                VALUES (:id,:template,1,CAST(:fields AS jsonb),CAST(:body AS jsonb),true,'draft')
                ON CONFLICT (template_id,version) DO NOTHING"""),
                {
                    "id": vid,
                    "template": tid,
                    "fields": json.dumps([f.model_dump() for f in item.fields]),
                    "body": json.dumps(item.body),
                },
            )
            await connection.execute(
                text("""INSERT INTO content_provenance(id,source,is_fake,approved,enabled)
                VALUES (:id,'FAKE – development only',true,false,true)
                ON CONFLICT (id) DO NOTHING"""),
                {"id": vid},
            )


def render_parts(
    template: dict[str, Any], values: dict[str, str]
) -> list[tuple[str, list[tuple[str, bool]]]]:
    fields = [TemplateField.model_validate(f) for f in template["fields"]]
    if set(values) != {f.key for f in fields} or any(
        len(values[f.key]) > f.max_length for f in fields
    ):
        raise HTTPException(422, "validation_failed")
    output = []
    for heading, paragraph in template["body"]:
        segments = []
        for index, piece in enumerate(re.split(r"\{([a-z][a-z0-9_]*)\}", paragraph)):
            if index % 2:
                if piece not in values:
                    raise HTTPException(503, "internal")
                segments.append((values[piece], True))
            else:
                segments.append((piece, False))
        output.append((heading, segments))
    return output


def render_html(title: str, parts: list[tuple[str, list[tuple[str, bool]]]]) -> str:
    result = "<h3>" + html.escape(title.upper()) + "</h3>"
    for heading, segments in parts:
        result += "<div>" + ("<h4>" + html.escape(heading) + "</h4>" if heading else "") + "<p>"
        for value, filled in segments:
            escaped = html.escape(value)
            result += '<span class="v">' + escaped + "</span>" if filled else escaped
        result += "</p></div>"
    return result


def render_word(title: str, parts: list[tuple[str, list[tuple[str, bool]]]]) -> bytes:
    # Minimal OOXML, all text escaped; same title, headings and segments as preview.
    paragraphs = [title.upper()]
    for heading, segments in parts:
        if heading:
            paragraphs.append(heading)
        paragraphs.append("".join(value for value, _ in segments))
    body = "".join(
        '<w:p><w:r><w:t xml:space="preserve">' + html.escape(p) + "</w:t></w:r></w:p>"
        for p in paragraphs
    )
    file = io.BytesIO()
    with zipfile.ZipFile(file, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            "[Content_Types].xml",
            (
                '<?xml version="1.0"?>'
                '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                '<Default Extension="rels" '
                'ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                '<Override PartName="/word/document.xml" '
                'ContentType="application/vnd.openxmlformats-officedocument.'
                'wordprocessingml.document.main+xml"/>'
                "</Types>"
            ),
        )
        archive.writestr(
            "_rels/.rels",
            (
                '<?xml version="1.0"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                '<Relationship Id="rId1" '
                'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/'
                'officeDocument" Target="word/document.xml"/>'
                "</Relationships>"
            ),
        )
        archive.writestr(
            "word/document.xml",
            (
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                "<w:body>"
            )
            + body
            + "<w:sectPr/></w:body></w:document>",
        )
    return file.getvalue()


def encryption_key(settings: Settings) -> bytes:
    if not settings.document_encryption_key:
        raise HTTPException(503, "internal")
    try:
        key = base64.b64decode(settings.document_encryption_key.get_secret_value(), validate=True)
        if len(key) != 32:
            raise ValueError()
        return key
    except ValueError:
        raise HTTPException(503, "internal") from None


def encrypt(settings: Settings, values: dict[str, str]) -> bytes:
    cipher = AES.new(encryption_key(settings), AES.MODE_GCM, nonce=None)
    ciphertext, tag = cipher.encrypt_and_digest(json.dumps(values).encode())
    return bytes(cipher.nonce) + bytes(tag) + bytes(ciphertext)


def decrypt(settings: Settings, data: bytes) -> dict[str, str]:
    cipher = AES.new(encryption_key(settings), AES.MODE_GCM, nonce=data[:16])
    decoded = cipher.decrypt_and_verify(data[32:], data[16:32])
    return dict(json.loads(decoded))


def install_templates(
    app: FastAPI,
    engine: AsyncEngine,
    settings: Settings,
    current_dependency: Callable[..., Awaitable[Profile]],
) -> None:
    Current = Annotated[Profile, Depends(current_dependency)]
    config = Config(
        region_name="us-east-1", signature_version="s3v4", s3={"addressing_style": "path"}
    )
    arguments = {
        "aws_access_key_id": settings.s3_access_key.get_secret_value(),
        "aws_secret_access_key": settings.s3_secret_key.get_secret_value(),
        "config": config,
    }
    storage = boto3.client("s3", endpoint_url=settings.s3_endpoint, **arguments)
    public_storage = boto3.client(
        "s3", endpoint_url=settings.s3_public_endpoint or settings.s3_endpoint, **arguments
    )
    visible = "(v.status='approved' AND NOT v.is_fake)"
    if settings.environment != "production" and settings.allow_unapproved_templates:
        visible = "true"
    catalog = (
        """SELECT t.slug,t.title,t.category,v.id AS version_id,v.version,v.fields,v.body,
        v.status,v.is_fake FROM templates t JOIN template_versions v ON v.template_id=t.id
        WHERE """
        + visible
        + """ AND v.version=(SELECT max(v2.version) FROM template_versions v2
        WHERE v2.template_id=t.id) AND EXISTS (SELECT 1 FROM users
        WHERE id=:owner AND deleted_at IS NULL)"""
    )

    async def template_for(slug: str, owner: UUID) -> dict[str, Any]:
        async with engine.connect() as connection:
            row = (
                (
                    await connection.execute(
                        text(catalog + " AND t.slug=:slug"), {"owner": owner, "slug": slug}
                    )
                )
                .mappings()
                .one_or_none()
            )
        if row is None:
            raise HTTPException(404, "not_found")
        return dict(row)

    async def owned_conversation(connection: Any, conversation: UUID | None, owner: UUID) -> None:
        if conversation is not None and not await connection.scalar(
            text("""SELECT id FROM conversations
            WHERE id=:id AND user_id=:owner AND deleted_at IS NULL"""),
            {"id": conversation, "owner": owner},
        ):
            raise HTTPException(404, "not_found")

    @app.get("/v1/templates/categories")
    async def categories(current: Current) -> dict[str, Any]:
        async with engine.connect() as connection:
            rows = (
                (
                    await connection.execute(
                        text(
                            "SELECT category AS name,count(*) AS count FROM ("
                            + catalog
                            + ") catalog GROUP BY category ORDER BY category"
                        ),
                        {"owner": current.id},
                    )
                )
                .mappings()
                .all()
            )
        return {"items": [dict(r) for r in rows], "total": sum(r["count"] for r in rows)}

    @app.get("/v1/templates", response_model=TemplatePage)
    async def listing(
        current: Current,
        q: str = Query(default="", max_length=200),
        category: str = Query(default="", max_length=100),
        limit: int = Query(default=9, ge=1, le=100),
        cursor: int = Query(default=0, ge=0),
    ) -> TemplatePage:
        query = (
            catalog
            + " AND (:category='' OR t.category=:category) AND strpos(lower(t.title),lower(:q))>0"
        )
        params = {
            "owner": current.id,
            "category": category,
            "q": q,
            "limit": limit,
            "offset": cursor,
        }
        async with engine.connect() as connection:
            total = int(
                await connection.scalar(
                    text("SELECT count(*) FROM (" + query + ") catalog"), params
                )
                or 0
            )
            rows = (
                (
                    await connection.execute(
                        text(query + " ORDER BY t.title,t.slug LIMIT :limit OFFSET :offset"), params
                    )
                )
                .mappings()
                .all()
            )
        return TemplatePage(
            items=[TemplateSummary.model_validate(r) for r in rows],
            total=total,
            next_cursor=cursor + limit if cursor + limit < total else None,
        )

    @app.get("/v1/templates/{slug}", response_model=TemplateDetail)
    async def detail(slug: str, current: Current) -> TemplateDetail:
        return TemplateDetail.model_validate(await template_for(slug, current.id))

    @app.post("/v1/templates/{slug}/render")
    async def render(slug: str, body: RenderRequest, current: Current) -> dict[str, Any]:
        template = await template_for(slug, current.id)
        parts = render_parts(template, body.values)
        preview = render_html(template["title"], parts)
        async with engine.connect() as connection:
            await owned_conversation(connection, body.conversation_id, current.id)
        if body.format == "html":
            return {"html": preview}
        identifier = uuid4()
        filename = re.sub(r"[^A-Za-z0-9]+", "_", template["title"]) + ".docx"
        key = f"{current.id}/{identifier}.docx"
        encrypted = encrypt(settings, body.values)
        await asyncio.to_thread(
            storage.put_object,
            Bucket=settings.s3_bucket,
            Key=key,
            Body=render_word(template["title"], parts),
            ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ContentDisposition=f'attachment; filename="{filename}"',
        )
        try:
            async with engine.begin() as connection:
                await owned_conversation(connection, body.conversation_id, current.id)
                await connection.execute(
                    text("""INSERT INTO documents
                    (id,user_id,conversation_id,template_version_id,encrypted_values,storage_key,filename)
                    VALUES (:id,:owner,:conversation,:version,:values,:key,:filename)"""),
                    {
                        "id": identifier,
                        "owner": current.id,
                        "conversation": body.conversation_id,
                        "version": template["version_id"],
                        "values": encrypted,
                        "key": key,
                        "filename": filename,
                    },
                )
                if body.conversation_id:
                    await connection.execute(
                        text("""INSERT INTO messages
                        (id,conversation_id,role,content,status,document_id,created_at) VALUES
                        (:user,:conversation,'user','Generate the draft','complete',NULL,now()),
                        (:reply,:conversation,'assistant','Your draft is ready.','complete',NULL,
                        now()+interval '1 microsecond'),
                        (:file,:conversation,'assistant',:title,'complete',:document,
                        now()+interval '2 microseconds')"""),
                        {
                            "user": uuid4(),
                            "reply": uuid4(),
                            "file": uuid4(),
                            "conversation": body.conversation_id,
                            "title": template["title"],
                            "document": identifier,
                        },
                    )
                    await connection.execute(
                        text("""UPDATE conversations SET updated_at=now(),
                        title=CASE WHEN title='' THEN :title ELSE title END
                        WHERE id=:id AND user_id=:owner"""),
                        {
                            "id": body.conversation_id,
                            "owner": current.id,
                            "title": template["title"],
                        },
                    )
        except BaseException:
            await asyncio.to_thread(storage.delete_object, Bucket=settings.s3_bucket, Key=key)
            raise
        return {
            "id": str(identifier),
            "name": template["title"],
            "slug": slug,
            "filename": filename,
            "html": preview,
            "fields": template["fields"],
            "values": body.values,
        }

    async def document_for(identifier: UUID, owner: UUID) -> dict[str, Any]:
        async with engine.connect() as connection:
            row = (
                (
                    await connection.execute(
                        text("""SELECT d.*,t.title,t.slug,v.fields,v.body FROM documents d
                JOIN template_versions v ON v.id=d.template_version_id
                JOIN templates t ON t.id=v.template_id
                WHERE d.id=:id AND d.user_id=:owner"""),
                        {"id": identifier, "owner": owner},
                    )
                )
                .mappings()
                .one_or_none()
            )
        if row is None:
            raise HTTPException(404, "not_found")
        return dict(row)

    @app.get("/v1/documents/{identifier}", response_model=DocumentResult)
    async def document(identifier: UUID, current: Current) -> DocumentResult:
        row = await document_for(identifier, current.id)
        values = decrypt(settings, row["encrypted_values"])
        return DocumentResult(
            id=row["id"],
            name=row["title"],
            slug=row["slug"],
            fields=row["fields"],
            values=values,
            filename=row["filename"],
            html=render_html(row["title"], render_parts(row, values)),
        )

    @app.get("/v1/documents/{identifier}/download")
    async def download(identifier: UUID, current: Current) -> RedirectResponse:
        row = await document_for(identifier, current.id)
        url = public_storage.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": row["storage_key"]},
            ExpiresIn=300,
        )
        return RedirectResponse(url, headers={"Cache-Control": "no-store"})

    @app.post("/v1/feedback", status_code=204)
    async def feedback(body: Ticket, current: Current) -> Response:
        async with engine.begin() as connection:
            await owned_conversation(connection, body.conversation_id, current.id)
            await connection.execute(
                text("""INSERT INTO feedback_tickets(id,user_id,category,message,conversation_id)
                VALUES (:id,:owner,:category,:message,:conversation_id)"""),
                {"id": uuid4(), "owner": current.id, **body.model_dump()},
            )
        return Response(status_code=204)
