"""add subject class_name and messages table

Revision ID: 5cdfc527d9ea
Revises: add_class_fields
Create Date: 2025-01-20 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5cdfc527d9ea'
down_revision: Union[str, None] = 'add_class_fields'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Add class_name to subjects table
    op.add_column('subjects', sa.Column('class_name', sa.String(length=50), nullable=True))
    op.create_index(op.f('ix_subjects_class_name'), 'subjects', ['class_name'], unique=False)
    
    # Create messages table
    op.create_table('messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('sender_type', sa.String(length=20), nullable=False),
        sa.Column('message', sa.String(length=500), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_id'), 'messages', ['id'], unique=False)


def downgrade() -> None:
    # Drop messages table
    op.drop_index(op.f('ix_messages_id'), table_name='messages')
    op.drop_table('messages')
    
    # Remove class_name from subjects
    op.drop_index(op.f('ix_subjects_class_name'), table_name='subjects')
    op.drop_column('subjects', 'class_name')
