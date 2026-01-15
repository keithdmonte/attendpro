"""add_admin_table

Revision ID: f1112a7b72f9
Revises: 7d89c6260146
Create Date: 2025-12-06 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import hashlib


# revision identifiers, used by Alembic.
revision: str = 'f1112a7b72f9'
down_revision: Union[str, None] = '7d89c6260146'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Create admins table
    op.create_table('admins',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=200), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admins_email'), 'admins', ['email'], unique=True)
    op.create_index(op.f('ix_admins_id'), 'admins', ['id'], unique=False)
    
    # Create default admin with password "admin123"
    default_password = hashlib.sha256("admin123".encode()).hexdigest()
    op.execute(
        f"""
        INSERT INTO admins (email, password, name, created_at)
        VALUES ('admin@attendpro.com', '{default_password}', 'System Administrator', NOW())
        ON CONFLICT (email) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_admins_id'), table_name='admins')
    op.drop_index(op.f('ix_admins_email'), table_name='admins')
    op.drop_table('admins')
