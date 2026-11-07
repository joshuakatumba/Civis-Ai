"""FAKE – development only. All storage and auth integrations use real local services."""

from uuid import uuid4

import pytest
from civis.config import Settings
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


@pytest.fixture
async def database():
    settings = Settings.from_env()
    engine = create_async_engine(
        settings.database_url.get_secret_value(),
        pool_size=10,
        max_overflow=20,
        hide_parameters=True,
    )
    yield engine
    await engine.dispose()


async def create_fake_user(database):
    owner = uuid4()
    async with database.begin() as connection:
        await connection.execute(
            text("""INSERT INTO users(id, auth_user_id, email, name)
            VALUES (:id, :auth, :email, 'FAKE – development only')"""),
            {"id": owner, "auth": "FAKE-" + str(owner), "email": f"FAKE-{owner}@example.invalid"},
        )
        await connection.execute(
            text("INSERT INTO usage_balance(user_id) VALUES (:id)"), {"id": owner}
        )
    return owner


@pytest.fixture
async def fake_user(database):
    return await create_fake_user(database)


@pytest.fixture
async def other_user(database):
    return await create_fake_user(database)
