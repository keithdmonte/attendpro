"""create students table

Revision ID: fb109858aa1e
Revises: 
Create Date: 2025-08-18 17:56:08.094051

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'fb109858aa1e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema. No-op: 88d404b00105 creates the students table."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
