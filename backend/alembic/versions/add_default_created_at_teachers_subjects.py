"""add default for created_at on teachers and subjects

Revision ID: add_default_created_at
Revises: f1112a7b72f9
Create Date: 2026-03-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_default_created_at"
down_revision: Union[str, Sequence[str], None] = "f1112a7b72f9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "teachers",
        "created_at",
        server_default=sa.text("now()"),
        existing_type=sa.DateTime(),
    )
    op.alter_column(
        "subjects",
        "created_at",
        server_default=sa.text("now()"),
        existing_type=sa.DateTime(),
    )


def downgrade() -> None:
    op.alter_column(
        "teachers",
        "created_at",
        server_default=None,
        existing_type=sa.DateTime(),
    )
    op.alter_column(
        "subjects",
        "created_at",
        server_default=None,
        existing_type=sa.DateTime(),
    )
