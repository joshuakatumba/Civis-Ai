"""FAKE – development only: public owner-content mechanism and production refusal."""
import httpx
import pytest
from civis.config import Settings
from civis.legal import legal_documents
from civis.main import create_app


async def test_public_fake_documents_are_explicitly_labelled():
    app = create_app(Settings.from_env().model_copy(update={'load_fake_seed': True}))
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),
                                     base_url='http://localhost:58000') as client:
            for document in ('terms', 'privacy'):
                result = await client.get('/v1/legal/' + document)
                assert result.status_code == 200
                assert result.json()['is_fake'] is True
                assert result.json()['text'] == 'FAKE – development only'


def test_fake_owner_content_file_refused_in_production():
    settings = Settings.from_env().model_copy(update={
        'environment': 'production', 'legal_content_file': 'content/dev-fake/legal.json',
    })
    with pytest.raises(ValueError, match='Fake legal content'):
        legal_documents(settings)
