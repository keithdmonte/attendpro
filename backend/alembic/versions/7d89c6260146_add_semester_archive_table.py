"""add_semester_archive_table

Revision ID: 7d89c6260146
Revises: 3b2babdaa2f9
Create Date: 2025-12-06 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d89c6260146'
down_revision: Union[str, None] = '3b2babdaa2f9'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Create semester_archives table
    op.create_table('semester_archives',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('semester_name', sa.String(length=100), nullable=False),
        sa.Column('archived_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('total_students', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_subjects', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_attendance_records', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_messages', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_semester_archives_id'), 'semester_archives', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_semester_archives_id'), table_name='semester_archives')
    op.drop_table('semester_archives')
