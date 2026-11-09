"""Persist only source metadata alongside verified answers; no retrieved passage cache."""

from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TABLE messages ADD COLUMN citations jsonb NOT NULL DEFAULT '[]'")


def downgrade():
    op.execute("ALTER TABLE messages DROP COLUMN citations")
